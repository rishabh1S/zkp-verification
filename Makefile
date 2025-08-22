.PHONY: start:web start:parser start:prover start:contracts start:all

start:web:
	cd apps/web-next && npm install && npm run dev

start:parser:
	cd apps/parser-java && mvn -q -DskipTests spring-boot:run

start:prover:
	cd apps/prover-fastapi && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

start:contracts:
	cd apps/contracts && npm install && npx hardhat node

start:all:
	# Run each server in separate terminals or use tmux
	@echo "Use separate terminals to run start:web, start:parser, start:prover, start:contracts"
