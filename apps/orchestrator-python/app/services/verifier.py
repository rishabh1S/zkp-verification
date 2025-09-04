import os
import json
import logging
from typing import Any, Dict, Optional, Tuple, List

import requests
from web3 import Web3
from web3.exceptions import ContractLogicError

logger = logging.getLogger("verifier")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(handler)

ZK_PROVER_URL = os.getenv("ZK_PROVER_URL", "http://localhost:3001")
VERIFIER_PRIVATE_KEY = os.getenv("VERIFIER_PRIVATE_KEY")

def load_abi(abi_path: str) -> Any:
    with open(abi_path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def proof_to_abcs(proof: Dict[str, Any]) -> Tuple[List[int], List[List[int]], List[int]]:
    """
    Accepts a snarkjs-style proof object and returns (a,b,c) as lists of ints.

    Handles formats like:
      - proof.pi_a / pi_b / pi_c (with extra trailing elements from snarkjs)
      - proof.a / proof.b / proof.c
    """

    def to_int(x):
        if isinstance(x, str):
            if x.startswith("0x") or x.startswith("0X"):
                return int(x, 16)
            return int(x)  # decimal string
        if isinstance(x, int):
            return x
        raise ValueError(f"Unsupported proof integer format: {type(x)}: {x}")

    # Pick proof arrays
    if "pi_a" in proof and "pi_b" in proof and "pi_c" in proof:
        a_raw, b_raw, c_raw = proof["pi_a"], proof["pi_b"], proof["pi_c"]
    elif "a" in proof and "b" in proof and "c" in proof:
        a_raw, b_raw, c_raw = proof["a"], proof["b"], proof["c"]
    elif "proof" in proof and isinstance(proof["proof"], dict):
        return proof_to_abcs(proof["proof"])
    else:
        raise ValueError("Unknown proof format: missing pi_a/pi_b/pi_c or a/b/c")

    # --- Normalize formats ---
    # pi_a: first two values only
    a = [to_int(a_raw[0]), to_int(a_raw[1])]

    # pi_b: take first two rows only (ignore extra rows like ["1","0"])
    b = [
        [to_int(b_raw[0][1]), to_int(b_raw[0][0])],
        [to_int(b_raw[1][1]), to_int(b_raw[1][0])]
    ]

    # pi_c: first two values only
    c = [to_int(c_raw[0]), to_int(c_raw[1])]

    return a, b, c


def public_signals_to_ints(public_signals: List[Any]) -> List[int]:
    return [int(v) for v in public_signals]

def get_web3() -> Web3:
    rpc = os.getenv("WEB3_RPC_URL")
    if not rpc:
        raise RuntimeError("WEB3_RPC_URL env var not set")
    w3 = Web3(Web3.HTTPProvider(rpc))
    if not w3.is_connected():
        raise RuntimeError("Failed to connect to web3 provider")
    return w3


def get_contract():
    abi_path = os.getenv("VERIFIER_ABI_PATH")
    addr = os.getenv("VERIFIER_CONTRACT_ADDRESS")
    if not abi_path or not addr:
        raise RuntimeError("VERIFIER_ABI_PATH or VERIFIER_CONTRACT_ADDRESS not set")
    abi = load_abi(abi_path)
    w3 = get_web3()
    contract = w3.eth.contract(address=Web3.to_checksum_address(addr), abi=abi)
    return contract

# ---------------------------
# Offchain verification
# ---------------------------
def verify_proof(proof_obj: dict) -> bool:
    """
    Verify a Groth16 proof using the zk-prover HTTP service.
    Returns True if valid, False otherwise.
    """
    try:
        url = f"{ZK_PROVER_URL.rstrip('/')}/api/verify-proof"
        resp = requests.post(url, json=proof_obj, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("valid", False)
    except Exception as e:
        logger.error("Proof verification failed: %s", e)
        return False

# ---------------------------
# Onchain verification
# ---------------------------
# def verify_onchain(proof_obj: Dict[str, Any], public_signals: List[Any]) -> Tuple[bool, Optional[str]]:
#     """
#     Calls verifier contract.verifyProof(a,b,c,publicSignals) as an eth_call (no tx).
#     Returns True/False.
#     """
#     contract = get_contract()
#     a, b, c = proof_to_abcs(proof_obj)
#     public_inputs = public_signals_to_ints(public_signals or [])
#     logger.info("Calling on-chain verifier with public inputs: %s", public_inputs)
#     try:
#         # call the view method
#         valid = contract.functions.verifyProof(a, b, c, public_inputs).call()
#         return bool(valid), None
#     except ContractLogicError as e:
#         logger.error("Contract verification failed (logic error): %s", e)
#         return False, None
#     except Exception as e:
#         logger.exception("On-chain verify exception: %s", e)
#         raise

def verify_onchain(proof_obj: Dict[str, Any], public_signals: List[Any]) -> Tuple[bool, Optional[str]]:
    """
    Verify a proof on-chain.
    Sends a transaction, returns (valid, txHash).
    """
    contract = get_contract()
    a, b, c = proof_to_abcs(proof_obj)
    public_inputs = public_signals_to_ints(public_signals or [])
    logger.info("Calling on-chain verifier with inputs: %s", public_inputs)

    w3 = get_web3()

    try:
        acct = w3.eth.account.from_key(VERIFIER_PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(acct.address)

        tx = contract.functions.verifyProof(a, b, c, public_inputs).build_transaction({
            "from": acct.address,
            "nonce": nonce,
            "gas": contract.functions.verifyProof(a, b, c, public_inputs).estimate_gas({"from": acct.address}),
            "gasPrice": w3.eth.gas_price,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key=acct.key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        # receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        # valid = bool(receipt["status"] == 1)
        return True, w3.to_hex(tx_hash)
    except ContractLogicError as e:
        logger.error("Contract verification failed (logic error): %s", e)
        return False, None
    except Exception as e:
        logger.exception("On-chain verify exception: %s", e)
        raise