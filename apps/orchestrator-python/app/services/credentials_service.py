import logging
from datetime import datetime, timezone
from sqlmodel import Session, select

from app.models.entity.proof_entity import Proof
from app.models.entity.verification_entity import Verification
from app.models.verify_models import VerifyRequest, VerifyResponse, RevokeRequest, RevokeResponse
from app.services.verifier import verify_onchain, verify_proof
from app.services.prover_service import compute_hash

logger = logging.getLogger("credentials_service")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(handler)

def verify_credential_service(req: VerifyRequest, session: Session) -> VerifyResponse:
    token = req.token
    method = req.method
    now = datetime.now(timezone.utc)

    # --- 1. Recompute proof_hash to check tampering ---
    proof_hash = compute_hash(token.claim.model_dump(), token.proof, token.inputs)
    proof_rec = session.exec(select(Proof).where(Proof.proof_hash == proof_hash)).first()

    if not proof_rec:
        # No matching proof in DB → tampered or unknown proof
        return VerifyResponse(
            valid=False,
            reason="Proof not found or tampered",
            method=method,
            details={"error": "Invalid or tampered proof"}
        )

    # --- 2. Use DB values (issuer, expiry, status) ---
    issuer_trusted = (proof_rec.issuer == "ZKVerify-MVP")
    not_expired = (proof_rec.expires_on.replace(tzinfo=timezone.utc) > now) if proof_rec.expires_on else True

    details = {
        "issuer_trusted": issuer_trusted,
        "not_expired": not_expired,
        "signature_valid": True,   # TODO: implement real sig check
        "claim_verified": None,
    }

    if not not_expired:
        return VerifyResponse(valid=False, reason="Token expired", method=method, details=details)

    if not issuer_trusted:
        return VerifyResponse(valid=False, reason="Untrusted issuer", method=method, details=details)

    if proof_rec.status == "revoked":
        details["revoked_reason"] = proof_rec.reason
        return VerifyResponse(valid=False, reason="Proof revoked", method=method, details=details)

    # --- 3. Verification (off-chain or on-chain) ---
    try:
        if method == "offchain":
            valid = verify_proof({"proof": token.proof, "publicSignals": token.inputs})
            tx_hash = None
            details["claim_verified"] = bool(valid)
            reason = "Valid credential (offchain)" if valid else "Off-chain verification failed"
        else:
            valid, tx_hash  = verify_onchain(token.proof, token.inputs)
            logger.info("Tx generated: %s", tx_hash)
            details["claim_verified"] = bool(valid)
            reason = "Valid credential (onchain)" if valid else "On-chain verification failed"
        
        # Save audit log
        _save_verification(session, proof_rec, proof_hash, method, valid, details, tx_hash)
        
        return VerifyResponse(valid=valid, reason=reason, method=method, details=details, txHash=tx_hash)
        
    except Exception as e:
        logger.exception("Verification error: %s", e)
        details["error"] = str(e)
        _save_verification(session, proof_rec, proof_hash, method, False, details, tx_hash)
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


def _save_verification(
    session: Session,
    proof_rec: Proof,
    proof_hash: str,
    method: str,
    valid: bool,
    details: dict,
    tx_hash: str | None,
):
    """Persist verification attempt in Verification audit table."""
    ver = Verification(
        proof_id=proof_rec.proof_id if proof_rec else None,
        proof_hash=proof_hash,
        method=method,
        valid=valid,
        details=details,
        tx_hash=tx_hash,
        created_at=datetime.now(timezone.utc),
    )
    session.add(ver)
    session.commit()
