import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import (
    MemoryModel, DecisionModel, ActivityLogModel, TaskModel, AgentModel, MessageModel
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
        context: Optional[Dict[str, Any]] = None
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
            select(AgentModel).where(AgentModel.company_id == company_id)
        )
        agents = result.scalars().all()
        agent = None
        for a in agents:
            if (
                a.name.lower() in agent_name.lower()
                or agent_name.lower() in a.name.lower()
                or a.role.lower() in agent_name.lower()
                or agent_name.lower() in a.role.lower()
            ):
                agent = a
                break

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
                    "agent_name": agent.name,
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
        if not task:
            all_tasks_res = await db.execute(
                select(TaskModel).where(TaskModel.company_id == company_id)
            )
            for t in all_tasks_res.scalars().all():
                if (
                    task_title.lower() in t.title.lower()
                    or t.title.lower() in task_title.lower()
                ):
                    task = t
                    break

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

    @staticmethod
    async def add_message(
        db: AsyncSession,
        company_id: str,
        sender_agent: str,
        recipient_agent: str,
        content: str,
        type: str = "INFO"
    ) -> MessageModel:
        msg = MessageModel(
            company_id=company_id,
            sender_agent=sender_agent,
            recipient_agent=recipient_agent,
            content=content,
            type=type
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)

        await event_manager.broadcast(
            company_id,
            "agent_message",
            {
                "id": msg.id,
                "sender_agent": sender_agent,
                "recipient_agent": recipient_agent,
                "content": content,
                "type": type,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else datetime.now(timezone.utc).isoformat()
            }
        )
        return msg

    @staticmethod
    async def get_messages(
        db: AsyncSession,
        company_id: str
    ) -> List[Dict[str, Any]]:
        result = await db.execute(
            select(MessageModel)
            .where(MessageModel.company_id == company_id)
            .order_by(MessageModel.timestamp.asc())
        )
        messages = result.scalars().all()
        return [
            {
                "id": m.id,
                "sender_agent": m.sender_agent,
                "recipient_agent": m.recipient_agent,
                "content": m.content,
                "type": m.type,
                "timestamp": m.timestamp.isoformat() if m.timestamp else None
            }
            for m in messages
        ]

    @staticmethod
    async def search_memories(
        db: AsyncSession,
        company_id: str,
        query: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Keyword and relevance-ranked memory retrieval across company artifacts."""
        all_memories = await CompanyMemoryManager.get_memories(db, company_id)
        if not query or not all_memories:
            return all_memories[:limit]

        query_terms = set(query.lower().split())
        scored_memories = []
        for mem in all_memories:
            score = 0
            text_corpus = f"{mem['key']} {mem['category']} {mem['agent_name']} {json.dumps(mem['value'])}".lower()
            for term in query_terms:
                if term in text_corpus:
                    score += text_corpus.count(term)
            scored_memories.append((score, mem))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_memories[:limit]]

