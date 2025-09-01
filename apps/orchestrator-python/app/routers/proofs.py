from fastapi import APIRouter, BackgroundTasks, Depends
from sqlmodel import Session, select
from app.models.proof_models import ProofRequest, ProofStatusResponse
from app.models.entity.proof_entity import Proof
from app.services.prover_service import run_proof_job, create_job
from app.db import get_session
import uuid

router = APIRouter(prefix="/api/proofs", tags=["proofs"])

@router.post("/generate")
async def generate_proof(req: ProofRequest,background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    create_job(job_id, req.dict())
    background_tasks.add_task(run_proof_job, job_id, req.dict())
    return {"job_id": job_id}

@router.get("/status/{job_id}", response_model=ProofStatusResponse)
async def get_status(job_id: str, session: Session = Depends(get_session)):
    proof = session.exec(select(Proof).where(Proof.job_id == job_id)).first()
    if not proof:
        return {"status": "not_found"}
    if proof.status == "done":
        return {
            "status": proof.status,
            "token": {
                "id": f"token_{proof.job_id}",
                "document_id": proof.document_id,
                "claim": proof.claim,
                "proof_hash": proof.proof_hash,
                "issuer": proof.issuer,
                "issued_on": proof.issued_on,
                "expires_on": proof.expires_on,
                "issuer_signature": proof.issuer_signature,
            }
        }
    return {"status": proof.status, "error": proof.error}
