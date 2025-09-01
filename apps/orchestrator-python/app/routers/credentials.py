
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db import get_session
from app.models.verify_models import VerifyRequest, VerifyResponse, RevokeRequest, RevokeResponse
from app.services.credentials_service import verify_credential_service, revoke_credential_service

router = APIRouter(prefix="/api/credentials", tags=["credentials"])

@router.post("/verify", response_model=VerifyResponse)
def verify_credential(req: VerifyRequest, session: Session = Depends(get_session)):
    return verify_credential_service(req, session)


@router.post("/revoke", response_model=RevokeResponse)
def revoke_credential(req: RevokeRequest, session: Session = Depends(get_session)):
    return revoke_credential_service(req, session)
