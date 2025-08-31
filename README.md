## ZKVerify — Privacy-Preserving Eligibility Proofs

Zero-knowledge MVP that lets users prove simple claims (e.g., age ≥ 18) without revealing raw data.
Stack: Next.js (frontend), Springboot Java (parser), Node (zk-prover), FastAPI + Postgres (Neon) (orchestrator), Solidity (Groth16 verifier on Sepolia).

1. Architechture Overview

┌───────────────┐ Upload/Parse ┌───────────────┐
│ Frontend │ ───────────────────────▶│ Parser (Java)│
│ Next.js │ └───────────────┘
│ │
│ Generate │ Background job ┌───────────────┐
│ Proof │ ───────────────────────▶ │ Orchestrator │──┐
│ Verify │ │ FastAPI │ │ on-chain
└──────┬────────┘ └──────┬────────┘ │ verify
│ │ │
│ Proof witness │ calls ▼
│ │ ┌──────────────┐
▼ │ │ Ethereum │
┌───────────────┐ proof + signals │ │ Sepolia │
│ ZK Prover │ ◀───────────────────────────────┘ │ Verifier.sol │
│ (Node + │ └──────────────┘
│ snarkjs) │
└───────────────┘

Data: Postgres (Neon) for proofs + verification logs

2. Repo Layout (Monorepo)

- apps/web-next — Next.js frontend
- apps/parser-java — Spring Boot document parser
- apps/prover-fastapi — FastAPI proof orchestrator
- apps/contracts — Hardhat / Solidity contracts
- apps/circuits — Circuits (circom + snarkjs)

3. Prerequisites

- Docker + Docker Compose
  -(Optional local dev) Node 22+, Python 3.11+, Java 17+
  -Neon Postgres connection string (already provided)
  -Sepolia RPC URL + deployer private key (if you redeploy)

4. Environment Variables
   Create a root .env with:

NEXT_PUBLIC_API_PARSER=http://localhost:8080
NEXT_PUBLIC_API_ORCHESTRATOR=http://localhost:8000
NEXT_PUBLIC_MOCK=false

DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...
TESSDATA_PATH=/usr/share/tesseract-ocr/4.00/tessdata

PARSER_API_URL=http://zkverify-parser:8080
FRONTEND_URL=http://localhost:3000
ZK_PROVER_URL=http://zkverify-zk-prover:3001

DATABASE_URL=postgresql://...

WEB3_RPC_URL=https://...
VERIFIER_CONTRACT_ADDRESS=0x...
VERIFIER_ABI_PATH=/app/verifier_abi.json

4.Building the Circuit and Verifier Contract
This step is crucial before deploying contracts:
Step 1: Generate circuit build artifacts

cd apps/zk-prover
chmod +x scripts/run_setup.sh
./scripts/run_setup.sh

Step 2: Export Solidity Verifier
npx snarkjs zkey export solidityverifier build/circuit_final.zkey ../hardhat-contract/contracts/Verifier.sol

5. Smart Contract (Sepolia)

cd apps/hardhat-contract
npm i
npx hardhat compile

# set SEPOLIA_RPC_URL + SEPOLIA_PRIVATE_KEY in env

npx hardhat run scripts/deploy.ts --network sepolia

Update .env
VERIFIER_CONTRACT_ADDRESS=<new-address>

6. Providing the Verifier ABI to the Orchestrator
   Run this command from repo root:

cat apps/hardhat-contract/artifacts/contracts/Verifier.sol/Groth16Verifier.json \
 | jq '.abi' \

> apps/hardhat-contract/artifacts/contracts/Verifier.sol/Groth16Verifier.abi.json

10. Run All services

docker compose build
docker compose up

11. Run frontend Next.js in local:

pnpm run dev
