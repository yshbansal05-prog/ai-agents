import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

Base = declarative_base()

class CompanyModel(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    goal = Column(Text, nullable=False)
    status = Column(String, default="INITIALIZING")  # INITIALIZING, IN_PROGRESS, COMPLETED, FAILED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    agents = relationship("AgentModel", back_populates="company", cascade="all, delete-orphan")
    tasks = relationship("TaskModel", back_populates="company", cascade="all, delete-orphan")
    memories = relationship("MemoryModel", back_populates="company", cascade="all, delete-orphan")
    decisions = relationship("DecisionModel", back_populates="company", cascade="all, delete-orphan")
    logs = relationship("ActivityLogModel", back_populates="company", cascade="all, delete-orphan")

class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    objective = Column(Text, nullable=False)
    status = Column(String, default="WAITING")  # WORKING, COMPLETED, WAITING, FAILED
    current_task = Column(Text, nullable=True)
    capabilities = Column(JSON, default=list)
    dependencies = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    company = relationship("CompanyModel", back_populates="agents")

class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    assigned_agent = Column(String, nullable=False)  # Agent role/name
    status = Column(String, default="PENDING")  # PENDING, RUNNING, WAITING, COMPLETED, FAILED
    priority = Column(String, default="MEDIUM")
    dependencies = Column(JSON, default=list)
    result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    company = relationship("CompanyModel", back_populates="tasks")

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    sender_agent = Column(String, nullable=False)
    recipient_agent = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String, default="INFO")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MemoryModel(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    key = Column(String, nullable=False)
    value = Column(JSON, nullable=False)
    category = Column(String, default="GENERAL")  # RESEARCH, ARCHITECTURE, MARKETING, CODE, DECISION
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    company = relationship("CompanyModel", back_populates="memories")

class DecisionModel(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    decision = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    made_by = Column(String, default="CEO / Orchestrator")
    context = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    company = relationship("CompanyModel", back_populates="decisions")

class ActivityLogModel(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    level = Column(String, default="INFO")  # INFO, WARNING, SUCCESS, CONFLICT, ERROR
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    company = relationship("CompanyModel", back_populates="logs")

# Database connection setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ai_org.db")

engine_kwargs = {"echo": False}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = int(os.getenv("DB_POOL_SIZE", "10"))
    engine_kwargs["max_overflow"] = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(DATABASE_URL, **engine_kwargs)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

