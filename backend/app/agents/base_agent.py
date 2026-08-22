import os
import re
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

logger = logging.getLogger(__name__)

def is_valid_key(key: Optional[str]) -> bool:
    """Validates that an API key is not empty or default placeholder."""
    if not key:
        return False
    placeholder_tokens = ["your_", "placeholder", "key_here", "api_key", "xxx"]
    low = key.lower()
    return not any(p in low for p in placeholder_tokens)

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
        self.timeout = float(os.getenv("LLM_TIMEOUT", "12.0"))

    def get_llm(self):
        """Attempts to initialize an LLM based on environment variables."""
        try:
            if self.provider == "gemini" and is_valid_key(os.getenv("GEMINI_API_KEY")):
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(
                    model=os.getenv("GEMINI_MODEL", "gemini-1.5-pro"),
                    google_api_key=os.getenv("GEMINI_API_KEY"),
                    temperature=0.7
                )
            elif self.provider == "openai" and is_valid_key(os.getenv("OPENAI_API_KEY")):
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model=os.getenv("OPENAI_MODEL", "gpt-4o"),
                    api_key=os.getenv("OPENAI_API_KEY"),
                    temperature=0.7
                )
            elif self.provider == "groq" and is_valid_key(os.getenv("GROQ_API_KEY")):
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(
                    model=os.getenv("GROQ_MODEL", "llama3-70b-8192"),
                    api_key=os.getenv("GROQ_API_KEY"),
                    base_url="https://api.groq.com/openai/v1",
                    temperature=0.7
                )
            elif self.provider == "nvidia" and is_valid_key(os.getenv("NVIDIA_API_KEY")):
                from langchain_openai import ChatOpenAI
                base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
                api_key = os.getenv("NVIDIA_API_KEY", "not-needed-for-local-nim")
                model_name = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
                return ChatOpenAI(
                    model=model_name,
                    api_key=api_key,
                    base_url=base_url,
                    temperature=0.7
                )
            elif self.provider in ["local", "ollama", "vllm"]:
                from langchain_openai import ChatOpenAI
                base_url = os.getenv("LOCAL_LLM_URL", "http://localhost:11434/v1")
                model_name = os.getenv("LOCAL_LLM_MODEL", "llama3.1")
                return ChatOpenAI(
                    model=model_name,
                    api_key=os.getenv("LOCAL_LLM_API_KEY", "local-key"),
                    base_url=base_url,
                    temperature=0.7
                )
        except Exception as e:
            logger.warning(f"Error initializing LLM provider '{self.provider}': {e}. Falling back to default heuristic engine.")
        return None

    async def invoke_llm(self, prompt: str) -> Optional[str]:
        """Invokes real LLM with timeout protection; falls back gracefully on error/timeout."""
        llm = self.get_llm()
        if llm:
            try:
                from langchain_core.messages import SystemMessage, HumanMessage
                response = await asyncio.wait_for(
                    llm.ainvoke([
                        SystemMessage(content=self.spec.system_prompt),
                        HumanMessage(content=prompt)
                    ]),
                    timeout=self.timeout
                )
                if hasattr(response, "content") and response.content:
                    return str(response.content)
            except asyncio.TimeoutError:
                logger.warning(f"LLM request timed out ({self.timeout}s) for {self.spec.name}. Proceeding with fallback agent generator.")
            except Exception as e:
                logger.error(f"LLM execution failed for {self.spec.name}: {e}. Proceeding with fallback agent generator.")

        return None

    async def invoke_json_llm(self, prompt: str) -> Optional[Any]:
        """Invokes LLM and attempts to parse valid JSON from the response."""
        raw = await self.invoke_llm(prompt)
        if not raw:
            return None

        # Clean markdown code blocks
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
        
        # 1. Try standard JSON parse with strict=False
        try:
            return json.loads(cleaned, strict=False)
        except Exception:
            pass

        # 2. Try regex extraction of JSON object/array
        match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
        if match:
            extracted = match.group(1)
            try:
                return json.loads(extracted, strict=False)
            except Exception:
                # 3. Sanitize invalid escape characters (e.g. \d, \s in SQL/code)
                try:
                    sanitized = re.sub(r'\\([^"\\/bfnrtu])', r'\\\\\1', extracted)
                    return json.loads(sanitized, strict=False)
                except Exception as e:
                    logger.warning(f"Failed to parse extracted JSON in {self.spec.name}: {e}")

        logger.warning(f"Failed to parse JSON response in {self.spec.name}: {raw[:150]}")
        return None
