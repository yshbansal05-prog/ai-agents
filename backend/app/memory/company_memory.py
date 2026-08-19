import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import (
    MemoryModel, DecisionModel, ActivityLogModel, TaskModel, AgentModel, MessageModel, CompanyModel
)
from app.services.event_manager import event_manager

class CompanyMemoryManager:

    @staticmethod
    async def add_memory(
        db: AsyncSession,
        company_id: str,
        agent_name: str,
        key: str,
        value: Any,
        category: str = "GENERAL"
    ) -> MemoryModel:
        memory = MemoryModel(
            company_id=company_id,
            agent_name=agent_name,
            key=key,
            value=value,
            category=category
        )
        db.add(memory)
        await db.commit()
        await db.refresh(memory)

        await event_manager.broadcast(
            company_id,
            "memory_added",
            {
                "id": memory.id,
                "agent_name": agent_name,
                "key": key,
                "value": value,
                "category": category
            }
        )
        return memory

    @staticmethod
    async def get_memories(
        db: AsyncSession,
        company_id: str,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
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

    @staticmethod
    async def log_activity(
        db: AsyncSession,
        company_id: str,
        agent_name: str,
        message: str,
        level: str = "INFO"
    ) -> ActivityLogModel:
        log = ActivityLogModel(
            company_id=company_id,
            agent_name=agent_name,
            message=message,
            level=level
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)

        await event_manager.broadcast(
            company_id,
            "activity_log",
            {
                "id": log.id,
                "agent_name": agent_name,
                "message": message,
                "level": level,
                "timestamp": log.timestamp.isoformat() if log.timestamp else datetime.now(timezone.utc).isoformat()
            }
        )
        return log

    @staticmethod
    async def record_decision(
        db: AsyncSession,
        company_id: str,
        title: str,
        decision: str,
        rationale: str,
        made_by: str = "CEO / Orchestrator",
        context: Dict[str, Any] = None
    ) -> DecisionModel:
        decision_obj = DecisionModel(
            company_id=company_id,
            title=title,
            decision=decision,
            rationale=rationale,
            made_by=made_by,
            context=context or {}
        )
        db.add(decision_obj)
        await db.commit()
        await db.refresh(decision_obj)

        await event_manager.broadcast(
            company_id,
            "decision_made",
            {
                "id": decision_obj.id,
                "title": title,
                "decision": decision,
                "rationale": rationale,
                "made_by": made_by,
                "context": context or {}
            }
        )
        return decision_obj

    @staticmethod
    async def update_agent_status(
        db: AsyncSession,
        company_id: str,
        agent_name: str,
        status: str,
        current_task: Optional[str] = None
    ):
        result = await db.execute(
            select(AgentModel).where(
                AgentModel.company_id == company_id,
                AgentModel.name == agent_name
            )
        )
        agent = result.scalars().first()
        if agent:
            agent.status = status
            if current_task is not None:
                agent.current_task = current_task
            await db.commit()

            await event_manager.broadcast(
                company_id,
                "agent_status",
                {
                    "agent_id": agent.id,
                    "agent_name": agent_name,
                    "role": agent.role,
                    "status": status,
                    "current_task": agent.current_task
                }
            )

    @staticmethod
    async def update_task_status(
        db: AsyncSession,
        company_id: str,
        task_title: str,
        status: str,
        result_text: Optional[str] = None
    ):
        result = await db.execute(
            select(TaskModel).where(
                TaskModel.company_id == company_id,
                TaskModel.title == task_title
            )
        )
        task = result.scalars().first()
        if task:
            task.status = status
            if result_text:
                task.result = result_text
            if status == "COMPLETED":
                task.completed_at = datetime.now(timezone.utc)
            await db.commit()

            await event_manager.broadcast(
                company_id,
                "task_status",
                {
                    "task_id": task.id,
                    "title": task.title,
                    "assigned_agent": task.assigned_agent,
                    "status": status,
                    "result": task.result
                }
            )
