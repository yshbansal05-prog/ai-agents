import pytest
from app.agents.ceo_agent import CEOAgent
from app.agents.cto_agent import CTOAgent
from app.agents.marketing_agent import MarketingAgent
from app.agents.dev_agent import DevAgent
from app.agents.research_agent import ResearchAgent

@pytest.mark.asyncio
async def test_ceo_goal_decomposition():
    ceo = CEOAgent()
    goal = "Build an autonomous AI agent debugging workspace"
    tasks = await ceo.decompose_goal(goal)
    assert isinstance(tasks, list)
    assert len(tasks) >= 4
    assigned_agents = [t["assigned_agent"] for t in tasks]
    assert "Research Agent" in assigned_agents
    assert "Strategy / CTO Agent" in assigned_agents
    assert "Marketing Agent" in assigned_agents
    assert "Development Agent" in assigned_agents

@pytest.mark.asyncio
async def test_research_agent_execution():
    research = ResearchAgent()
    goal = "AI drone logistics"
    res = await research.execute_research(goal)
    assert "summary" in res
    assert "key_findings" in res
    assert "competitors" in res
    assert isinstance(res["key_findings"], list)

@pytest.mark.asyncio
async def test_cto_agent_execution():
    cto = CTOAgent()
    goal = "AI drone logistics"
    res = await cto.execute_strategy(goal, {"summary": "High market growth"})
    assert "architecture" in res
    assert "technology_stack" in res
    assert "features" in res
    assert isinstance(res["features"], list)

@pytest.mark.asyncio
async def test_marketing_agent_execution():
    marketing = MarketingAgent()
    goal = "AI drone logistics"
    res = await marketing.execute_marketing(goal, {"summary": "High market growth"})
    assert "value_prop" in res
    assert "target_audience" in res
    assert "gtm_strategy" in res

@pytest.mark.asyncio
async def test_dev_agent_execution():
    dev = DevAgent()
    goal = "AI drone logistics"
    res = await dev.execute_development(goal, {"architecture": "Next.js + FastAPI"})
    assert "sql_ddl" in res
    assert "api_spec" in res
    assert "code_deliverable" in res

@pytest.mark.asyncio
async def test_ceo_conflict_resolution_and_report():
    ceo = CEOAgent()
    goal = "AI drone logistics"
    conflict = await ceo.resolve_conflict(
        goal,
        cto_output={"architecture": "Strict microservices schema with 99.999% uptime"},
        marketing_output={"gtm_strategy": ["Ship in 2 days to beat competitor launch"]}
    )
    assert "title" in conflict
    assert "decision" in conflict
    assert "rationale" in conflict

    report = await ceo.generate_final_report(
        goal,
        research_out={"summary": "Market validated"},
        cto_out={"architecture": "Next.js + FastAPI"},
        marketing_out={"value_prop": "Fastest drone delivery"},
        dev_out={"sql_ddl": "CREATE TABLE test();"},
        decision_out=conflict
    )
    assert isinstance(report, str)
    assert len(report) > 100
    assert "EXECUTIVE" in report or "Executive" in report
