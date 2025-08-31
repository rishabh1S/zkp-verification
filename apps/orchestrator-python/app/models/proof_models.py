from pydantic import BaseModel
from typing import Any, Optional

class ProofRequest(BaseModel):
    document_id: str
    claim: Any
    wallet_address: Optional[str] = None
    expires_in_days: Optional[int] = 30

class ProofStatusResponse(BaseModel):
    status: str
    token: Optional[Any] = None
    error: Optional[str] = None
