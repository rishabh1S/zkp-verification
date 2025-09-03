from pydantic import BaseModel

class ClaimModel(BaseModel):
    claimType: str
    threshold: int
