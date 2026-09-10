import pytest
import os
from app.services.treasury_service import TreasuryService, TreasuryPolicy
from app.memory.company_memory import CompanyMemoryManager
from app.models.database import CompanyModel, TreasuryTransactionModel
from sqlalchemy.future import select

@pytest.mark.asyncio
async def test_treasury_policy_approval(db_session):
    company = CompanyModel(name="Policy Test Co", goal="Test treasury governance")
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    # 1. Under limit -> Approved
    res_under = await TreasuryService.evaluate_spending_policy(
        db_session, company.id, "Research Agent", 0.01
    )
    assert res_under["approved"] is True
    assert res_under["auto_approved"] is True

    # 2. Over per-transaction limit ($0.05) -> Rejected
    res_over_tx = await TreasuryService.evaluate_spending_policy(
        db_session, company.id, "Research Agent", 0.10
    )
    assert res_over_tx["approved"] is False
    assert "exceeds per-transaction limit" in res_over_tx["reason"]

    # 3. Simulate cumulative spend hitting daily cap ($0.50)
    for _ in range(5):
        await CompanyMemoryManager.record_treasury_transaction(
            db=db_session,
            company_id=company.id,
            agent_name="Research Agent",
            service="Market Data",
            amount=0.05,
            recipient="ALGORAND_TESTNET_PAYTO",
            purpose="Testing cumulative spend limit",
            status="SETTLED"
        )

    # Spend an additional 0.05 -> Should be rejected as cumulative spend > 0.50
    for _ in range(5):
        await CompanyMemoryManager.record_treasury_transaction(
            db=db_session,
            company_id=company.id,
            agent_name="Research Agent",
            service="Market Data",
            amount=0.05,
            recipient="ALGORAND_TESTNET_PAYTO",
            purpose="Testing cumulative spend limit",
            status="SETTLED"
        )

    res_cap = await TreasuryService.evaluate_spending_policy(
        db_session, company.id, "Research Agent", 0.05
    )
    assert res_cap["approved"] is False
    assert "exceeds daily cap" in res_cap["reason"]

@pytest.mark.asyncio
async def test_treasury_persistence_and_summary(db_session):
    company = CompanyModel(name="Summary Test Co", goal="Test treasury summary")
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    tx = await CompanyMemoryManager.record_treasury_transaction(
        db=db_session,
        company_id=company.id,
        agent_name="Research Agent",
        service="Premium Market Intelligence",
        amount=0.01,
        recipient="ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA",
        purpose="Competitor data",
        status="SETTLED",
        tx_hash="TEST_ALGO_TX_12345"
    )
    assert tx.id is not None
    assert tx.status == "SETTLED"
    assert tx.settled_at is not None

    summary = await CompanyMemoryManager.get_treasury_summary(db_session, company.id)
    assert summary["total_spent"] == 0.01
    assert summary["transaction_count"] == 1
    assert summary["currency"] == "USDC"
    assert len(summary["transactions"]) == 1
    assert summary["transactions"][0]["tx_hash"] == "TEST_ALGO_TX_12345"
