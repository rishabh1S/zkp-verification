from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional
from datetime import datetime
import uuid

class Proof(SQLModel, table=True):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    document_id: str
    claim: dict = Field(sa_column=Column(JSON))
    proof: dict = Field(sa_column=Column(JSON), default={})   # zk-proof blob
    proof_hash: str = Field(default="")
    status: str = Field(default="queued")  # queued | running | done | failed
    issued_on: Optional[datetime] = None
    expires_on: Optional[datetime] = None
    issuer: str = Field(default="ZKVerify-MVP")
    issuer_signature: str = Field(default="0xFAKE_SIG")
    error: Optional[str] = None
