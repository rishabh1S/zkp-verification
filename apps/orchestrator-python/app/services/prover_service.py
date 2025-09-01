import os
import hashlib, json, logging
from datetime import datetime, timedelta, timezone
from app.models.entity.proof_entity import Proof
from app.db import engine
from sqlmodel import Session, select
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

# ---------------------------
# Persistence helpers
# ---------------------------
def create_job(job_id: str, payload: dict):
    """Insert a new job as queued."""
    proof = Proof(
        job_id=job_id,
        document_id=payload.get("document_id"),
        claim=payload.get("claim"),
        status="queued"
    )
    with Session(engine) as session:
        session.add(proof)
        session.commit()

def update_job(job_id: str, **kwargs):
    """Update fields on a job in DB."""
    with Session(engine) as session:
        proof = session.exec(select(Proof).where(Proof.job_id == job_id)).first()
        if not proof:
            return None
        for k, v in kwargs.items():
            setattr(proof, k, v)
        session.add(proof)
        session.commit()
        session.refresh(proof)
        return proof

# ---------------------------
# Main job
# ---------------------------
def run_proof_job(job_id: str, payload: dict):
    logger.info("Proof job %s started", job_id)
    update_job(job_id, status="running")

    try:
        # 1) Fetch doc
        parsed = fetch_parsed_document(payload["document_id"])
        if not parsed or "fields" not in parsed:
            raise RuntimeError("Parser returned no fields")

        dob_str = parsed["fields"].get("dobPreview")
        if not dob_str:
            raise RuntimeError("dobPreview missing")

        dob = datetime.strptime(dob_str, "%d/%m/%Y")
        input_json = {
            "birthYear": dob.year,
            "currentYear": datetime.now(timezone.utc).year,
            "minAge": 18
        }

        # 2) Generate proof
        zk_resp = call_zk_prover(input_json)
        proof_obj = {
            "proof": zk_resp.get("proof"),
            "publicSignals": zk_resp.get("publicSignals")
        }
    
        proof_hash = compute_hash(proof_obj)

        # 3) Update DB with success
        issued_on = datetime.now(timezone.utc)
        expires_on = issued_on + timedelta(days=payload.get("expires_in_days", 30))

        update_job(
            job_id,
            status="done",
            proof=proof_obj,
            proof_hash=proof_hash,
            issued_on=issued_on,
            expires_on=expires_on,
            error=None
        )
        logger.info("Proof job %s completed", job_id)

    except Exception as e:
        logger.error("Proof job %s failed: %s", job_id, e)
        update_job(job_id, status="failed", error=str(e))