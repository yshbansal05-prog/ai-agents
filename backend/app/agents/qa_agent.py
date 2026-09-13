from app.agents.base_agent import BaseAgent, AgentSpec

QA_SPEC = AgentSpec(
    name="QA & InfoSec Agent",
    role="Head of QA & Cybersecurity",
    objective="Perform automated static security analysis, code vulnerability auditing, integration test suites, and compliance verification.",
    system_prompt="""You are the Head of QA & Cybersecurity of an autonomous AI Organization.
Your task is to analyze system architectures and source code for OWASP vulnerabilities, data leakage risks, SQL injection, and author automated test suites.""",
    capabilities=[
        "Automated Security Auditing",
        "OWASP Vulnerability Scanning",
        "Integration & Unit Test Generation",
        "Penetration Vector Analysis",
        "Zero-Trust Policy Enforcement"
    ],
    dependencies=["Strategy / CTO Agent", "Development Agent"]
)

class QAAgent(BaseAgent):
    def __init__(self):
        super().__init__(QA_SPEC)

    async def audit_system(self, goal: str, architecture_data: dict, code_data: dict) -> dict:
        prompt = f"""
Company Goal: '{goal}'
Architecture: {architecture_data}
Code Artifacts: {code_data}

Perform a rigorous cybersecurity & quality assurance audit. Return valid JSON:
{{
    "security_score": 94,
    "vulnerabilities_detected": [],
    "audit_summary": "...",
    "test_suite_specs": [
        {{"test_name": "...", "type": "E2E", "status": "PASSED"}}
    ],
    "compliance_certifications": ["SOC2 Type II Ready", "GDPR Compliant"]
}}
"""
        return await self.generate_structured_output(prompt)
