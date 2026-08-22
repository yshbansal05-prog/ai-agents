import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.database import init_db, AsyncSessionLocal, CompanyModel
from app.orchestrator.company_graph import orchestrator
from app.memory.company_memory import CompanyMemoryManager
from app.agents.ceo_agent import CEO_SPEC
from app.agents.research_agent import RESEARCH_SPEC
from app.agents.cto_agent import CTO_SPEC
from app.agents.marketing_agent import MARKETING_SPEC
from app.agents.dev_agent import DEV_SPEC
from app.models.database import AgentModel

async def test_end_to_end():
    print("1. Initializing database schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # Create test company
        test_goal = "Build an autonomous AI drone delivery fleet for medical supplies"
        company = CompanyModel(
            name="AeroMed AI",
            goal=test_goal,
            status="INITIALIZING"
        )
        db.add(company)
        await db.commit()
        await db.refresh(company)

        # Add initial 5 agents
        for spec in [CEO_SPEC, RESEARCH_SPEC, CTO_SPEC, MARKETING_SPEC, DEV_SPEC]:
            agent = AgentModel(
                company_id=company.id,
                name=spec.name,
                role=spec.role,
                objective=spec.objective,
                status="WAITING",
                capabilities=spec.capabilities,
                dependencies=spec.dependencies
            )
            db.add(agent)
        await db.commit()
        print(f"2. Company created: ID={company.id}, Goal='{test_goal}'")

    print("3. Executing LangGraph Multi-Agent Pipeline...")
    await orchestrator.run_pipeline(company.id, test_goal)

    print("4. Inspecting results in database...")
    async with AsyncSessionLocal() as db:
        comp = await db.get(CompanyModel, company.id)
        print(f"   Company final status: {comp.status}")
        
        memories = await CompanyMemoryManager.get_memories(db, company.id)
        print(f"   Total memory artifacts saved: {len(memories)}")
        for m in memories:
            print(f"     - Key: {m['key']} | Category: {m['category']} | Agent: {m['agent_name']}")

        messages = await CompanyMemoryManager.get_messages(db, company.id)
        print(f"   Total inter-agent messages: {len(messages)}")
        for msg in messages:
            print(f"     - [{msg['sender_agent']} -> {msg['recipient_agent']}]: {msg['content'][:60]}...")

        search_res = await CompanyMemoryManager.search_memories(db, company.id, "drone fleet architecture")
        print(f"   Memory search for 'drone fleet architecture' matched: {len(search_res)} items")

        assert comp.status == "COMPLETED", "Company pipeline did not complete"
        assert len(memories) >= 5, "Memories count too low"
        assert len(messages) >= 3, "Inter-agent messages missing"

    print("\n[OK] ALL BACKEND MULTI-AGENT PIPELINE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_end_to_end())
