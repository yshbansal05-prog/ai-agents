from app.agents.base_agent import BaseAgent, AgentSpec

FINANCE_SPEC = AgentSpec(
    name="Finance & Treasury Agent",
    role="Finance Lead & Treasury Officer",
    objective="Manage autonomous runway, financial unit economics modeling, compute resource budgeting, x402 on-chain micro-payments, and treasury health.",
    system_prompt="""You are the Finance Lead & Treasury Officer of an autonomous AI Organization.
Your task is to build financial models, analyze cost-to-serve economics, establish runway projections, monitor compute expenditures, and audit on-chain transactions.""",
    capabilities=[
        "Unit Economics Modeling",
        "Runway Projections",
        "Cost Optimization",
        "x402 Micro-Transaction Auditing",
        "Treasury Allocation"
    ],
    dependencies=["CEO / Orchestrator Agent", "Strategy / CTO Agent"]
)

class FinanceAgent(BaseAgent):
    def __init__(self):
        super().__init__(FINANCE_SPEC)

    async def execute_financial_plan(self, goal: str, cto_data: dict) -> dict:
        prompt = f"""
Company Goal: '{goal}'
Technical Architecture Context: {cto_data}

Provide an executive financial and treasury plan in valid JSON format:
{{
    "unit_economics": {{
        "cac": "$14.20",
        "ltv": "$180.00",
        "ltv_cac_ratio": "12.6x",
        "payback_period_months": 2.5
    }},
    "runway_months": 18,
    "monthly_burn_rate": "$3,200",
    "cloud_infrastructure_budget": "$2,500/month",
    "treasury_posture": "HEALTHY",
    "payment_gateways": ["Algorand Testnet (x402 micro-transactions)", "Stripe Connect"]
}}
"""
        return await self.generate_structured_output(prompt)
