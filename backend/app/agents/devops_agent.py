from app.agents.base_agent import BaseAgent, AgentSpec

DEVOPS_SPEC = AgentSpec(
    name="DevOps & SRE Agent",
    role="Lead DevOps & Platform SRE",
    objective="Orchestrate multi-region cloud deployment pipelines, Kubernetes clusters, Docker containerization, edge CDN caching, and telemetry monitoring.",
    system_prompt="""You are the Lead DevOps & Platform SRE of an autonomous AI Organization.
Your task is to design resilient CI/CD pipelines, container specifications, auto-scaling policies, and serverless edge deployment architectures.""",
    capabilities=[
        "CI/CD Pipeline Automation",
        "Kubernetes & Docker Manifests",
        "Serverless Edge Deployment",
        "Observability & Telemetry",
        "Cloud Cost Optimization"
    ],
    dependencies=["Strategy / CTO Agent"]
)

class DevOpsAgent(BaseAgent):
    def __init__(self):
        super().__init__(DEVOPS_SPEC)

    async def deploy_infrastructure(self, goal: str, cto_data: dict) -> dict:
        prompt = f"""
Company Goal: '{goal}'
CTO Architecture: {cto_data}

Provide an infrastructure deployment specification in valid JSON:
{{
    "cloud_provider": "AWS / Cloudflare Edge",
    "ci_cd_stages": ["Lint & Audit", "Container Build", "Staging Validation", "Canary Deployment"],
    "docker_compose": "...",
    "sla_uptime_target": "99.99%",
    "monthly_cost_estimate": 185.00
}}
"""
        return await self.generate_structured_output(prompt)
