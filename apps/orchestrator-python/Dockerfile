FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    build-essential curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy requirement files
COPY apps/orchestrator-python/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY apps/orchestrator-python/ .

# Copy the Verifier ABI into the container
COPY apps/hardhat-contract/artifacts/contracts/Verifier.sol/Groth16Verifier.abi.json ./verifier_abi.json

# Set environment variables
ENV PORT=8000
EXPOSE 8000

# Run using run.py
CMD ["python", "run.py"]
