import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import CompanyModel, AgentModel, TaskModel
from app.memory.company_memory import CompanyMemoryManager

@pytest.mark.asyncio
async def test_memory_manager_crud(db_session: AsyncSession):
    # Setup company
    company = CompanyModel(
        name="Memory Test Corp",
        goal="Test enterprise memory systems",
        status="INITIALIZING"
    )
    db_session.add(company)
    await db_session.commit()
    await db_session.refresh(company)

    # 1. Add memory
    mem = await CompanyMemoryManager.add_memory(
        db_session,
        company_id=company.id,
        agent_name="Strategy / CTO Agent",
        key="TEST_ARCHITECTURE_SPEC",
        value={"arch": "Modular Monolith", "db": "PostgreSQL"},
        category="ARCHITECTURE"
    )
    assert mem.id is not None
    assert mem.key == "TEST_ARCHITECTURE_SPEC"

    # 2. Get memories
    memories = await CompanyMemoryManager.get_memories(db_session, company.id)
    assert len(memories) == 1
    assert memories[0]["category"] == "ARCHITECTURE"

    # 3. Log activity
    log = await CompanyMemoryManager.log_activity(
        db_session,
        company_id=company.id,
        agent_name="CEO",
        message="Strategic objective launched",
        level="INFO"
    )
    assert log.id is not None
    assert log.level == "INFO"

    # 4. Record decision
    decision = await CompanyMemoryManager.record_decision(
        db_session,
        company_id=company.id,
        title="Microservices vs Monolith",
        decision="Adopt Modular Monolith",
        rationale="Maximizes speed with strict boundaries",
        made_by="CEO",
        context={"speed_score": 9}
    )
    assert decision.id is not None
    assert decision.title == "Microservices vs Monolith"

    # 5. Add and get inter-agent messages
    msg = await CompanyMemoryManager.add_message(
        db_session,
        company_id=company.id,
        sender_agent="Research Agent",
        recipient_agent="CTO Agent",
        content="Market data attached: latency is #1 user priority.",
        type="DATA_HANDOFF"
    )
    assert msg.id is not None

    messages = await CompanyMemoryManager.get_messages(db_session, company.id)
    assert len(messages) == 1
    assert messages[0]["sender_agent"] == "Research Agent"

    # 6. Search memory
    search_results = await CompanyMemoryManager.search_memories(
        db_session,
        company_id=company.id,
        query="PostgreSQL Modular Monolith"
    )
    assert len(search_results) >= 1
    assert search_results[0]["key"] == "TEST_ARCHITECTURE_SPEC"
