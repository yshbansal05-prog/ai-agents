import json
import asyncio
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.database import (
    get_db, CompanyModel, AgentModel, TaskModel, MemoryModel, DecisionModel, ActivityLogModel, MessageModel
)
from app.models.schemas import (
    CompanyCreate, CompanyResponse, AgentSchema, TaskSchema, MemorySchema, DecisionSchema, ActivityLogSchema, MessageSchema
)
from app.memory.company_memory import CompanyMemoryManager
from app.orchestrator.company_graph import orchestrator
from app.services.event_manager import event_manager
from app.agents.ceo_agent import CEO_SPEC
from app.agents.research_agent import RESEARCH_SPEC
from app.agents.cto_agent import CTO_SPEC
from app.agents.marketing_agent import MARKETING_SPEC
from app.agents.dev_agent import DEV_SPEC
from app.agents.finance_agent import FINANCE_SPEC
from app.agents.product_agent import PRODUCT_SPEC
from app.agents.qa_agent import QA_SPEC
from app.agents.devops_agent import DEVOPS_SPEC
from app.agents.sales_agent import SALES_SPEC
from app.agents.legal_agent import LEGAL_SPEC

router = APIRouter(prefix="/api/company", tags=["Company AI Organization"])

@router.post("/create", response_model=Dict[str, Any])
async def create_company(payload: CompanyCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new company and initializes the 11 specialized AI agents across all departments."""
    company = CompanyModel(
        name=payload.name or "AI ORGANIZATION NULL POINTERS INC.",
        goal=payload.goal,
        status="INITIALIZING"
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)

    # Initialize all 11 organizational agents
    agent_specs = [
        CEO_SPEC,
        RESEARCH_SPEC,
        CTO_SPEC,
        MARKETING_SPEC,
        FINANCE_SPEC,
        DEV_SPEC,
        PRODUCT_SPEC,
        QA_SPEC,
        DEVOPS_SPEC,
        SALES_SPEC,
        LEGAL_SPEC
    ]
    for spec in agent_specs:
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

    # Initial system activity log
    log = ActivityLogModel(
        company_id=company.id,
        agent_name="System",
        message=f"Company initialized with goal: '{company.goal}'",
        level="INFO"
    )
    db.add(log)
    await db.commit()

    return {
        "company_id": company.id,
        "name": company.name,
        "goal": company.goal,
        "status": company.status
    }

@router.post("/{company_id}/run")
async def run_company(company_id: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Triggers the multi-agent execution pipeline in the background."""
    company = await db.get(CompanyModel, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    background_tasks.add_task(orchestrator.run_pipeline, company_id, company.goal)
    return {"message": "AI Organization pipeline execution started", "company_id": company_id}

@router.get("/treasury")
@router.get("/treasury/summary")
async def get_all_treasury(db: AsyncSession = Depends(get_db)):
    """Retrieves autonomous treasury expenditures and on-chain posture across the organization."""
    return await CompanyMemoryManager.get_treasury_summary(db, None)

@router.get("/{company_id}")
async def get_company(company_id: str, db: AsyncSession = Depends(get_db)):
    company = await db.get(CompanyModel, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Fetch final report if available
    mem_result = await db.execute(
        select(MemoryModel).where(
            MemoryModel.company_id == company_id,
            MemoryModel.key == "FINAL_EXECUTIVE_REPORT"
        )
    )
    final_mem = mem_result.scalars().first()
    final_report = final_mem.value if final_mem else None

    return {
        "id": company.id,
        "name": company.name,
        "goal": company.goal,
        "status": company.status,
        "final_report": final_report,
        "created_at": company.created_at.isoformat() if company.created_at else None
    }

@router.get("/{company_id}/report")
async def get_company_report(company_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves or synthesizes the full executive board report for the company."""
    company = await db.get(CompanyModel, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    mem_result = await db.execute(
        select(MemoryModel).where(
            MemoryModel.company_id == company_id,
            MemoryModel.key == "FINAL_EXECUTIVE_REPORT"
        )
    )
    final_mem = mem_result.scalars().first()

    tasks_res = await db.execute(select(TaskModel).where(TaskModel.company_id == company_id))
    tasks = tasks_res.scalars().all()
    dec_res = await db.execute(select(DecisionModel).where(DecisionModel.company_id == company_id))
    decisions = dec_res.scalars().all()
    agents_res = await db.execute(select(AgentModel).where(AgentModel.company_id == company_id))
    agents = agents_res.scalars().all()

    completed_tasks = sum(1 for t in tasks if t.status == "COMPLETED")
    progress_pct = int((completed_tasks / max(len(tasks), 1)) * 100) if tasks else 85

    return {
        "company_id": company.id,
        "name": company.name,
        "goal": company.goal,
        "status": company.status,
        "has_report": bool(final_mem),
        "progress_pct": progress_pct,
        "executive_summary": final_mem.value if final_mem else f"Autonomous enterprise operational for: '{company.goal}'. {len(agents)} departments deployed.",
        "department_metrics": {
            "total_agents": len(agents),
            "completed_tasks": completed_tasks,
            "total_tasks": len(tasks),
            "decisions_ratified": len(decisions)
        }
    }

@router.get("/{company_id}/agents")
async def get_agents(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AgentModel).where(AgentModel.company_id == company_id))
    agents = result.scalars().all()
    return [
        {
            "id": a.id,
            "company_id": a.company_id,
            "name": a.name,
            "role": a.role,
            "objective": a.objective,
            "status": a.status,
            "current_task": a.current_task,
            "capabilities": a.capabilities or [],
            "dependencies": a.dependencies or []
        }
        for a in agents
    ]

@router.get("/{company_id}/tasks")
async def get_tasks(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TaskModel).where(TaskModel.company_id == company_id))
    tasks = result.scalars().all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "assigned_agent": t.assigned_agent,
            "status": t.status,
            "priority": t.priority,
            "dependencies": t.dependencies or [],
            "result": t.result,
            "created_at": t.created_at.isoformat() if t.created_at else None
        }
        for t in tasks
    ]

@router.get("/{company_id}/memory")
async def get_memory(company_id: str, category: str = None, db: AsyncSession = Depends(get_db)):
    query = select(MemoryModel).where(MemoryModel.company_id == company_id)
    if category:
        query = query.where(MemoryModel.category == category)
    result = await db.execute(query)
    memories = result.scalars().all()
    return [
        {
            "id": m.id,
            "agent_name": m.agent_name,
            "key": m.key,
            "value": m.value,
            "category": m.category,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in memories
    ]

@router.get("/{company_id}/decisions")
async def get_decisions(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DecisionModel).where(DecisionModel.company_id == company_id))
    decisions = result.scalars().all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "decision": d.decision,
            "rationale": d.rationale,
            "made_by": d.made_by,
            "context": d.context or {},
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in decisions
    ]

@router.get("/{company_id}/activity")
async def get_activity(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ActivityLogModel)
        .where(ActivityLogModel.company_id == company_id)
        .order_by(ActivityLogModel.timestamp.asc())
    )
    logs = result.scalars().all()
    return [
        {
            "id": l.id,
            "agent_name": l.agent_name,
            "message": l.message,
            "level": l.level,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        }
        for l in logs
    ]

@router.get("/{company_id}/messages")
async def get_messages(company_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves inter-agent communication dialogue history."""
    return await CompanyMemoryManager.get_messages(db, company_id)

@router.post("/{company_id}/messages")
async def send_user_message(company_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Allows executive user to broadcast a directive or query to agents."""
    sender = payload.get("sender_agent", "Human Executive (Board)")
    recipient = payload.get("recipient_agent", "@All")
    content = payload.get("content", "")
    msg_type = payload.get("type", "DIRECTIVE")
    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    msg = await CompanyMemoryManager.add_message(db, company_id, sender, recipient, content, type=msg_type)
    return {
        "id": msg.id,
        "company_id": msg.company_id,
        "sender_agent": msg.sender_agent,
        "recipient_agent": msg.recipient_agent,
        "content": msg.content,
        "type": msg.type,
        "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
    }

@router.post("/{company_id}/treasury/{tx_id}/decide")
async def decide_treasury_tx(company_id: str, tx_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Allows Board to approve or veto an autonomous treasury expenditure."""
    action = payload.get("action", "APPROVE").upper()
    status = "SETTLED" if action == "APPROVE" else "REJECTED"
    await CompanyMemoryManager.update_treasury_transaction(db, tx_id, status=status)
    await CompanyMemoryManager.log_activity(
        db, company_id, "Board Governance",
        f"Board {action}D treasury transaction {tx_id[:8]}...",
        "SUCCESS" if action == "APPROVE" else "WARNING"
    )
    return {"status": status, "tx_id": tx_id, "action": action}

@router.post("/{company_id}/governance/arbitrate")
async def arbitrate_conflict(company_id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Allows Board to bind an executive conflict resolution."""
    title = payload.get("title", "Board Strategic Arbitration")
    decision = payload.get("decision", "Board Directive")
    rationale = payload.get("rationale", "Executive Board priority")
    dec_obj = await CompanyMemoryManager.record_decision(
        db, company_id, title, decision, rationale, made_by="Executive Board (You)"
    )
    await CompanyMemoryManager.log_activity(
        db, company_id, "Board Governance",
        f"BOARD OVERRIDE BINDING: {decision}",
        "SUCCESS"
    )
    return {"id": dec_obj.id, "title": title, "decision": decision, "rationale": rationale}

@router.get("/{company_id}/search-memory")
async def search_memory(company_id: str, q: str = "", limit: int = 5, db: AsyncSession = Depends(get_db)):
    """Searches memory artifacts using relevance ranking."""
    return await CompanyMemoryManager.search_memories(db, company_id, query=q, limit=limit)

@router.get("/{company_id}/treasury")
async def get_treasury(company_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves autonomous treasury expenditures and on-chain posture."""
    return await CompanyMemoryManager.get_treasury_summary(db, company_id)

@router.get("/{company_id}/events")
async def sse_events(company_id: str, request: Request):
    """Server-Sent Events endpoint for real-time frontend streaming updates."""
    queue = event_manager.subscribe(company_id)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield {
                        "event": event["event_type"],
                        "data": json.dumps(event)
                    }
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat ping
                    yield {
                        "event": "ping",
                        "data": json.dumps({"type": "ping"})
                    }
        finally:
            event_manager.unsubscribe(company_id, queue)

    return EventSourceResponse(event_generator())
