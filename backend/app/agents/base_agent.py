import os
import re
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Ensure environment variables from backend/.env are loaded even if cwd is repo root
_backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env, override=False)
else:
    load_dotenv(override=False)

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

import time

class BaseAgent:
    def __init__(self, spec: AgentSpec):
        self.spec = spec
        self.provider = os.getenv("LLM_PROVIDER", "gemini").lower()
        self.timeout = float(os.getenv("LLM_TIMEOUT", "75.0"))
        self.last_execution_type: str = "PENDING"
        self.last_latency: float = 0.0
        self.last_provider: str = self.provider
        self.last_model: str = ""
        self.last_fallback_reason: Optional[str] = None

    def get_llm(self):
        """Attempts to initialize an LLM based on environment variables."""
        try:
            if self.provider == "gemini" and is_valid_key(os.getenv("GEMINI_API_KEY")):
                from langchain_google_genai import ChatGoogleGenerativeAI
                model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
                self.last_model = model_name
                return ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=os.getenv("GEMINI_API_KEY"),
                    temperature=0.7
                )
            elif self.provider == "openai" and is_valid_key(os.getenv("OPENAI_API_KEY")):
                from langchain_openai import ChatOpenAI
                model_name = os.getenv("OPENAI_MODEL", "gpt-4o")
                self.last_model = model_name
                return ChatOpenAI(
                    model=model_name,
                    api_key=os.getenv("OPENAI_API_KEY"),
                    temperature=0.7
                )
            elif self.provider == "groq" and is_valid_key(os.getenv("GROQ_API_KEY")):
                from langchain_openai import ChatOpenAI
                model_name = os.getenv("GROQ_MODEL", "llama3-70b-8192")
                self.last_model = model_name
                return ChatOpenAI(
                    model=model_name,
                    api_key=os.getenv("GROQ_API_KEY"),
                    base_url="https://api.groq.com/openai/v1",
                    temperature=0.7
                )
            elif self.provider == "nvidia" and is_valid_key(os.getenv("NVIDIA_API_KEY")):
                from langchain_openai import ChatOpenAI
                base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
                api_key = os.getenv("NVIDIA_API_KEY", "not-needed-for-local-nim")
                model_name = os.getenv("NVIDIA_MODEL", "meta/llama-3.2-11b-vision-instruct")
                self.last_model = model_name
                return ChatOpenAI(
                    model=model_name,
                    api_key=api_key,
                    base_url=base_url,
                    temperature=0.7
                )
            elif self.provider in ["local", "ollama", "vllm"]:
                from langchain_openai import ChatOpenAI
                base_url = os.getenv("LOCAL_LLM_URL", "http://localhost:11434/v1")
                model_name = os.getenv("LOCAL_MODEL", "llama3")
                self.last_model = model_name
                return ChatOpenAI(
                    model=model_name,
                    base_url=base_url,
                    api_key="ollama",
                    temperature=0.7
                )
            else:
                self.last_execution_type = "FALLBACK"
                self.last_fallback_reason = f"Provider '{self.provider}' not configured or missing API key"
                return None
        except Exception as e:
            self.last_execution_type = "FALLBACK"
            self.last_fallback_reason = f"Failed to initialize provider '{self.provider}': {e}"
            logger.error(f"Failed to initialize provider '{self.provider}': {e}")
            return None

    async def invoke_llm(self, prompt: str) -> Optional[str]:
        """Invokes the configured LLM and returns the string response with performance tracking."""
        t0 = time.time()
        llm = self.get_llm()
        if not llm:
            logger.warning(f"[{self.spec.name}] Execution: FALLBACK | Reason: {self.last_fallback_reason}")
            return None

        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            response = await asyncio.wait_for(
                llm.ainvoke([
                    SystemMessage(content=self.spec.system_prompt),
                    HumanMessage(content=prompt)
                ]),
                timeout=self.timeout
            )
            dur = time.time() - t0
            if hasattr(response, "content") and response.content:
                self.last_execution_type = "REAL_LLM"
                self.last_latency = round(dur, 2)
                self.last_fallback_reason = None
                model_display = self.last_model or getattr(llm, "model_name", "llm")
                logger.info(f"[{self.spec.name}] Execution: REAL_LLM | Provider: {self.provider} | Model: {model_display} | Latency: {self.last_latency}s")
                return str(response.content)
        except asyncio.TimeoutError:
            self.last_execution_type = "FALLBACK"
            self.last_fallback_reason = f"LLM timeout ({self.timeout}s)"
            self.last_latency = round(time.time() - t0, 2)
            logger.warning(f"[{self.spec.name}] Execution: FALLBACK | Reason: {self.last_fallback_reason}")
        except Exception as e:
            self.last_execution_type = "FALLBACK"
            self.last_fallback_reason = f"LLM error: {str(e)}"
            self.last_latency = round(time.time() - t0, 2)
            logger.error(f"[{self.spec.name}] Execution: FALLBACK | Reason: {self.last_fallback_reason}")

        return None

    async def invoke_json_llm(self, prompt: str) -> Optional[Any]:
        """Invokes LLM and attempts to parse valid JSON from the response with sanitization."""
        raw = await self.invoke_llm(prompt)
        if not raw:
            return None

        # Clean markdown code blocks
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()

        # Helper to repair common JSON irregularities (trailing commas, quotes)
        def clean_json_text(text: str) -> str:
            # Remove trailing commas before closing braces/brackets
            text = re.sub(r",\s*([\]}])", r"\1", text)
            # Replace backtick-quoted values e.g. "sql_ddl": `...` -> "sql_ddl": "..."
            def backtick_sub(match):
                inner = match.group(1).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
                return f': "{inner}"'
            text = re.sub(r':\s*`([^`]*)`', backtick_sub, text, flags=re.DOTALL)
            # Replace triple-quoted string values e.g. "sql_ddl": """...""" -> "sql_ddl": "..."
            def triple_quote_sub(match):
                inner = match.group(1).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
                return f': "{inner}"'
            text = re.sub(r':\s*"""(.*?)"""', triple_quote_sub, text, flags=re.DOTALL)
            return text
        
        # 1. Try standard JSON parse with strict=False
        try:
            return json.loads(clean_json_text(cleaned), strict=False)
        except Exception:
            pass

        # 2. Try regex extraction of JSON object or array
        match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
        if match:
            extracted = match.group(1)
            try:
                return json.loads(clean_json_text(extracted), strict=False)
            except Exception:
                # 3. Sanitize invalid escape characters (e.g. \d, \s in SQL/code)
                try:
                    sanitized = re.sub(r'\\([^"\\/bfnrtu])', r'\\\\\1', clean_json_text(extracted))
                    return json.loads(sanitized, strict=False)
                except Exception as e:
                    logger.warning(f"Failed to parse extracted JSON in {self.spec.name}: {e}")

        logger.warning(f"Failed to parse JSON response in {self.spec.name}: {raw[:150]}")
        return None
