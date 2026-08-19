import json
import asyncio
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.database import (
    get_db, CompanyModel, AgentModel, TaskModel, MemoryModel, DecisionModel, ActivityLogModel
)
from app.models.schemas import CompanyCreate, CompanyResponse, AgentSchema, TaskSchema, MemorySchema, DecisionSchema, ActivityLogSchema
from app.orchestrator.company_graph import orchestrator
from app.services.event_manager import event_manager
from app.agents.ceo_agent import CEO_SPEC
from app.agents.research_agent import RESEARCH_SPEC
from app.agents.cto_agent import CTO_SPEC
from app.agents.marketing_agent import MARKETING_SPEC
from app.agents.dev_agent import DEV_SPEC

router = APIRouter(prefix="/api/company", tags=["Company AI Organization"])

@router.post("/create", response_model=Dict[str, Any])
async def create_company(payload: CompanyCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new company and initializes the 5 specialized AI agents."""
    company = CompanyModel(
        name=payload.name or "AI Organization MVP",
        goal=payload.goal,
        status="INITIALIZING"
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)

    # Initialize 5 agents
    agent_specs = [CEO_SPEC, RESEARCH_SPEC, CTO_SPEC, MARKETING_SPEC, DEV_SPEC]
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
