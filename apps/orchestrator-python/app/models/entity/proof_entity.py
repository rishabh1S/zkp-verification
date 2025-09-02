from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional
from datetime import datetime, timezone
import uuid

class Proof(SQLModel, table=True):
    proof_id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    document_id: str
    claim: dict = Field(sa_column=Column(JSON))
    proof_hash: str = Field(index=True, unique=True)
    status: str = Field(default="valid")   # valid | revoked
    reason: Optional[str] = None
    issuer: str = Field(default="ZKVerify-MVP")
    issuer_signature: str = Field(default="0xFAKE_SIG")
    issued_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_on: Optional[datetime] = None
    revoked_on: Optional[datetime] = None
