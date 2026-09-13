import os
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import (
    MemoryModel, DecisionModel, ActivityLogModel, TaskModel, AgentModel, MessageModel, TreasuryTransactionModel
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
            all_tasks = all_tasks_res.scalars().all()
            for t in all_tasks:
                if (
                    task_title.lower() in t.title.lower()
                    or t.title.lower() in task_title.lower()
                ):
                    task = t
                    break

            # If not matched by title, search by assigned_agent or role keyword
            if not task:
                for t in all_tasks:
                    agent_str = (t.assigned_agent or "").lower()
                    target = task_title.lower()
                    if (
                        target in agent_str
                        or agent_str in target
                        or ("market" in target and "market" in agent_str)
                        or ("cto" in target and ("cto" in agent_str or "architect" in agent_str))
                        or ("dev" in target and ("dev" in agent_str or "software" in agent_str or "engineer" in agent_str))
                        or ("research" in target and "research" in agent_str)
                        or ("ceo" in target and "ceo" in agent_str)
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

    @staticmethod
    async def record_treasury_transaction(
        db: AsyncSession,
        company_id: str,
        agent_name: str,
        service: str,
        amount: float,
        recipient: str,
        purpose: str,
        status: str = "REQUESTED",
        network: str = "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
        currency: str = "USDC",
        facilitator: str = "GoPlausible",
        tx_hash: str = "",
        metadata_json: Optional[Dict[str, Any]] = None
    ) -> TreasuryTransactionModel:
        """Persists a new autonomous treasury expenditure."""
        tx = TreasuryTransactionModel(
            company_id=company_id,
            agent_name=agent_name,
            service=service,
            amount=amount,
            currency=currency,
            network=network,
            recipient=recipient,
            purpose=purpose,
            status=status,
            tx_hash=tx_hash,
            facilitator=facilitator,
            metadata_json=metadata_json or {}
        )
        if status == "SETTLED":
            tx.settled_at = datetime.now(timezone.utc)
        db.add(tx)
        await db.commit()
        await db.refresh(tx)

        # Broadcast SSE event
        event_name = f"payment_{status.lower()}" if status.lower() in ["requested", "approved", "pending", "settled", "failed"] else "payment_update"
        await event_manager.broadcast(
            company_id,
            event_name,
            {
                "id": tx.id,
                "agent": tx.agent_name,
                "service": tx.service,
                "amount": f"{tx.amount:.2f}",
                "currency": tx.currency,
                "network": tx.network,
                "recipient": tx.recipient,
                "purpose": tx.purpose,
                "status": tx.status,
                "tx_hash": tx.tx_hash,
                "facilitator": tx.facilitator,
                "explorer_url": f"https://lora.algokit.io/testnet/transaction/{tx.tx_hash}" if tx.tx_hash else "",
                "created_at": tx.created_at.isoformat() if tx.created_at else None
            }
        )
        return tx

    @staticmethod
    async def update_treasury_transaction(
        db: AsyncSession,
        tx_id: str,
        status: str,
        tx_hash: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None
    ) -> Optional[TreasuryTransactionModel]:
        """Updates an existing treasury transaction with settlement status and tx hash."""
        tx = await db.get(TreasuryTransactionModel, tx_id)
        if not tx:
            return None
        tx.status = status
        if tx_hash:
            tx.tx_hash = tx_hash
        if status == "SETTLED":
            tx.settled_at = datetime.now(timezone.utc)
        if metadata_json:
            tx.metadata_json = {**(tx.metadata_json or {}), **metadata_json}
        await db.commit()
        await db.refresh(tx)

        event_name = f"payment_{status.lower()}" if status.lower() in ["approved", "pending", "settled", "failed"] else "payment_update"
        await event_manager.broadcast(
            tx.company_id,
            event_name,
            {
                "id": tx.id,
                "agent": tx.agent_name,
                "service": tx.service,
                "amount": f"{tx.amount:.2f}",
                "currency": tx.currency,
                "network": tx.network,
                "status": tx.status,
                "tx_hash": tx.tx_hash,
                "facilitator": tx.facilitator,
                "explorer_url": f"https://lora.algokit.io/testnet/transaction/{tx.tx_hash}" if tx.tx_hash else "",
                "settled_at": tx.settled_at.isoformat() if tx.settled_at else None
            }
        )
        return tx

    @staticmethod
    async def get_treasury_transactions(
        db: AsyncSession,
        company_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves treasury expenditures for the organization."""
        result = await db.execute(
            select(TreasuryTransactionModel)
            .order_by(TreasuryTransactionModel.created_at.desc())
        )
        txs = result.scalars().all()
        return [
            {
                "id": t.id,
                "company_id": t.company_id,
                "agent_name": t.agent_name,
                "agent": t.agent_name,
                "service": t.service,
                "amount": t.amount,
                "currency": t.currency,
                "token": t.currency,
                "network": t.network,
                "recipient": t.recipient,
                "purpose": t.purpose,
                "status": t.status,
                "tx_hash": t.tx_hash,
                "transaction_hash": t.tx_hash,
                "facilitator": t.facilitator,
                "explorer_url": f"https://lora.algokit.io/testnet/transaction/{t.tx_hash}" if t.tx_hash else "",
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "settled_at": t.settled_at.isoformat() if t.settled_at else None,
                "completed_at": t.settled_at.isoformat() if t.settled_at else None,
                "metadata_json": t.metadata_json or {}
            }
            for t in txs
        ]

    @staticmethod
    async def get_treasury_summary(
        db: AsyncSession,
        company_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculates total spend, counts, live wallet balances, and returns full treasury posture."""
        import httpx
        txs = await CompanyMemoryManager.get_treasury_transactions(db, company_id)
        settled_txs = [t for t in txs if t["status"] == "SETTLED"]
        total_spent = sum(t["amount"] for t in settled_txs)

        algo_bal = 9.999
        usdc_bal = 19.96
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{os.getenv('X402_SERVICE_URL', 'http://localhost:8002')}/api/x402/wallet-info")
                if res.status_code == 200:
                    wdata = res.json()
                    algo_bal = wdata.get("algo_balance", algo_bal)
                    usdc_bal = wdata.get("usdc_balance", usdc_bal)
        except Exception:
            pass

        return {
            "network": "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
            "currency": "USDC",
            "algo_balance": algo_bal,
            "usdc_balance": usdc_bal,
            "total_spent": round(total_spent, 4),
            "today_spent": round(total_spent, 4),
            "per_tx_limit": 0.05,
            "daily_limit": 0.50,
            "transaction_count": len(txs),
            "settled_count": len(settled_txs),
            "transactions": txs,
            "wallet_address": os.getenv("AVM_ADDRESS", "BJSAKUOZAQJGH2Y3LEPVVJY5HLKEPP6EI4XFNOZPBVE4VBVVCNZUB434CQ")
        }

    @staticmethod
    async def add_message(
        db: AsyncSession,
        company_id: str,
        sender_agent: str,
        recipient_agent: str,
        content: str,
        type: str = "DIRECT"
    ) -> MessageModel:
        msg = MessageModel(
            company_id=company_id,
            sender_agent=sender_agent,
            recipient_agent=recipient_agent,
            content=content,
            type=type,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)

        await event_manager.broadcast(
            company_id,
            "message_sent",
            {
                "id": msg.id,
                "company_id": company_id,
                "sender_agent": sender_agent,
                "recipient_agent": recipient_agent,
                "content": content,
                "type": type,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
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
                "company_id": m.company_id,
                "sender_agent": m.sender_agent,
                "recipient_agent": m.recipient_agent,
                "content": m.content,
                "type": m.type,
                "timestamp": m.timestamp.isoformat() if m.timestamp else None
            }
            for m in messages
        ]



