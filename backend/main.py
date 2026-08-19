import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import init_db
from app.api.routes import router as company_router

app = FastAPI(
    title="AI Organization Backend API",
    description="Multi-Agent Organization Orchestrator for Hackathon MVP",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(company_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "AI Organization API",
        "tagline": "From AI Assistants to AI Organizations",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
