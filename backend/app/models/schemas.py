from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CompanyCreate(BaseModel):
    name: Optional[str] = "AI Organization MVP"
    goal: str = Field(..., example="Build an AI-powered internship platform for college students.")

class AgentSchema(BaseModel):
    id: str
    company_id: str
    name: str
    role: str
    objective: str
    status: str
    current_task: Optional[str] = None
    capabilities: List[str] = []
    dependencies: List[str] = []

    class Config:
        from_attributes = True

class TaskSchema(BaseModel):
    id: str
    company_id: str
    title: str
    description: str
    assigned_agent: str
    status: str
    priority: str
    dependencies: List[str] = []
    result: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MemorySchema(BaseModel):
    id: str
    company_id: str
    agent_name: str
    key: str
    value: Any
    category: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DecisionSchema(BaseModel):
    id: str
    company_id: str
    title: str
    decision: str
    rationale: str
    made_by: str
    context: Dict[str, Any] = {}
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ActivityLogSchema(BaseModel):
    id: str
    company_id: str
    agent_name: str
    message: str
    level: str
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class CompanyResponse(BaseModel):
    id: str
    name: str
    goal: str
    status: str
    agents: List[AgentSchema] = []
    tasks: List[TaskSchema] = []
    decisions: List[DecisionSchema] = []
    final_report: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EventPayload(BaseModel):
    event_type: str  # agent_status, task_status, activity_log, memory_added, conflict_detected, decision_made, report_completed
    company_id: str
    timestamp: str
    data: Dict[str, Any]
