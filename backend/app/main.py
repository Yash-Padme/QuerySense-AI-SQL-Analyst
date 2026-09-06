import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.database.connection import DATABASE_URL
from app.database.seed_db import seed_database
from pathlib import Path

app = FastAPI(
    title="AI SQL Analyst Agent Workspace Backend",
    version="1.0.0",
    description="Production engine runtime running multi-agent tools to dynamically generate, validate, and chart SQL calculations."
)

# Enable connection permissions for decoupled web interfaces (React / NextJS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    if DATABASE_URL.startswith("sqlite:///"):
        db_file_path = DATABASE_URL.replace("sqlite:////", "/").replace("sqlite:///", "")
        db_path = Path(db_file_path).resolve()
        
        # Folder create karein agar nahi bana ho
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        if not db_path.exists():
            print(f"Database not found at {db_path}. Seeding initial data...")
            seed_database()

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
@app.get("/api/v1")
@app.get("/api/v1/")
def read_root():
    return {"status": "online", "engine": "AI SQL Analyst Core v1.0.0"}

# 👈 Yeh add karein taaki /api/v1/ hit hone par 200 OK mile
@app.get("/api/v1")
@app.get("/api/v1/")
def read_api_root():
    return {"status": "online", "engine": "AI SQL Analyst Core v1.0.0"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
