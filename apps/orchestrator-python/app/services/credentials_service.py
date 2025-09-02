from datetime import datetime, timezone
from sqlmodel import Session, select
from app.models.entity.proof_entity import Proof
from app.models.entity.verification_entity import Verification
from app.models.verify_models import VerifyRequest, VerifyResponse, RevokeRequest, RevokeResponse
from app.services.verifier import verify_onchain, verify_proof
import hashlib, json

def compute_hash(obj: dict) -> str:
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()
    return "sha256:" + hashlib.sha256(raw).hexdigest()

def verify_credential_service(req: VerifyRequest, session: Session) -> VerifyResponse:
    token = req.token
    method = req.method

    # --- 1. Basic checks ---
    now = datetime.now(timezone.utc)
    not_expired = token.expires_on.replace(tzinfo=timezone.utc) > now
    issuer_trusted = (token.issuer == "ZKVerify-MVP")

    details = {
        "issuer_trusted": issuer_trusted,
        "not_expired": not_expired,
        "signature_valid": True,
        "claim_verified": None,
    }

    if not not_expired:
        return VerifyResponse(valid=False, reason="Token expired", method=method, details=details)

    if not issuer_trusted:
        return VerifyResponse(valid=False, reason="Untrusted issuer", method=method, details=details)

    # --- 2. Check revocation (DB only stores proof_hash + metadata) ---
    proof_hash = compute_hash(token.model_dump(mode="json"))
    proof_rec = session.exec(select(Proof).where(Proof.proof_hash == proof_hash)).first()
    if proof_rec and proof_rec.status == "revoked":
        details["revoked_reason"] = proof_rec.reason
        return VerifyResponse(valid=False, reason="Proof revoked", method=method, details=details)

    # --- 3. Verification (off-chain or on-chain) ---
    try:
        if method == "offchain":
            valid = verify_proof({"proof": token.proof, "publicSignals": token.inputs})
            details["claim_verified"] = bool(valid)
            reason = "Valid credential (offchain)" if valid else "Off-chain verification failed"
        else:
            valid = verify_onchain(token.proof, token.inputs)
            details["claim_verified"] = bool(valid)
            reason = "Valid credential (onchain)" if valid else "On-chain verification failed"
        
        # Save audit log
        _save_verification(session, proof_hash, method, valid, details)
        
        return VerifyResponse(valid=valid, reason=reason, method=method, details=details)
        
    except Exception as e:
        details["error"] = str(e)
        _save_verification(session, proof_hash, method, False, details)
        return VerifyResponse(valid=False, reason="Verification error", method=method, details=details)


def revoke_credential_service(req: RevokeRequest, session: Session) -> RevokeResponse:
    proof = session.exec(select(Proof).where(Proof.proof_hash == req.proof_hash)).first()
    if proof:
        proof.status = "revoked"
        proof.revoked_on = datetime.now(timezone.utc)
        proof.reason = req.reason
        session.add(proof)
        session.commit()
        return RevokeResponse(ok=True, reason=req.reason)
    return RevokeResponse(ok=False, reason="proof_not_found")


def _save_verification(session: Session, proof_hash: str, method: str, valid: bool, details: dict):
    """Persist verification attempt in Verification audit table."""
    ver = Verification(
        proof_hash=proof_hash,
        method=method,
        valid=valid,
        details=details,
        created_at=datetime.now(timezone.utc),
    )
    session.add(ver)
    session.commit()
