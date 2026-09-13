import os
import httpx
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.memory.company_memory import CompanyMemoryManager

logger = logging.getLogger("treasury_service")

class TreasuryPolicy:
    """Configurable organization treasury spending policy (Phase 10)."""
    PER_TRANSACTION_LIMIT: float = float(os.getenv("X402_PER_TX_LIMIT", "0.05"))
    DAILY_LIMIT: float = float(os.getenv("X402_DAILY_LIMIT", "0.50"))
    RESEARCH_AGENT_LIMIT: float = float(os.getenv("X402_RESEARCH_LIMIT", "0.20"))
    AUTO_APPROVE_BELOW: float = float(os.getenv("X402_AUTO_APPROVE_BELOW", "0.05"))

class TreasuryService:
    """Manages autonomous organization treasury expenditures via x402 on Algorand Testnet."""
    X402_SERVICE_URL: str = os.getenv("X402_SERVICE_URL", "http://localhost:8002")

    @classmethod
    async def evaluate_spending_policy(
        cls,
        db: AsyncSession,
        company_id: str,
        agent_name: str,
        amount: float
    ) -> Dict[str, Any]:
        """Evaluates whether an agent expenditure request satisfies organization policy."""
        summary = await CompanyMemoryManager.get_treasury_summary(db, company_id)
        current_spent = summary["total_spent"]

        # 1. Per transaction limit check
        if amount > TreasuryPolicy.PER_TRANSACTION_LIMIT:
            return {
                "approved": False,
                "reason": f"Amount ${amount:.2f} exceeds per-transaction limit of ${TreasuryPolicy.PER_TRANSACTION_LIMIT:.2f}"
            }

        # 2. Cumulative daily spend limit check
        if current_spent + amount > TreasuryPolicy.DAILY_LIMIT:
            return {
                "approved": False,
                "reason": f"Cumulative spend (${current_spent + amount:.2f}) exceeds daily cap of ${TreasuryPolicy.DAILY_LIMIT:.2f}"
            }

        # 3. Policy auto-approval check
        is_auto_approved = amount <= TreasuryPolicy.AUTO_APPROVE_BELOW
        return {
            "approved": True,
            "auto_approved": is_auto_approved,
            "budget_remaining": round(TreasuryPolicy.DAILY_LIMIT - current_spent - amount, 4),
            "reason": f"Approved under autonomous governance rule (<= ${TreasuryPolicy.AUTO_APPROVE_BELOW:.2f} auto-authorized)."
        }

    @classmethod
    async def purchase_paid_resource(
        cls,
        db: AsyncSession,
        company_id: str,
        agent_name: str,
        service_name: str,
        amount: float,
        domain: str
    ) -> Dict[str, Any]:
        """Executes the full x402 payment lifecycle with budget governance & on-chain settlement."""
        logger.info(f"[{agent_name}] Requesting ${amount:.2f} USDC for '{service_name}' ({domain})")

        now_iso = datetime.now(timezone.utc).isoformat()
        # Step 1: Initial Payment Request
        tx = await CompanyMemoryManager.record_treasury_transaction(
            db=db,
            company_id=company_id,
            agent_name=agent_name,
            service=service_name,
            amount=amount,
            recipient=os.getenv("X402_PAY_TO_ADDRESS", "ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA"),
            purpose=f"Acquiring premium verified market intelligence for: '{domain}'",
            status="REQUESTED",
            network="algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
            currency="USDC",
            facilitator="GoPlausible"
        )

        print(f"[TREASURY] REQUESTED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Timestamp={now_iso}")
        logger.info(f"[TREASURY] REQUESTED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Timestamp={now_iso}")

        await CompanyMemoryManager.log_activity(
            db, company_id, agent_name,
            f"Requested ${amount:.2f} USDC treasury disbursement for '{service_name}'.",
            "INFO"
        )

        # Step 2: Policy Evaluation (Phase 10 & 11)
        policy_result = await cls.evaluate_spending_policy(db, company_id, agent_name, amount)

        if not policy_result["approved"]:
            rej_time = datetime.now(timezone.utc).isoformat()
            print(f"[TREASURY] REJECTED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Reason={policy_result['reason']}, Timestamp={rej_time}")
            await CompanyMemoryManager.update_treasury_transaction(
                db, tx.id, status="REJECTED", metadata_json={"reason": policy_result["reason"]}
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                f"TREASURY POLICY REJECTED: {policy_result['reason']}",
                "WARNING"
            )
            return {"success": False, "error": policy_result["reason"]}

        # Step 3: Record Organizational Decision (Phase 11)
        appr_time = datetime.now(timezone.utc).isoformat()
        print(f"[TREASURY] APPROVED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Timestamp={appr_time}")
        logger.info(f"[TREASURY] APPROVED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Timestamp={appr_time}")

        await CompanyMemoryManager.update_treasury_transaction(
            db, tx.id, status="APPROVED", metadata_json=policy_result
        )
        await CompanyMemoryManager.record_decision(
            db=db,
            company_id=company_id,
            title=f"Treasury Authorization: {service_name}",
            decision=f"Authorize disbursement of ${amount:.2f} USDC via x402 on Algorand Testnet.",
            rationale=f"{policy_result['reason']} Budget remaining: ${policy_result.get('budget_remaining', 0.0):.2f} USDC.",
            made_by="CEO / Orchestrator Agent",
            context={"agent": agent_name, "service": service_name, "amount": amount, "network": "Algorand Testnet"}
        )
        await CompanyMemoryManager.log_activity(
            db, company_id, "CEO / Orchestrator Agent",
            f"TREASURY AUTHORIZED: ${amount:.2f} USDC approved for {agent_name} [{policy_result['reason']}].",
            "SUCCESS"
        )

        # Step 4: Dispatch x402 Payment via Node.js x402 Service (Phase 6 & 12)
        pend_time = datetime.now(timezone.utc).isoformat()
        print(f"[TREASURY] PAYMENT_PENDING: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Timestamp={pend_time}")
        logger.info(f"[TREASURY] PAYMENT_PENDING: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Timestamp={pend_time}")

        await CompanyMemoryManager.update_treasury_transaction(
            db, tx.id, status="PAYMENT_PENDING"
        )
        await CompanyMemoryManager.log_activity(
            db, company_id, agent_name,
            f"Initiating x402 HTTP challenge & Algorand Testnet transaction via GoPlausible Facilitator...",
            "INFO"
        )

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    f"{cls.X402_SERVICE_URL}/api/x402/pay-and-fetch",
                    json={"domain": domain}
                )
                res_data = res.json()

            # Handle settlement outcome
            tx_hash = res_data.get("tx_hash", "")
            is_settled = res_data.get("success", False) and bool(tx_hash)
            status = "SETTLED" if is_settled else "FAILED"

            await CompanyMemoryManager.update_treasury_transaction(
                db=db,
                tx_id=tx.id,
                status=status,
                tx_hash=tx_hash,
                metadata_json=res_data
            )

            if is_settled:
                settle_time = datetime.now(timezone.utc).isoformat()
                print(f"[TREASURY] SETTLED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, TxHash={tx_hash}, Timestamp={settle_time}")
                logger.info(f"[TREASURY] SETTLED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, TxHash={tx_hash}, Timestamp={settle_time}")
                log_msg = f"x402 PAYMENT SETTLED on Algorand Testnet (Tx: {tx_hash[:16]}...) [Facilitator: GoPlausible] [Duration: {res_data.get('duration_seconds', '0.6')}s]."
                await CompanyMemoryManager.log_activity(db, company_id, agent_name, log_msg, "SUCCESS")
                return {
                    "success": True,
                    "tx_hash": tx_hash,
                    "explorer_url": res_data.get("explorer_url", f"https://lora.algokit.io/testnet/transaction/{tx_hash}"),
                    "data": res_data.get("resource_data", {}).get("data", {})
                }
            else:
                fail_time = datetime.now(timezone.utc).isoformat()
                err_reason = res_data.get("settlement_details", {}).get("errorReason") or res_data.get("error") or "Settlement failed"
                print(f"[TREASURY] FAILED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Error={err_reason}, Timestamp={fail_time}")
                logger.warning(f"[TREASURY] FAILED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Error={err_reason}, Timestamp={fail_time}")
                await CompanyMemoryManager.log_activity(
                    db, company_id, agent_name,
                    f"x402 payment failed: {err_reason}",
                    "WARNING"
                )
                return {
                    "success": False,
                    "error": err_reason,
                    "tx_hash": "",
                    "data": None
                }

        except Exception as e:
            fail_time = datetime.now(timezone.utc).isoformat()
            print(f"[TREASURY] FAILED: Agent={agent_name}, Amount=${amount:.2f}, Asset=USDC, TxID={tx.id}, Error={str(e)}, Timestamp={fail_time}")
            logger.error(f"Error calling x402 payment service: {e}", exc_info=True)
            await CompanyMemoryManager.update_treasury_transaction(
                db, tx.id, status="FAILED", metadata_json={"error": str(e)}
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, agent_name,
                f"x402 payment execution failure: {str(e)}",
                "ERROR"
            )
            return {"success": False, "error": str(e)}
