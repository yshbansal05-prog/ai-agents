import os
import logging
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from typing import Dict, Any
backend_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
root_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)
elif os.path.exists(root_env):
    load_dotenv(root_env)
else:
    load_dotenv()

# Configure structured logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_org_api")

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import init_db, get_db
from app.api.routes import router as company_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager handling startup and shutdown events."""
    logger.info("Initializing AI Organization database schema and services...")
    await init_db()
    logger.info("Database schema initialized successfully.")
    yield
    logger.info("Shutting down AI Organization services gracefully.")

app = FastAPI(
    title="AI Organization Backend API",
    description="Multi-Agent Enterprise Orchestrator powering autonomous organizational workflows.",
    version="1.0.0",
    lifespan=lifespan
)

# Parse allowed CORS origins
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(company_router)

@app.get("/health", tags=["System"])
async def health_check(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Health check endpoint validating database connectivity and system status."""
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": "1.0.0",
        "llm_provider": os.getenv("LLM_PROVIDER", "gemini")
    }

@app.get("/", tags=["System"])
async def root() -> Dict[str, Any]:
    return {
        "status": "online",
        "app": "AI Organization API",
        "tagline": "From AI Assistants to AI Organizations",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENV", "development").lower() == "development"
    uvicorn.run("main:app", host=host, port=port, reload=reload)
