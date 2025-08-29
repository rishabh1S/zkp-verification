from fastapi import APIRouter
from typing import Any

router = APIRouter(prefix="/api/credentials", tags=["credentials"])

@router.post("/verify")
async def verify_credential(payload: dict) -> Any:
    # MVP: always return valid
    return {"valid": True, "method": "offchain", "details": {"mock": True}}

@router.post("/revoke")
async def revoke_credential(payload: dict) -> Any:
    # MVP: just ack
    return {"ok": True, "reason": payload.get("reason", "none")}
