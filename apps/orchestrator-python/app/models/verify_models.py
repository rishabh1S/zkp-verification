from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any, Literal, Optional

class ProofToken(BaseModel):
    id: str
    document_id: str
    claim: List[Dict[str, Any]]
    proof_hash: str
    issuer: str
    issued_on: datetime
    expires_on: datetime
    issuer_signature: str

class VerifyRequest(BaseModel):
    token: ProofToken
    method: Optional[Literal["onchain", "offchain"]] = "offchain"

class VerifyResponse(BaseModel):
    valid: bool
    reason: str | None = None
    method: str = "offchain"  # offchain or onchain (later)
    txHash: str | None = None
    details: dict | None = None

class RevokeRequest(BaseModel):
    proof_hash: str
    reason: str | None = None


class RevokeResponse(BaseModel):
    ok: bool
    reason: str | None = None