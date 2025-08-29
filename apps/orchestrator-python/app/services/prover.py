import os
import time
import json
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional

import requests
from requests.exceptions import RequestException, Timeout

from app.store.job_store import jobs


logger = logging.getLogger("prover")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(handler)

PARSER_API_URL = os.getenv("PARSER_API_URL", "http://localhost:8080")
ZK_PROVER_URL = os.getenv("ZK_PROVER_URL", "http://localhost:3001")
PROOF_SIMULATE_SECONDS = 5  # seconds to simulate proof generation


def fetch_parsed_document(document_id: str) -> Optional[Dict[str, Any]]:
    """Fetch parsed document JSON from parser service."""
    url = f"{PARSER_API_URL.rstrip('/')}/api/documents/{document_id}"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except RequestException as e:
        logger.error("Failed to fetch document %s: %s", document_id, e)
        return None


def compute_hash(obj: Dict[str, Any]) -> str:
    """Compute SHA256 over canonical JSON of the proof object."""
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()
    return "sha256:" + hashlib.sha256(raw).hexdigest()

def call_zk_prover(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    POST witness to zk-prover HTTP service and return the JSON { proof, publicSignals }
    """
    url = f"{ZK_PROVER_URL.rstrip('/')}/api/generate-proof"
    logger.info("Calling zk-prover at %s", url)
    try:
        resp = requests.post(url, json=inputs, timeout=120)
        resp.raise_for_status()
        return resp.json()
    except Timeout:
        raise RuntimeError("Timeout while calling zk-prover")
    except RequestException as e:
        raise RuntimeError(f"Failed calling zk-prover: {e}, content={getattr(e.response, 'content', None)}")

def save_proof_json(job_id: str, proof_obj: Dict[str, Any]) -> str:
    """
    Save the proof JSON to local disk under /app/proofs (mounted volume) and return absolute file path.
    """
    out_dir = os.getenv("PROOFS_DIR", "/app/proofs")
    os.makedirs(out_dir, exist_ok=True)
    fn = f"{job_id}_proof.json"
    path = os.path.join(out_dir, fn)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(proof_obj, f, indent=2)
    return os.path.abspath(path)

# --- Main proof job ---
def run_proof_job(job_id: str, payload: dict):
    jobs[job_id]["status"] = "running"
    logger.info("Started proof job %s", job_id)

    try:
        document_id = payload.get("document_id")
        if not document_id:
            raise ValueError("Missing document_id in payload")

        # 1) Fetch parsed document
        parsed = fetch_parsed_document(document_id)
        if not parsed or "fields" not in parsed:
            raise RuntimeError(f"Parser returned no fields for document {document_id}")

        fields = parsed["fields"]
        dob_str = fields.get("dobPreview")
        if not dob_str:
            raise RuntimeError("dobPreview not found in parser fields")

        # 2) Build witness (birth year vs current year)
        try:
            # parse DD/MM/YYYY format
            dob = datetime.strptime(dob_str, "%d/%m/%Y")
            birth_year = dob.year
        except ValueError:
            raise RuntimeError(f"Invalid dobPreview format: {dob_str}")
        current_year = datetime.now(timezone.utc).year
        input_json = {
            "birthYear": birth_year,
            "currentYear": current_year,
            "minAge": 18 
        }

        logger.info("Built witness: %s", input_json)

        # 3) Call zk-prover service (replaces previous simulation)
        zk_response = call_zk_prover(input_json)
        # zk_response expected: { proof: {...}, publicSignals: [...] }
        logger.info("Received response from zk-prover")

        # 4) Save proof JSON for record
        proof_obj = {
            "proof": zk_response.get("proof"),
            "publicSignals": zk_response.get("publicSignals"),
            "inputs": input_json,
            "meta": {
                "generated_by": "zk-prover",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        }
        proof_file_path = save_proof_json(job_id, proof_obj)
        proof_uri = f"file://{proof_file_path}"

        # 5) Compute proof hash
        proof_hash = compute_hash(proof_obj)

        # 6) Create token
        issued_on = datetime.now(timezone.utc).isoformat()
        expires_on = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
        token = {
            "id": f"token_{job_id}",
            "document_id": document_id,
            "claim": payload.get("claim"),
            "proof_uri": proof_uri,
            "proof_hash": proof_hash,
            "issuer": "ZKVerify-MVP",
            "issued_on": issued_on,
            "expires_on": expires_on,
            "issuer_signature": "0xFAKE_SIG",
        }

        # 7) Save job result
        jobs[job_id] = {"status": "done", "token": token, "proof_uri": proof_uri}
        logger.info("Proof job %s completed", job_id)

    except Exception as e:
        logger.error("Proof job %s failed: %s", job_id, e)
        jobs[job_id] = {"status": "failed", "error": str(e)}
