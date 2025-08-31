from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional
from datetime import datetime, timezone

class Verification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    proof_job_id: Optional[str] = Field(default=None, foreign_key="proof.job_id")
    proof_hash: Optional[str] = Field(default=None, index=True)
    verifier: Optional[str] = Field(default=None)   
    method: str = Field(default="onchain")        
    tx_hash: Optional[str] = Field(default=None)
    valid: bool = Field(default=False)
    details: dict = Field(sa_column=Column(JSON), default={})
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
