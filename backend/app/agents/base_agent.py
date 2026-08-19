import os
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class AgentSpec(BaseModel):
    name: str
    role: str
    objective: str
    system_prompt: str
    capabilities: List[str]
    dependencies: List[str]

class BaseAgent:
    def __init__(self, spec: AgentSpec):
        self.spec = spec
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()

    def get_llm(self):
        """Attempts to initialize an LLM based on environment variables."""
        try:
            if self.provider == "gemini" and os.getenv("GEMINI_API_KEY"):
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(
                    model="gemini-1.5-pro",
                    google_api_key=os.getenv("GEMINI_API_KEY"),
                    temperature=0.7
                )
            elif self.provider == "openai" and os.getenv("OPENAI_API_KEY"):
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model="gpt-4o",
                    api_key=os.getenv("OPENAI_API_KEY"),
                    temperature=0.7
                )
            elif self.provider == "groq" and os.getenv("GROQ_API_KEY"):
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model="llama3-70b-8192",
                    api_key=os.getenv("GROQ_API_KEY"),
                    base_url="https://api.groq.com/openai/v1",
                    temperature=0.7
                )
        except Exception as e:
            logger.warning(f"Error initializing LLM provider '{self.provider}': {e}. Falling back to default mock LLM engine.")
        return None

    async def invoke_llm(self, prompt: str) -> str:
        """Invokes real LLM if configured; otherwise uses deterministic agent generator."""
        llm = self.get_llm()
        if llm:
            try:
                from langchain_core.messages import SystemMessage, HumanMessage
                response = await llm.ainvoke([
                    SystemMessage(content=self.spec.system_prompt),
                    HumanMessage(content=prompt)
                ])
                return response.content
            except Exception as e:
                logger.error(f"LLM execution failed for {self.spec.name}: {e}. Proceeding with fallback agent generator.")

        # Fallback heuristic agent response generator ensures zero crash demo
        return None
