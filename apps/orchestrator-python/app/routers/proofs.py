from fastapi import APIRouter, HTTPException
from app.models.proof_models import ProofRequest, ProofResponse
from app.services.prover_service import generate_proof

router = APIRouter(prefix="/api/proofs", tags=["proofs"])

@router.post("/generate", response_model=ProofResponse)
async def generate_proof_api(req: ProofRequest):
    try:
        return generate_proof(req.document_id, req.claim, req.expires_in_days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))