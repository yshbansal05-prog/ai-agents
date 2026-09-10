from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class CompanyCreate(BaseModel):
    name: Optional[str] = "AI Organization MVP"
    goal: str = Field(..., json_schema_extra={"example": "Build an AI-powered internship platform for college students."})

class AgentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    name: str
    role: str
    objective: str
    status: str
    current_task: Optional[str] = None
    capabilities: List[str] = []
    dependencies: List[str] = []

class TaskSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

class MemorySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    agent_name: str
    key: str
    value: Any
    category: str
    created_at: Optional[datetime] = None

class DecisionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    title: str
    decision: str
    rationale: str
    made_by: str
    context: Dict[str, Any] = {}
    created_at: Optional[datetime] = None

class ActivityLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    agent_name: str
    message: str
    level: str
    timestamp: Optional[datetime] = None

class MessageSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    sender_agent: str
    recipient_agent: str
    content: str
    type: str = "INFO"
    timestamp: Optional[datetime] = None

class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    goal: str
    status: str
    agents: List[AgentSchema] = []
    tasks: List[TaskSchema] = []
    decisions: List[DecisionSchema] = []
    final_report: Optional[str] = None
    created_at: Optional[datetime] = None

class EventPayload(BaseModel):
    event_type: str  # agent_status, task_status, activity_log, memory_added, conflict_detected, decision_made, report_completed, payment_settled
    company_id: str
    timestamp: str
    data: Dict[str, Any]

class TreasuryTransactionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    agent_name: str
    service: str
    amount: float
    currency: str = "USDC"
    network: str
    recipient: str
    purpose: str
    status: str
    tx_hash: str = ""
    facilitator: str = "GoPlausible"
    created_at: Optional[datetime] = None
    settled_at: Optional[datetime] = None
    metadata_json: Dict[str, Any] = {}

class TreasurySummarySchema(BaseModel):
    network: str
    currency: str = "USDC"
    total_spent: float
    transaction_count: int
    transactions: List[TreasuryTransactionSchema] = []
    wallet_address: str

