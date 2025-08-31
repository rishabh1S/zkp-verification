from fastapi import APIRouter, Depends
from sqlmodel import Session
from datetime import datetime, timezone

from app.db import get_session
from app.models.verify_models import (
    VerifyRequest, VerifyResponse,
    RevokeRequest, RevokeResponse
)

router = APIRouter(prefix="/api/credentials", tags=["credentials"])

@router.post("/verify", response_model=VerifyResponse)
async def verify_credential(
    req: VerifyRequest,
    session: Session = Depends(get_session)
):
    token = req.token

    # -------------------------
    # Stubbed verification flow
    # -------------------------

    details = {
        "claim_verified": True,       
        "issuer_trusted": token.issuer == "ZKVerify-MVP",
        "not_expired": token.expires_on.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc),
        "signature_valid": True,        
        "revoked": False              
    }

    # Final decision
    if not details["not_expired"]:
        return VerifyResponse(
            valid=False,
            reason="Token expired",
            details=details
        )

    if not details["issuer_trusted"]:
        return VerifyResponse(
            valid=False,
            reason="Untrusted issuer",
            details=details
        )

    return VerifyResponse(
        valid=True,
        reason="Valid credential",
        method="offchain",
        details=details
    )

@router.post("/revoke", response_model=RevokeResponse)
async def revoke_credential(req: RevokeRequest):
    return RevokeResponse(ok=True, reason=req.reason or "none")
