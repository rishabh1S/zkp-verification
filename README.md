# ZKVerify — Privacy-Preserving Eligibility Proofs

Zero-knowledge MVP that lets users prove simple claims (e.g., age ≥ 18) without revealing raw data.
Stack: Next.js (frontend), Springboot Java (parser), Node (zk-prover), FastAPI + Postgres (Neon) (orchestrator), Solidity (Groth16 verifier on Sepolia).

## About the Project

Repo Layout - Monorepo

- apps/web-next — Next.js frontend
- apps/parser-java — Spring Boot document parser
- apps/prover-fastapi — FastAPI proof orchestrator
- apps/contracts — Hardhat / Solidity contracts
- apps/circuits — Circuits (circom + snarkjs)

Prerequisties

- Docker + Docker Compose
- (Optional local dev) Node 22+, Python 3.11+, Java 17+
- Neon Postgres connection string (already provided)
- Sepolia RPC URL + deployer private key (if you redeploy)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEXT_PUBLIC_API_PARSER`
`NEXT_PUBLIC_API_ORCHESTRATOR`
`NEXT_PUBLIC_MOCK`

`DB_URL`=jdbc:postgresql://...
`DB_USERNAME`=...
`DB_PASSWORD`=...
`TESSDATA_PATH`=/usr/share/tesseract-ocr/4.00/tessdata

`PARSER_API_URL`=http://zkverify-parser:8080
`FRONTEND_URL`=http://localhost:3000
`ZK_PROVER_URL`=http://zkverify-zk-prover:3001

`DATABASE_URL`=postgresql://...

`WEB3_RPC_URL`=https://...
`VERIFIER_CONTRACT_ADDRESS`=0x...
`VERIFIER_ABI_PATH`=/app/verifier_abi.json

## Run Locally

Clone the project

```bash
  git clone https://github.com/rishabh1S/zkp-verification.git
```

Start all the required services:

```bash
  docker-compose up --build
```

Start the frontend application

```bash
  cd apps/web-next/
  pnpm i
  pnpm run dev
```

# Documentation

You clone the repo, you are in root directory. You created.env files with the required Environment variables.
Then you should have docker desktop intalled, so after that you can run the docker-compose.yml file present in root directory.
Now let's divide each sub folders and explore one by one.

- Java parser written in springboot.

```bash
  cd apps/parser-java/
```

Here you can find few API related to parsing the uploaded document and extracting the content out of it using PDFbox/ Tesseract OCR for images.

- Python Orchestrator + Verifier in Fast API

```bash
  cd apps/orchestrator-python
```

Here, you'll find API's for Proof generation and then Verifying proof on-chain and of-chain.

- Circuits

```bash
  cd apps/zk-prover
```

Here we've written our circuit logic in
`apps/zk-prover/circuits/age_check.circom` file using circom syntax.

After this run the script file, it will create a build folder.

```bash
  chmod +x scripts/run_setup.sh
  ./scripts/run_setup.sh
```

Export Solidity Verifier file

```bash
npx snarkjs zkey export solidityverifier build/circuit_final.zkey ../hardhat-contract/contracts/Verifier.sol
```

- Solidity Contract

```bash
  cd apps/hardhat-contract
  npx hardhat compile
```

#### set SEPOLIA_RPC_URL + SEPOLIA_PRIVATE_KEY in env

```bash
  npx hardhat run scripts/deploy.ts --network sepolia
```

Update .env
VERIFIER_CONTRACT_ADDRESS=<new-address>

Providing the Verifier ABI to the Orchestrator
Run this command from repo-root.

```bash
  cat apps/hardhat-contract/artifacts/contracts/Verifier.sol/Groth16Verifier.json \
 | jq '.abi' \
> apps/hardhat-contract/artifacts/contracts/Verifier.sol/Groth16Verifier.abi.json
```

## Authors

- [@sidkocreator](https://github.com/sidkocreator)
- [@rishabh1S](https://github.com/rishabh1S)
