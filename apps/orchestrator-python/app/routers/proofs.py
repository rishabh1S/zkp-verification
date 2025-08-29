from fastapi import APIRouter, BackgroundTasks
import uuid
from app.models.proof_models import ProofRequest, ProofStatusResponse
from app.store.job_store import jobs
from app.services.prover import run_proof_job

router = APIRouter(prefix="/api/proofs", tags=["proofs"])

@router.post("/generate")
async def generate_proof(req: ProofRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued"}
    background_tasks.add_task(run_proof_job, job_id, req.dict())
    return {"job_id": job_id}

@router.get("/status/{job_id}", response_model=ProofStatusResponse)
async def get_status(job_id: str):
    return jobs.get(job_id, {"status": "not_found"})
