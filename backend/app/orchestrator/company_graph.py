import asyncio
import json
import logging
from typing import Dict, Any, TypedDict, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.ceo_agent import CEOAgent
from app.agents.research_agent import ResearchAgent
from app.agents.cto_agent import CTOAgent
from app.agents.marketing_agent import MarketingAgent
from app.agents.dev_agent import DevAgent
from app.memory.company_memory import CompanyMemoryManager
from app.models.database import AsyncSessionLocal, CompanyModel

logger = logging.getLogger(__name__)

# State schema for multi-agent graph
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

    async def run_pipeline(self, company_id: str, goal: str):
        async with AsyncSessionLocal() as db:
            try:
                # 1. Update company status to IN_PROGRESS
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

                # 2. CEO Decomposes Goal
                tasks = await self.ceo.decompose_goal(goal)
                await CompanyMemoryManager.log_activity(
                    db, company_id, "CEO / Orchestrator Agent",
                    f"CEO successfully created {len(tasks)} core execution tasks.", "SUCCESS"
                )

                # Save initial task records into DB & broadcast
                for t in tasks:
                    task_obj = TaskModel(
                        company_id=company_id,
                        title=t["title"],
                        description=t["description"],
                        assigned_agent=t["assigned_agent"],
                        status="PENDING",
                        priority=t.get("priority", "MEDIUM"),
                        dependencies=t.get("dependencies", [])
                    )
                    db.add(task_obj)
                    await CompanyMemoryManager.add_memory(
                        db, company_id, "CEO / Orchestrator Agent",
                        f"TASK_{t['title']}", t, category="TASK"
                    )

                await db.commit()

                for t in tasks:
                    await CompanyMemoryManager.update_task_status(
                        db, company_id, t["title"], "PENDING"
                    )

                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "CEO / Orchestrator Agent", "WAITING", "Waiting for agent execution outputs"
                )
                await asyncio.sleep(1)

                # 3. RESEARCH AGENT EXECUTION
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Research Agent", "WORKING", "Conducting market, competitor & user research"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Market & Competitor Research", "RUNNING"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Research Agent", "Started market, competitor & user research...", "INFO"
                )

                research_res = await self.research.execute_research(goal)
                
                await CompanyMemoryManager.add_memory(
                    db, company_id, "Research Agent", "RESEARCH_FINDINGS", research_res, category="RESEARCH"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Market & Competitor Research", "COMPLETED", json.dumps(research_res.get("summary"))
                )
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Research Agent", "COMPLETED", "Research analysis complete"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Research Agent", "Completed market research and stored findings in shared memory.", "SUCCESS"
                )
                await asyncio.sleep(1.5)

                # 4. CTO AGENT EXECUTION
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Strategy / CTO Agent", "WORKING", "Designing system architecture & technical stack"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Technical Architecture & Product Strategy", "RUNNING"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Strategy / CTO Agent", "Retrieved Research findings from shared memory; architecting system...", "INFO"
                )

                cto_res = await self.cto.execute_strategy(goal, research_res)
                
                await CompanyMemoryManager.add_memory(
                    db, company_id, "Strategy / CTO Agent", "CTO_ARCHITECTURE", cto_res, category="ARCHITECTURE"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Technical Architecture & Product Strategy", "COMPLETED", json.dumps(cto_res.get("architecture"))
                )
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Strategy / CTO Agent", "COMPLETED", "Technical architecture complete"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Strategy / CTO Agent", "Completed system architecture & technical roadmap.", "SUCCESS"
                )
                await asyncio.sleep(1.5)

                # 5. MARKETING AGENT EXECUTION
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Marketing Agent", "WORKING", "Defining brand positioning & go-to-market strategy"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Go-To-Market & Marketing Strategy", "RUNNING"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Marketing Agent", "Analyzing goal & research context; formulating GTM plan...", "INFO"
                )

                mkt_res = await self.marketing.execute_marketing(goal, research_res)
                
                await CompanyMemoryManager.add_memory(
                    db, company_id, "Marketing Agent", "MARKETING_STRATEGY", mkt_res, category="MARKETING"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Go-To-Market & Marketing Strategy", "COMPLETED", json.dumps(mkt_res.get("value_prop"))
                )
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Marketing Agent", "COMPLETED", "Marketing strategy complete"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Marketing Agent", "Completed value proposition & positioning framework.", "SUCCESS"
                )
                await asyncio.sleep(1.5)

                # 6. DEVELOPMENT AGENT EXECUTION
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Development Agent", "WORKING", "Generating code artifacts & database DDL schema"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Core Technical Implementation & Code Artifacts", "RUNNING"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Development Agent", "Converting CTO blueprint into SQL DDL and API code snippets...", "INFO"
                )

                dev_res = await self.dev.execute_development(goal, cto_res)
                
                await CompanyMemoryManager.add_memory(
                    db, company_id, "Development Agent", "DEV_CODE_ARTIFACTS", dev_res, category="CODE"
                )
                await CompanyMemoryManager.update_task_status(
                    db, company_id, "Core Technical Implementation & Code Artifacts", "COMPLETED", "Generated SQL DDL and API Endpoints"
                )
                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "Development Agent", "COMPLETED", "Code generation complete"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "Development Agent", "Generated core database DDL and API implementation code.", "SUCCESS"
                )
                await asyncio.sleep(1.5)

                # 7. CONFLICT DETECTION & RESOLUTION (CEO)
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
                await CompanyMemoryManager.log_activity(
                    db, company_id, "CEO / Orchestrator Agent",
                    f"CEO DECISION BINDING: {decision_res['decision']}", "SUCCESS"
                )
                await asyncio.sleep(1.5)

                # 8. FINAL EXECUTIVE REPORT COMPILATION
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

                # Update company status to COMPLETED
                company_result = await db.get(CompanyModel, company_id)
                if company_result:
                    company_result.status = "COMPLETED"
                    await db.commit()

                await CompanyMemoryManager.update_agent_status(
                    db, company_id, "CEO / Orchestrator Agent", "COMPLETED", "Final Company Organization Plan Completed"
                )
                await CompanyMemoryManager.log_activity(
                    db, company_id, "CEO / Orchestrator Agent",
                    "🎉 ORGANIZATION EXECUTION COMPLETED SUCCESSFULLY!", "SUCCESS"
                )

            except Exception as e:
                logger.error(f"Pipeline execution error for company {company_id}: {e}", exc_info=True)
                await CompanyMemoryManager.log_activity(
                    db, company_id, "CEO / Orchestrator Agent", f"Pipeline error: {str(e)}", "ERROR"
                )
                company_result = await db.get(CompanyModel, company_id)
                if company_result:
                    company_result.status = "FAILED"
                    await db.commit()

orchestrator = CompanyOrchestrator()
