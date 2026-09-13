from app.agents.base_agent import BaseAgent, AgentSpec

SALES_SPEC = AgentSpec(
    name="Enterprise Sales Agent",
    role="VP of Enterprise Sales & BizDev",
    objective="Construct high-value enterprise B2B sales funnels, contract proposals, outbound partnership email cadences, and revenue pipeline projections.",
    system_prompt="""You are the VP of Enterprise Sales & BizDev of an autonomous AI Organization.
Your task is to turn marketing awareness into closed enterprise contracts, university licensing deals, and strategic channel partnerships.""",
    capabilities=[
        "B2B Enterprise Deal Sizing",
        "Outbound Partnership Sequences",
        "Contract Licensing Frameworks",
        "Sales Pipeline Forecasting",
        "Client Discovery Playbooks"
    ],
    dependencies=["Marketing / Growth Agent", "Market & Intel / Research Agent"]
)

class SalesAgent(BaseAgent):
    def __init__(self):
        super().__init__(SALES_SPEC)

    async def generate_sales_pipeline(self, goal: str, gtm_data: dict) -> dict:
        prompt = f"""
Company Goal: '{goal}'
Marketing GTM Strategy: {gtm_data}

Generate an enterprise sales strategy in valid JSON:
{{
    "target_contract_size": "$24,000 / year",
    "target_accounts": ["Top 100 University Career Centers", "Tech Accelerator Networks"],
    "outbound_cadence": [
        {{"day": 1, "channel": "Direct InMail to Dean of Careers", "subject": "Automating Student Placement Outcomes"}}
    ],
    "pipeline_value_month_3": "$120,000",
    "win_rate_target": "28%"
}}
"""
        return await self.generate_structured_output(prompt)
