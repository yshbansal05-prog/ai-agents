from app.agents.base_agent import BaseAgent, AgentSpec

LEGAL_SPEC = AgentSpec(
    name="Legal & Compliance Agent",
    role="Chief Legal & Compliance Counsel",
    objective="Establish enterprise compliance policies, student data privacy safeguards (FERPA/GDPR), Terms of Service, and AI IP governance.",
    system_prompt="""You are the Chief Legal & Compliance Counsel of an autonomous AI Organization.
Your task is to draft data protection guidelines, terms of service, AI model liability disclaimers, and verify regulatory adherence.""",
    capabilities=[
        "FERPA & GDPR Compliance",
        "Terms of Service & Privacy Policy",
        "AI IP & Copyright Auditing",
        "Contract Liability Review",
        "Regulatory Risk Assessment"
    ],
    dependencies=["CEO / Orchestrator Agent", "Finance / Dev Lead"]
)

class LegalAgent(BaseAgent):
    def __init__(self):
        super().__init__(LEGAL_SPEC)

    async def review_compliance(self, goal: str) -> dict:
        prompt = f"""
Company Goal: '{goal}'

Provide a legal and compliance roadmap in valid JSON:
{{
    "privacy_framework": "GDPR + FERPA compliant student data retention",
    "key_clauses": [
        {{"title": "Student Data Sovereignty", "summary": "Zero training on private student submissions without explicit opt-in."}}
    ],
    "risk_exposure": "LOW",
    "compliance_checklist": ["Data Processing Addendum", "Cookie Consent", "AI Model Transparency Notice"]
}}
"""
        return await self.generate_structured_output(prompt)
