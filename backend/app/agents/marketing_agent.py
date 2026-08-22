import json
from typing import Dict, Any
from app.agents.base_agent import BaseAgent, AgentSpec

MARKETING_SPEC = AgentSpec(
    name="Marketing Agent",
    role="VP of Marketing & Brand Strategy",
    objective="Establish product positioning, customer acquisition channels, go-to-market strategies, and value messaging.",
    system_prompt="""You are the VP of Marketing of an autonomous AI Organization.
Your task is to review company goals and research findings, then design an impactful marketing, positioning, and customer acquisition strategy.""",
    capabilities=[
        "Target Persona Profiling",
        "Value Proposition Design",
        "Brand Positioning",
        "Go-To-Market Strategy",
        "Pricing & Monetization Strategy"
    ],
    dependencies=["Research Agent"]
)

class MarketingAgent(BaseAgent):
    def __init__(self):
        super().__init__(MARKETING_SPEC)

    async def execute_marketing(self, goal: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
Company Goal: '{goal}'
Market Research Findings: {json.dumps(research_data)}

Design the marketing, brand positioning, and go-to-market (GTM) strategy for this company.
Respond in valid JSON format matching this schema:
{{
  "target_audience": ["Primary target user group", "Secondary target segment", "Tertiary stakeholders"],
  "value_prop": "Compelling, single-sentence value proposition",
  "positioning": "Brand positioning statement differentiating from alternatives",
  "gtm_strategy": ["Growth channel / launch tactic 1", "Growth channel / launch tactic 2", "Viral loop / referral mechanism"],
  "pricing_model": {{
    "tier_1": "Description of free/starter tier",
    "tier_2": "Description of premium/enterprise tier"
  }},
  "risks": ["Marketing/adoption risk 1", "Marketing/adoption risk 2"]
}}
"""
        parsed = await self.invoke_json_llm(prompt)
        if isinstance(parsed, dict) and "value_prop" in parsed:
            return parsed

        domain = goal.strip().rstrip(".")
        return {
            "target_audience": [
                f"Primary: End-users seeking automated solutions for {domain}.",
                "Secondary: Enterprise teams and businesses looking to streamline workflow bottlenecks.",
                "Tertiary: Ecosystem partners, developers, and platform integrators."
            ],
            "value_prop": f"The world's first AI-orchestrated platform that delivers autonomous end-to-end execution for {domain}.",
            "positioning": f"From manual, fragmented tools to intelligent autonomous {domain} orchestration.",
            "gtm_strategy": [
                f"Community Pilot Launch: Direct outreach and invite-only beta for leading teams in {domain}.",
                "Developer & Partner Program: Open API integrations and strategic co-marketing.",
                "Content & Viral Loops: Shareable outcome dashboards and benchmark case studies."
            ],
            "pricing_model": {
                "Starter Tier": "Free / self-serve with core workflow automation capabilities.",
                "Enterprise Tier": "Usage-based or tiered SaaS subscription with dedicated support and custom integrations."
            },
            "risks": [
                "Early customer onboarding friction and change management.",
                "Market education needed for autonomous AI workflows."
            ]
        }
