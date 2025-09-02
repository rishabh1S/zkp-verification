import os
import hashlib, json, logging
from datetime import datetime, timedelta, timezone
import uuid
from app.models.entity.proof_entity import Proof
from app.models.proof_models import ClaimModel, ProofResponse, ProofToken
from app.db import engine
from sqlmodel import Session
import requests
from requests.exceptions import RequestException, Timeout

logger = logging.getLogger("prover")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(handler)

PARSER_API_URL = os.getenv("PARSER_API_URL", "http://localhost:8080")
ZK_PROVER_URL = os.getenv("ZK_PROVER_URL", "http://localhost:3001")

# ---------------------------
# Helpers
# ---------------------------
def fetch_parsed_document(document_id: str):
    """Fetch parsed document JSON from parser service."""
    url = f"{PARSER_API_URL.rstrip('/')}/api/documents/{document_id}"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except RequestException as e:
        logger.error("Failed to fetch doc %s: %s", document_id, e)
        return None

def compute_hash(obj: dict) -> str:
    """Compute SHA256 over canonical JSON of the proof object."""
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()
    return "sha256:" + hashlib.sha256(raw).hexdigest()

def call_zk_prover(inputs: dict) -> dict:
    """
    POST witness to zk-prover HTTP service and return the JSON { proof, publicSignals }
    """
    url = f"{ZK_PROVER_URL.rstrip('/')}/api/generate-proof"
    logger.info("Calling zk-prover at %s", url)
    try:
        resp = requests.post(url, json=inputs, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Timeout:
        raise RuntimeError("Timeout zk-prover")
    except RequestException as e:
        raise RuntimeError(f"zk-prover error: {e}")

def generate_proof(document_id: str, claim: ClaimModel, expires_in_days: int = 30) -> ProofResponse:
    parsed = fetch_parsed_document(document_id)
    if not parsed or "fields" not in parsed:
        raise RuntimeError("Parser returned no fields")

    dob_str = parsed["fields"].get("dobPreview")
    if not dob_str:
        raise RuntimeError("dobPreview missing")

    dob = datetime.strptime(dob_str, "%d/%m/%Y")
    input_json = {
        "birthYear": dob.year,
        "currentYear": datetime.now(timezone.utc).year,
        "minAge": claim.threshold
    }

    zk_resp = call_zk_prover(input_json)

    issued_on = datetime.now(timezone.utc)
    expires_on = issued_on + timedelta(days=expires_in_days)
    proof_id = str(uuid.uuid4())

    final_proof = ProofToken(
        id=proof_id, 
        claim=claim,
        proof=zk_resp.get("proof", {}),
        inputs=zk_resp.get("publicSignals", []),
        verifier_contract=os.getenv("VERIFIER_CONTRACT_ADDRESS", "0xContractAddressOnBlockchain"),
        issuer="ZKVerify-MVP",
        issued_on=issued_on.strftime("%Y-%m-%d"),
        expires_on=expires_on.strftime("%Y-%m-%d"),
    )

    # Store proof_hash for revocation only
    proof_hash = compute_hash(final_proof.model_dump(mode="json"))
    with Session(engine) as session:
        db_proof = Proof(
            document_id=document_id,
            claim=claim.model_dump(),
            proof_hash=proof_hash,
            issued_on=issued_on,
            expires_on=expires_on
        )
        session.add(db_proof)
        session.commit()
        session.refresh(db_proof)

    return ProofResponse(
        proof_id=proof_id,
        token=final_proof
    )