import asyncio
import json
from typing import Dict, List, Set, Any
from datetime import datetime, timezone

class EventManager:
    """In-memory pub-sub for SSE real-time streaming to frontend dashboard."""

    def __init__(self):
        # company_id -> set of asyncio queues
        self._listeners: Dict[str, Set[asyncio.Queue]] = {}

    def subscribe(self, company_id: str) -> asyncio.Queue:
        if company_id not in self._listeners:
            self._listeners[company_id] = set()
        queue = asyncio.Queue()
        self._listeners[company_id].add(queue)
        return queue

    def unsubscribe(self, company_id: str, queue: asyncio.Queue):
        if company_id in self._listeners:
            self._listeners[company_id].discard(queue)
            if not self._listeners[company_id]:
                del self._listeners[company_id]

    async def broadcast(self, company_id: str, event_type: str, data: Dict[str, Any]):
        event = {
            "event_type": event_type,
            "company_id": company_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
        if company_id in self._listeners:
            # Send copy to all active client queues
            to_remove = set()
            for queue in self._listeners[company_id]:
                try:
                    queue.put_nowait(event)
                except asyncio.QueueFull:
                    to_remove.add(queue)
            for q in to_remove:
                self._listeners[company_id].discard(q)

event_manager = EventManager()
