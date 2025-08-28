// scripts/test-verification.cjs
const { ethers } = require('ethers');

async function testVerification() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const verifierAddress = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab';
  
  // Get the contract ABI
  const artifact = require('../artifacts/contracts/Verifier.sol/Groth16Verifier.json');
  const verifier = new ethers.Contract(verifierAddress, artifact.abi, provider);
  
  console.log("Verifier contract loaded at:", verifierAddress);
  
  // You can test verification once you have proofs from Python
}

testVerification();