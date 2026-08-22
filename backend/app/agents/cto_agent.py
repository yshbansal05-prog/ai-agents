import json
from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentSpec

CTO_SPEC = AgentSpec(
    name="Strategy / CTO Agent",
    role="Chief Technology Officer & Systems Architect",
    objective="Architect scalable system infrastructure, define tech stacks, evaluate technical feasibility, and establish engineering implementation plans.",
    system_prompt="""You are the Chief Technology Officer (CTO) of an autonomous AI Organization.
Your task is to take the market research findings and company goal, then design a robust technical architecture, tech stack, DB model, and technical roadmap.""",
    capabilities=[
        "System Architecture Design",
        "Tech Stack Selection",
        "Database Schema Modeling",
        "Technical Risk Assessment",
        "Engineering Effort Estimation"
    ],
    dependencies=["Research Agent"]
)

class CTOAgent(BaseAgent):
    def __init__(self):
        super().__init__(CTO_SPEC)

    async def execute_strategy(self, goal: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
Company Goal: '{goal}'
Market Research Findings: {json.dumps(research_data)}

Design the technical architecture and engineering strategy for this platform.
Respond in valid JSON format matching this schema:
{{
  "architecture": "High level system architecture description tailored to the goal",
  "technology_stack": {{
    "frontend": "Frontend stack & UI libraries",
    "backend": "Backend framework & async services",
    "database": "Database & storage technology",
    "realtime": "Realtime communication protocol",
    "ai_engine": "AI models / orchestration framework"
  }},
  "features": ["Core MVP Feature 1", "Core MVP Feature 2", "Core MVP Feature 3", "Core MVP Feature 4"],
  "technical_risks": ["Risk 1 and mitigation", "Risk 2 and mitigation"],
  "implementation_plan": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ...", "Phase 4: ..."]
}}
"""
        parsed = await self.invoke_json_llm(prompt)
        if isinstance(parsed, dict) and "architecture" in parsed:
            return parsed

        domain = goal.strip().rstrip(".")
        return {
            "architecture": f"Distributed Event-Driven Architecture for '{domain}' leveraging Next.js (Frontend), Python FastAPI (Async Services), PostgreSQL / Vector Store, and LangGraph (Multi-Agent State Orchestration).",
            "technology_stack": {
                "frontend": "Next.js 14+ (App Router), TypeScript, Tailwind CSS, React Flow, Lucide Icons",
                "backend": "Python 3.11, FastAPI, Async SQLAlchemy, LangGraph, Pydantic",
                "database": "PostgreSQL with pgvector for relational and semantic embeddings",
                "realtime": "Server-Sent Events (SSE) via FastAPI async queue stream",
                "ai_engine": "LangGraph state graph with dynamic LLM provider selection (Gemini / OpenAI / Groq / NVIDIA)"
            },
            "features": [
                f"Core automated domain workflow engine for {domain}",
                "Real-time Multi-Agent State Graph and Activity Stream",
                "Shared Company Memory & Context Retrieval System",
                "Automated CEO Conflict Resolution Engine",
                "Live Activity Timeline & Executive Deliverable Report Generator"
            ],
            "technical_risks": [
                "LLM API latency & rate limits: Mitigated using streaming SSE & fallback response engine.",
                "Concurrency state race conditions: Managed via deterministic LangGraph state nodes and DB transactions."
            ],
            "implementation_plan": [
                "Phase 1: DB Schema, Vector Store & FastAPI SSE Server Setup",
                "Phase 2: LangGraph Multi-Agent Pipeline & Memory Layer",
                "Phase 3: Next.js Frontend Dashboard with React Flow Org Diagram",
                "Phase 4: Conflict Resolution & Final Report Generation"
            ]
        }
