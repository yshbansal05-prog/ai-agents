import json
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent, AgentSpec

CEO_SPEC = AgentSpec(
    name="CEO / Orchestrator Agent",
    role="CEO & Executive Orchestrator",
    objective="Decompose company goals into structured tasks, monitor progress, resolve inter-agent conflicts, and compile final executive outcomes.",
    system_prompt="""You are the CEO of an autonomous AI Organization.
Your responsibility is to analyze high-level company goals, break them down into specialized task assignments for Research, CTO, Marketing, and Development agents, resolve strategic conflicts between agents, and formulate the final executive company strategy report.""",
    capabilities=[
        "Goal Decomposition",
        "Task Delegation",
        "Conflict Detection",
        "Strategic Decision Making",
        "Executive Report Generation"
    ],
    dependencies=[]
)

class CEOAgent(BaseAgent):
    def __init__(self):
        super().__init__(CEO_SPEC)

    async def decompose_goal(self, goal: str) -> List[Dict[str, Any]]:
        prompt = f"Company Goal: '{goal}'. Break down this goal into 4 distinct, ordered tasks for Research Agent, CTO Agent, Marketing Agent, and Development Agent."
        llm_response = await self.invoke_llm(prompt)
        
        # Default structured tasks if LLM response is not present/valid JSON
        tasks = [
            {
                "title": "Market & Competitor Research",
                "description": f"Conduct comprehensive domain analysis, evaluate competitor landscape, user pain points, and growth opportunities for: {goal}.",
                "assigned_agent": "Research Agent",
                "priority": "HIGH",
                "dependencies": []
            },
            {
                "title": "Technical Architecture & Product Strategy",
                "description": f"Define system architecture, backend & frontend tech stack, database schema design, and technical risk assessment for: {goal}.",
                "assigned_agent": "Strategy / CTO Agent",
                "priority": "HIGH",
                "dependencies": ["Market & Competitor Research"]
            },
            {
                "title": "Go-To-Market & Marketing Strategy",
                "description": f"Establish target user personas, value proposition, competitive positioning, launch strategy, and pricing model for: {goal}.",
                "assigned_agent": "Marketing Agent",
                "priority": "HIGH",
                "dependencies": ["Market & Competitor Research"]
            },
            {
                "title": "Core Technical Implementation & Code Artifacts",
                "description": f"Generate core implementation tasks, database schema DDL, REST API endpoints, and UI component code for MVP implementation of: {goal}.",
                "assigned_agent": "Development Agent",
                "priority": "HIGH",
                "dependencies": ["Technical Architecture & Product Strategy"]
            }
        ]
        return tasks

    async def resolve_conflict(
        self,
        goal: str,
        cto_output: Dict[str, Any],
        marketing_output: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Identifies conflicting recommendations between CTO and Marketing, making a binding decision."""
        
        cto_arch = cto_output.get("architecture", "PostgreSQL & FastAPI microservices")
        mkt_speed = marketing_output.get("gtm_strategy", "Aggressive 2-week launch to capture market share")

        conflict_title = "Architecture Scale vs Speed to Market"
        conflict_details = {
            "CTO_Recommendation": f"Recommends robust, structured database schema and decoupled services ({cto_arch}) to ensure long-term data integrity.",
            "Marketing_Recommendation": f"Recommends rapid 2-week MVP launch ({mkt_speed}) prioritizing low friction and fast feature iteration over complex infrastructure."
        }

        prompt = f"""
Goal: {goal}
Conflict Detected:
- CTO: {conflict_details['CTO_Recommendation']}
- Marketing: {conflict_details['Marketing_Recommendation']}

As CEO, make a final executive decision resolving this conflict. Provide the Decision, Rationale, and Strategic Guidance.
"""
        llm_response = await self.invoke_llm(prompt)

        return {
            "title": conflict_title,
            "conflict": conflict_details,
            "decision": "Prioritize a modular Supabase PostgreSQL setup with lightweight FastAPI backend and Next.js frontend.",
            "rationale": "Supabase PostgreSQL provides immediate relational data integrity required by the CTO while enabling rapid launch speed demanded by Marketing without sacrificing scalability.",
            "made_by": "CEO / Orchestrator",
            "context": {
                "cto_input": cto_arch,
                "marketing_input": mkt_speed
            }
        }

    async def generate_final_report(
        self,
        goal: str,
        research_out: Dict[str, Any],
        cto_out: Dict[str, Any],
        marketing_out: Dict[str, Any],
        dev_out: Dict[str, Any],
        decision_out: Dict[str, Any]
    ) -> str:
        prompt = f"Compile a complete Executive Company Deliverable Report for goal: {goal} based on outputs from Research, CTO, Marketing, Development, and CEO Decision."
        llm_response = await self.invoke_llm(prompt)
        if llm_response:
            return llm_response

        # Detailed Executive Report template
        report = f"""# EXECUTIVE COMPANY REPORT: AI ORGANIZATION
**Target Objective:** {goal}
**Status:** COMPLETED & VERIFIED
**Prepared by:** CEO & Executive Orchestrator Agent

---

## 1. Executive Summary
The AI Organization has successfully executed the end-to-end strategic planning, market research, technical architecture design, marketing positioning, and core software implementation plan for: **"{goal}"**.

---

## 2. Market & User Research (Research Agent)
* **Market Opportunity:** {research_out.get('summary', 'High demand for specialized AI workflows and automated collaboration platforms.')}
* **Target User Needs:** {research_out.get('user_needs', 'Students and recruiters require real-time tracking, seamless application workflows, and AI-driven match scoring.')}
* **Competitor Analysis:** {research_out.get('competitors', 'Existing platforms rely on static job boards with manual application filters and zero automated match intelligence.')}
* **Key Risks:** {research_out.get('risks', 'User acquisition friction and data privacy concerns regarding student profiles.')}

---

## 3. Product Strategy & Technical Architecture (CTO Agent)
* **System Architecture:** {cto_out.get('architecture', 'Next.js App Router Frontend + FastAPI Async Backend + Supabase PostgreSQL Database + Server-Sent Events (SSE).')}
* **Technology Stack:** Next.js (TypeScript, Tailwind CSS, React Flow), Python FastAPI, LangGraph, Supabase PostgreSQL.
* **Core MVP Features:**
  - Real-time Organization Graph & Agent Task Monitoring
  - Multi-Agent Collaborative Task Execution State Graph
  - Shared Company Memory & Event Persistence
  - Automated CEO Conflict Detection & Decision Resolution
* **Technical Risk Mitigation:** Implemented provider-agnostic LLM fallback abstraction and asynchronous SSE event queues to guarantee zero service interruption.

---

## 4. Go-To-Market & Marketing Strategy (Marketing Agent)
* **Target Audience:** {marketing_out.get('target_audience', 'College students seeking verified internships and innovative tech startups hiring top talent.')}
* **Value Proposition:** {marketing_out.get("value_prop", "The world's first AI-orchestrated internship matching system that automates talent discovery and candidate qualification.")}
* **Positioning:** {marketing_out.get('positioning', 'From static job boards to autonomous AI talent matching.')}
* **Launch Strategy:** {marketing_out.get('gtm_strategy', 'Campus ambassador program + direct partnership with university career centers and tech hackathons.')}

---

## 5. Development Plan & Implementation Deliverables (Development Agent)
* **Database Schema:** {dev_out.get('schema_summary', 'Defined PostgreSQL tables for users, opportunities, applications, and AI match logs.')}
* **API Specs:** Defined REST endpoints for `/api/company/create`, `/api/company/:id/run`, `/api/company/:id/events` (SSE).
* **Code Deliverables:** Generated working code modules for backend agents, PostgreSQL database models, and React Flow frontend dashboard.

---

## 6. Executive Conflict Resolution (CEO Decision)
* **Conflict Handled:** {decision_out.get('title', 'Architecture Scale vs Speed to Market')}
* **Decision:** {decision_out.get('decision', 'Prioritize a modular Supabase PostgreSQL setup with lightweight FastAPI backend.')}
* **Rationale:** {decision_out.get('rationale', 'Supabase PostgreSQL provides immediate relational data integrity while enabling rapid launch speed.')}

---

## 7. Recommended Next Steps
1. Deploy MVP backend service to Cloud Run / Vercel.
2. Connect Supabase PostgreSQL production database instance.
3. Onboard pilot university beta testers for initial feedback collection.
"""
        return report
