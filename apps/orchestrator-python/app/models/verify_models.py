from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Literal, Optional
from app.models.claim_models import ClaimModel

class ProofToken(BaseModel):
    claim: ClaimModel
    proof: Dict
    inputs: List[str]
    verifier_contract: str
    issuer: str
    issued_on: datetime
    expires_on: datetime

class VerifyRequest(BaseModel):
    token: ProofToken
    method: Optional[Literal["onchain", "offchain"]] = "offchain"

class VerifyResponse(BaseModel):
    valid: bool
    reason: Optional[str] = None
    method: str = "offchain"
    txHash: Optional[str] = None
    details: Optional[dict] = None

class RevokeRequest(BaseModel):
    proof_hash: str
    reason: str | None = None

class RevokeResponse(BaseModel):
    ok: bool
    reason: str | None = None