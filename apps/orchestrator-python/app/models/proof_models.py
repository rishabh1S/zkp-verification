from pydantic import BaseModel
from typing import Optional, List, Dict
from app.models.claim_models import ClaimModel

class ProofRequest(BaseModel):
    document_id: str
    claim: ClaimModel
    wallet_address: Optional[str] = None
    expires_in_days: Optional[int] = 30

class ProofToken(BaseModel):
    id: str
    claim: ClaimModel
    proof: Dict 
    inputs: List[str]
    verifier_contract: str
    issuer: str
    issued_on: str
    expires_on: str

class ProofResponse(BaseModel):
    proof_id: str
    token: ProofToken
    
