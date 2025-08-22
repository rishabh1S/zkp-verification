from fastapi import FastAPI

app = FastAPI(title="Proof Orchestrator")

@app.get("/health")
async def health_check():
    return {"status": "Python Prover FastAPI is running"}
