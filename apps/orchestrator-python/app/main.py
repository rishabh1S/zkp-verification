from fastapi import FastAPI
from app.routers import proofs, credentials
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="ZKVerify Proof Orchestrator",
    description="API for generating and verifying Zero-Knowledge proofs"
)
allowed_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin], 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(proofs.router)
app.include_router(credentials.router)

@app.get("/health")
async def health_check():
    return {"status": "Python Prover FastAPI is running"}
