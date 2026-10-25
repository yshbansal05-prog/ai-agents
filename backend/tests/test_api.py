import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app"] == "AI Organization API"
    assert "health" in data

@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "healthy"
    assert "version" in data

@pytest.mark.asyncio
async def test_company_lifecycle_api(async_client: AsyncClient):
    # 1. Create company
    goal_text = "Develop an AI-powered code security scanner"
    create_res = await async_client.post(
        "/api/company/create",
        json={"name": "SecureAI Corp", "goal": goal_text}
    )
    assert create_res.status_code == 200
    created = create_res.json()
    company_id = created["company_id"]
    assert created["name"] == "SecureAI Corp"
    assert created["goal"] == goal_text
    assert created["status"] == "INITIALIZING"

    # 2. Get company details
    get_res = await async_client.get(f"/api/company/{company_id}")
    assert get_res.status_code == 200
    comp_data = get_res.json()
    assert comp_data["id"] == company_id
    assert comp_data["name"] == "SecureAI Corp"

    # 3. Get initialized agents (11 departments)
    agents_res = await async_client.get(f"/api/company/{company_id}/agents")
    assert agents_res.status_code == 200
    agents = agents_res.json()
    assert len(agents) == 11
    agent_roles = [a["role"] for a in agents]
    assert any("CEO" in r for r in agent_roles)
    assert any("Research" in r or "Market" in r for r in agent_roles)
    assert any("CTO" in r or "Architect" in r for r in agent_roles)

    # 4. Get initial tasks and activities
    tasks_res = await async_client.get(f"/api/company/{company_id}/tasks")
    assert tasks_res.status_code == 200

    act_res = await async_client.get(f"/api/company/{company_id}/activity")
    assert act_res.status_code == 200
    logs = act_res.json()
    assert len(logs) >= 1
    assert "initialized" in logs[0]["message"].lower()

@pytest.mark.asyncio
async def test_company_not_found(async_client: AsyncClient):
    response = await async_client.get("/api/company/non-existent-id-99999")
    assert response.status_code == 404
