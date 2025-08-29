from pydantic import BaseModel
from typing import Optional, Any

class ProofRequest(BaseModel):
    document_id: str
    claim: Any
    wallet_address: Optional[str] = None
    expires_in_days: Optional[int] = 30

class ProofStatusResponse(BaseModel):
    status: str   # queued | running | done | failed
    token: Optional[Any] = None
    proof_uri: Optional[str] = None
    error: Optional[str] = None
