import asyncio
import json
import logging
from typing import Dict, Any, TypedDict, List, Optional
from langgraph.graph import StateGraph, START, END
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.ceo_agent import CEOAgent
from app.agents.research_agent import ResearchAgent
from app.agents.cto_agent import CTOAgent
from app.agents.marketing_agent import MarketingAgent
from app.agents.dev_agent import DevAgent
from app.memory.company_memory import CompanyMemoryManager
from app.models.database import AsyncSessionLocal, CompanyModel, TaskModel
from app.services.treasury_service import TreasuryService

logger = logging.getLogger(__name__)

# State schema for LangGraph multi-agent orchestration
class CompanyState(TypedDict):
    company_id: str
    goal: str
    tasks: List[Dict[str, Any]]
    research_output: Dict[str, Any]
    cto_output: Dict[str, Any]
    marketing_output: Dict[str, Any]
    dev_output: Dict[str, Any]
    decision_output: Dict[str, Any]
    final_report: str
    status: str

class CompanyOrchestrator:

    def __init__(self):
        self.ceo = CEOAgent()
        self.research = ResearchAgent()
        self.cto = CTOAgent()
        self.marketing = MarketingAgent()
        self.dev = DevAgent()
        self.graph = self._build_graph()

    def _build_graph(self):
        """Constructs and compiles the LangGraph StateGraph pipeline."""
        workflow = StateGraph(CompanyState)

        workflow.add_node("ceo_decompose", self._node_ceo_decompose)
        workflow.add_node("research_node", self._node_research)
        workflow.add_node("cto_node", self._node_cto)
        workflow.add_node("marketing_node", self._node_marketing)
        workflow.add_node("conflict_node", self._node_conflict)
        workflow.add_node("dev_node", self._node_dev)
        workflow.add_node("report_node", self._node_report)

        workflow.add_edge(START, "ceo_decompose")
        workflow.add_edge("ceo_decompose", "research_node")
        workflow.add_edge("research_node", "cto_node")
        workflow.add_edge("cto_node", "marketing_node")
        workflow.add_edge("marketing_node", "conflict_node")
        workflow.add_edge("conflict_node", "dev_node")
        workflow.add_edge("dev_node", "report_node")
        workflow.add_edge("report_node", END)

        return workflow.compile()

    async def _node_ceo_decompose(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]

        async with AsyncSessionLocal() as db:
            company_result = await db.get(CompanyModel, company_id)
            if company_result:
                company_result.status = "IN_PROGRESS"
                await db.commit()

            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                f"Analyzing company goal: '{goal}' and breaking into tasks...", "INFO"
            )
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "CEO / Orchestrator Agent", "WORKING", f"Decomposing goal: '{goal}'"
            )

            tasks = await self.ceo.decompose_goal(goal)
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                f"CEO successfully created {len(tasks)} core execution tasks.", "SUCCESS"
            )

            for t in tasks:
                task_obj = TaskModel(
                    company_id=company_id,
                    title=t["title"],
                    description=t["description"],
                    assigned_agent=t["assigned_agent"],
                    status="PENDING",
                    priority=t.get("priority", "HIGH"),
                    dependencies=t.get("dependencies", [])
                )
                db.add(task_obj)
                await CompanyMemoryManager.add_memory(
                    db, company_id, "CEO / Orchestrator Agent",
                    f"TASK_{t['title']}", t, category="TASK"
                )

            await db.commit()

            for t in tasks:
                await CompanyMemoryManager.update_task_status(db, company_id, t["title"], "PENDING")

            # Inter-agent dispatch message
            await CompanyMemoryManager.add_message(
                db, company_id,
                sender_agent="CEO / Orchestrator Agent",
                recipient_agent="All Agents",
                content=f"Company objective initialized: '{goal}'. Dispatched {len(tasks)} tasks across departments.",
                type="DELEGATION"
            )

            await CompanyMemoryManager.update_agent_status(
                db, company_id, "CEO / Orchestrator Agent", "WAITING", "Waiting for agent execution outputs"
            )

        await asyncio.sleep(1)
        return {"tasks": tasks, "status": "TASKS_DELEGATED"}

    async def _node_research(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]

        async with AsyncSessionLocal() as db:
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Research Agent", "WORKING", "Conducting market, competitor & user research"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Research Agent", "RUNNING"
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, "Research Agent", "Started market, competitor & user research...", "INFO"
            )

            # Autonomous x402 Payment Flow for Premium Market Intelligence (Phase 9)
            paid_intel_res = await TreasuryService.purchase_paid_resource(
                db=db,
                company_id=company_id,
                agent_name="Research Agent",
                service_name="Premium Market Intelligence",
                amount=0.01,
                domain=goal
            )
            paid_data = paid_intel_res.get("data") if paid_intel_res.get("success") else None

            research_res = await self.research.execute_research(goal, paid_intelligence=paid_data)

            await CompanyMemoryManager.add_memory(
                db, company_id, "Research Agent", "RESEARCH_FINDINGS", research_res, category="RESEARCH"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Research Agent", "COMPLETED", json.dumps(research_res.get("summary", "Research complete"))
            )
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Research Agent", "COMPLETED", "Research analysis complete"
            )
            model_info = self.research.last_model or self.research.provider
            await CompanyMemoryManager.log_activity(
                db, company_id, "Research Agent",
                f"Completed market research [{self.research.last_execution_type}: {self.research.last_latency}s | {model_info}].",
                "SUCCESS"
            )

            # Inter-agent message from Research to CTO and Marketing
            await CompanyMemoryManager.add_message(
                db, company_id,
                sender_agent="Research Agent",
                recipient_agent="Strategy / CTO Agent",
                content=f"Market research completed: {str(research_res.get('summary', ''))[:140]}",
                type="DATA_HANDOFF"
            )

        await asyncio.sleep(1.5)
        return {"research_output": research_res}

    async def _node_cto(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]
        research_res = state.get("research_output", {})

        async with AsyncSessionLocal() as db:
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Strategy / CTO Agent", "WORKING", "Designing system architecture & technical stack"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Strategy / CTO Agent", "RUNNING"
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, "Strategy / CTO Agent", "Retrieved Research findings from shared memory; architecting system...", "INFO"
            )

            cto_res = await self.cto.execute_strategy(goal, research_res)

            await CompanyMemoryManager.add_memory(
                db, company_id, "Strategy / CTO Agent", "CTO_ARCHITECTURE", cto_res, category="ARCHITECTURE"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Strategy / CTO Agent", "COMPLETED", json.dumps(cto_res.get("architecture", "Architecture complete"))
            )
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Strategy / CTO Agent", "COMPLETED", "Technical architecture complete"
            )
            model_info = self.cto.last_model or self.cto.provider
            await CompanyMemoryManager.log_activity(
                db, company_id, "Strategy / CTO Agent",
                f"Completed system architecture & roadmap [{self.cto.last_execution_type}: {self.cto.last_latency}s | {model_info}].",
                "SUCCESS"
            )

            # Inter-agent message from CTO to Marketing and Executive Squad
            await CompanyMemoryManager.add_message(
                db, company_id,
                sender_agent="Strategy / CTO Agent",
                recipient_agent="Marketing Agent",
                content="Architecture specifications ready. Coordinating technical roadmap with go-to-market priorities.",
                type="SPECIFICATION"
            )

        await asyncio.sleep(1.5)
        return {"cto_output": cto_res}

    async def _node_marketing(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]
        research_res = state.get("research_output", {})

        async with AsyncSessionLocal() as db:
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Marketing Agent", "WORKING", "Defining brand positioning & go-to-market strategy"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Marketing Agent", "RUNNING"
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, "Marketing Agent", "Analyzing goal & research context; formulating GTM plan...", "INFO"
            )

            mkt_res = await self.marketing.execute_marketing(goal, research_res)

            await CompanyMemoryManager.add_memory(
                db, company_id, "Marketing Agent", "MARKETING_STRATEGY", mkt_res, category="MARKETING"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Marketing Agent", "COMPLETED", json.dumps(mkt_res.get("value_prop", "GTM strategy complete"))
            )
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Marketing Agent", "COMPLETED", "Marketing strategy complete"
            )
            model_info = self.marketing.last_model or self.marketing.provider
            await CompanyMemoryManager.log_activity(
                db, company_id, "Marketing Agent",
                f"Completed value proposition & positioning [{self.marketing.last_execution_type}: {self.marketing.last_latency}s | {model_info}].",
                "SUCCESS"
            )

            # Inter-agent message from Marketing to CEO
            await CompanyMemoryManager.add_message(
                db, company_id,
                sender_agent="Marketing Agent",
                recipient_agent="CEO / Orchestrator Agent",
                content=f"GTM playbook finalized. Recommends aggressive beta launch: {str(mkt_res.get('value_prop', ''))[:100]}",
                type="STRATEGY"
            )

        await asyncio.sleep(1.5)
        return {"marketing_output": mkt_res}

    async def _node_conflict(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]
        cto_res = state.get("cto_output", {})
        mkt_res = state.get("marketing_output", {})

        async with AsyncSessionLocal() as db:
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "CEO / Orchestrator Agent", "WORKING", "Evaluating agent recommendations & detecting conflicts"
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent", "CONFLICT DETECTED: Evaluating CTO architecture vs Marketing speed-to-market trade-offs...", "CONFLICT"
            )
            await asyncio.sleep(1)

            decision_res = await self.ceo.resolve_conflict(goal, cto_res, mkt_res)
            await CompanyMemoryManager.record_decision(
                db, company_id,
                decision_res["title"],
                decision_res["decision"],
                decision_res["rationale"],
                made_by="CEO / Orchestrator Agent",
                context=decision_res.get("context", {})
            )
            model_info = self.ceo.last_model or self.ceo.provider
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                f"CEO DECISION BINDING [{self.ceo.last_execution_type}: {self.ceo.last_latency}s | {model_info}]: {decision_res['decision']}",
                "SUCCESS"
            )

            # Inter-agent arbitration message dispatched to Dev and Executive Squad
            await CompanyMemoryManager.add_message(
                db, company_id,
                sender_agent="CEO / Orchestrator Agent",
                recipient_agent="Development Agent",
                content=f"Executive Ruling on '{decision_res['title']}': {decision_res['decision']}. Proceed with implementation adhering to this decision.",
                type="DECISION"
            )

        await asyncio.sleep(1.5)
        return {"decision_output": decision_res}

    async def _node_dev(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]
        cto_res = state.get("cto_output", {})
        decision_res = state.get("decision_output", {})

        async with AsyncSessionLocal() as db:
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Development Agent", "WORKING", "Generating code artifacts aligned with CEO conflict ruling"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Development Agent", "RUNNING"
            )
            decision_note = decision_res.get("decision", "Modular architecture")[:60]
            await CompanyMemoryManager.log_activity(
                db, company_id, "Development Agent",
                f"Converting CTO blueprint into implementation adhering to CEO ruling: '{decision_note}'...",
                "INFO"
            )

            dev_res = await self.dev.execute_development(goal, cto_res, decision_res)

            await CompanyMemoryManager.add_memory(
                db, company_id, "Development Agent", "DEV_CODE_ARTIFACTS", dev_res, category="CODE"
            )
            await CompanyMemoryManager.update_task_status(
                db, company_id, "Development Agent", "COMPLETED", dev_res.get("schema_summary", "Generated SQL DDL and API Endpoints")
            )
            await CompanyMemoryManager.update_agent_status(
                db, company_id, "Development Agent", "COMPLETED", "Code generation complete"
            )
            model_info = self.dev.last_model or self.dev.provider
            await CompanyMemoryManager.log_activity(
                db, company_id, "Development Agent",
                f"Generated database DDL and API implementation code [{self.dev.last_execution_type}: {self.dev.last_latency}s | {model_info}] adhering to CEO ruling.",
                "SUCCESS"
            )

            # Inter-agent message from Dev to CTO
            await CompanyMemoryManager.add_message(
                db, company_id,
                sender_agent="Development Agent",
                recipient_agent="Strategy / CTO Agent",
                content=f"PostgreSQL DDL schema and API endpoints generated implementing CEO ruling: {decision_note}.",
                type="STATUS"
            )

        await asyncio.sleep(1.5)
        return {"dev_output": dev_res}

    async def _node_report(self, state: CompanyState) -> Dict[str, Any]:
        company_id = state["company_id"]
        goal = state["goal"]
        research_res = state.get("research_output", {})
        cto_res = state.get("cto_output", {})
        mkt_res = state.get("marketing_output", {})
        dev_res = state.get("dev_output", {})
        decision_res = state.get("decision_output", {})

        async with AsyncSessionLocal() as db:
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                "Compiling final executive deliverable report...", "INFO"
            )

            final_report_md = await self.ceo.generate_final_report(
                goal, research_res, cto_res, mkt_res, dev_res, decision_res
            )

            await CompanyMemoryManager.add_memory(
                db, company_id, "CEO / Orchestrator Agent",
                "FINAL_EXECUTIVE_REPORT", final_report_md, category="DECISION"
            )

            company_result = await db.get(CompanyModel, company_id)
            if company_result:
                company_result.status = "COMPLETED"
                await db.commit()

            await CompanyMemoryManager.update_agent_status(
                db, company_id, "CEO / Orchestrator Agent", "COMPLETED", "Final Company Organization Plan Completed"
            )
            model_info = self.ceo.last_model or self.ceo.provider
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                f"Compiled executive deliverable report [{self.ceo.last_execution_type}: {self.ceo.last_latency}s | {model_info}].",
                "SUCCESS"
            )
            await CompanyMemoryManager.log_activity(
                db, company_id, "CEO / Orchestrator Agent",
                "ORGANIZATION EXECUTION COMPLETED SUCCESSFULLY!", "SUCCESS"
            )

        return {"final_report": final_report_md, "status": "COMPLETED"}

    async def run_pipeline(self, company_id: str, goal: str):
        """Executes the LangGraph StateGraph pipeline."""
        initial_state: CompanyState = {
            "company_id": company_id,
            "goal": goal,
            "tasks": [],
            "research_output": {},
            "cto_output": {},
            "marketing_output": {},
            "dev_output": {},
            "decision_output": {},
            "final_report": "",
            "status": "INITIALIZING"
        }

        try:
            logger.info(f"Starting LangGraph execution for company {company_id} with goal: '{goal}'")
            # Invoke compiled LangGraph pipeline
            await self.graph.ainvoke(initial_state)
            logger.info(f"LangGraph execution finished for company {company_id}")
        except Exception as e:
            logger.error(f"LangGraph pipeline execution error for company {company_id}: {e}", exc_info=True)
            async with AsyncSessionLocal() as db:
                await CompanyMemoryManager.log_activity(
                    db, company_id, "CEO / Orchestrator Agent", f"Pipeline error: {str(e)}", "ERROR"
                )
                company_result = await db.get(CompanyModel, company_id)
                if company_result:
                    company_result.status = "FAILED"
                    await db.commit()

orchestrator = CompanyOrchestrator()
