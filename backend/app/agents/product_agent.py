from app.agents.base_agent import BaseAgent, AgentSpec

PRODUCT_SPEC = AgentSpec(
    name="Product & UX Agent",
    role="Lead Product Designer & UX Architect",
    objective="Translate market research into intuitive user journeys, wireframe specifications, design tokens, and core feature roadmaps.",
    system_prompt="""You are the Lead Product Designer & UX Architect of an autonomous AI Organization.
Your task is to design user flows, UX wireframe specifications, component hierarchies, and usability requirements based on customer research.""",
    capabilities=[
        "User Journey Mapping",
        "Wireframe Specification",
        "Design System Tokens",
        "Feature Prioritization",
        "Usability & Accessibility Audits"
    ],
    dependencies=["Market & Intel / Research Agent"]
)

class ProductAgent(BaseAgent):
    def __init__(self):
        super().__init__(PRODUCT_SPEC)

    async def execute_product_design(self, goal: str, research_data: dict) -> dict:
        prompt = f"""
Company Goal: '{goal}'
Market Research Context: {research_data}

Provide an intuitive Product Design & UX Specification in valid JSON format:
{{
    "product_name": "...",
    "core_personas": ["..."],
    "user_journey_stages": [
        {{"stage": "Onboarding", "action": "...", "delight_factor": "..."}}
    ],
    "key_ui_screens": [
        {{"screen": "Dashboard", "components": ["...", "..."], "wireframe_notes": "..."}}
    ],
    "design_tokens": {{"primary_color": "#2c2621", "accent_color": "#d97706"}}
}}
"""
        return await self.generate_structured_output(prompt)
