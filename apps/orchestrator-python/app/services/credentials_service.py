from datetime import datetime, timezone
from sqlmodel import Session, select

from app.models.entity.proof_entity import Proof
from app.models.entity.verification_entity import Verification
from app.models.verify_models import VerifyRequest, VerifyResponse, RevokeRequest, RevokeResponse
from app.services.verifier import verify_onchain


def verify_credential_service(req: VerifyRequest, session: Session) -> VerifyResponse:
    token = req.token

    # 1. Lookup proof by proof_hash or job_id
    proof_rec = session.exec(select(Proof).where(Proof.proof_hash == token.proof_hash)).first()
    if not proof_rec:
        proof_rec = session.exec(
            select(Proof).where(Proof.job_id == token.id.replace("token_", ""))
        ).first()

    if not proof_rec:
        ver = Verification(
            proof_job_id=None,
            proof_hash=token.proof_hash,
            method="onchain",
            valid=False,
            details={"reason": "proof_not_found"},
        )
        session.add(ver)
        session.commit()
        return VerifyResponse(valid=False, reason="Proof not found", method="onchain", details=ver.details)

    # 2. Basic token checks
    now = datetime.now(timezone.utc)
    details = {
        "claim_verified": None,
        "issuer_trusted": (token.issuer == proof_rec.issuer),
        "not_expired": (token.expires_on.replace(tzinfo=timezone.utc) > now) if token.expires_on else True,
        "signature_valid": True,  # TODO: implement proper sig check
    }

    if not details["not_expired"]:
        return _save_and_response(session, proof_rec, False, "Token expired", details)

    if not details["issuer_trusted"]:
        return _save_and_response(session, proof_rec, False, "Untrusted issuer", details)

    # 3. On-chain verification
    try:
        proof_blob = proof_rec.proof.get("proof") if isinstance(proof_rec.proof, dict) else None
        public_signals = proof_rec.proof.get("publicSignals", []) if isinstance(proof_rec.proof, dict) else []
        if not proof_blob:
            raise Exception("Stored proof blob missing")

        onchain_valid = False
        try:
            onchain_valid = verify_onchain(proof_blob, public_signals)
        except Exception as e:
            details["onchain_error"] = str(e)

        details["claim_verified"] = bool(onchain_valid)
        if onchain_valid:
            return _save_and_response(session, proof_rec, True, "Valid credential (onchain)", details)
        else:
            return _save_and_response(session, proof_rec, False, "On-chain verification failed", details)

    except Exception as e:
        details["error"] = str(e)
        return _save_and_response(session, proof_rec, False, "Verification failed", details)


def revoke_credential_service(req: RevokeRequest, session: Session) -> RevokeResponse:
    proof = session.exec(select(Proof).where(Proof.proof_hash == req.proof_hash)).first()
    if proof:
        proof.status = "revoked"
        session.add(proof)
        session.commit()
        return RevokeResponse(ok=True, reason=req.reason)
    return RevokeResponse(ok=False, reason="proof_not_found")


def _save_and_response(session: Session, proof: Proof, valid: bool, reason: str, details: dict) -> VerifyResponse:
    ver = Verification(
        proof_job_id=proof.job_id,
        proof_hash=proof.proof_hash,
        method="onchain",
        valid=valid,
        details=details,
    )
    session.add(ver)
    session.commit()
    return VerifyResponse(valid=valid, reason=reason, method="onchain", details=details)
