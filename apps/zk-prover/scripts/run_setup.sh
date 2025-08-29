#!/bin/bash
set -e

# Directory setup
CIRCUIT_NAME=age_check
BUILD_DIR=build
mkdir -p $BUILD_DIR

echo "--- 1. Compiling Circuit ---"
# Compile the circuit to get R1CS, WASM, and SYM files
circom circuits/${CIRCUIT_NAME}.circom --r1cs --wasm --sym -o $BUILD_DIR -l /app/node_modules/circomlib

echo "--- 2. Phase 1 Trusted Setup (Powers of Tau) ---"
# Start a new "powers of tau" ceremony
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Contribute to the ceremony (non-interactive)
echo "docker build entropy" | snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau -v

# Prepare for phase 2
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

echo "--- 3. Phase 2 Circuit-Specific Setup ---"
# Use the **phase 2 prepared ptau** for Groth16 setup
snarkjs groth16 setup ${BUILD_DIR}/${CIRCUIT_NAME}.r1cs pot12_final.ptau ${BUILD_DIR}/circuit_0000.zkey

# Contribute to the zkey (non-interactive)
echo "docker build entropy" | snarkjs zkey contribute ${BUILD_DIR}/circuit_0000.zkey ${BUILD_DIR}/circuit_final.zkey -v

echo "--- 4. Exporting Verification Key ---"
# Export the verification key to a JSON file
snarkjs zkey export verificationkey ${BUILD_DIR}/circuit_final.zkey ${BUILD_DIR}/verification_key.json

echo "--- Setup Complete! ✅ ---"
