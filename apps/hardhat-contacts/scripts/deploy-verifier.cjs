const { ethers } = require('ethers');

async function main() {
  console.log("🚀 Deploying Verifier contract to Ganache...");
  
  // Connect to Ganache
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  
  // Use the first account from Ganache's deterministic accounts
  const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'; // Ganache's first account
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Deploying with account:", wallet.address);
  
  // Read the Verifier contract ABI and bytecode
  const verifierArtifact = require('../artifacts/contracts/Verifier.sol/Groth16Verifier.json');
  const factory = new ethers.ContractFactory(verifierArtifact.abi, verifierArtifact.bytecode, wallet);
  
  // Deploy the contract
  const verifier = await factory.deploy();
  await verifier.waitForDeployment();
  
  const address = await verifier.getAddress();
  console.log("✅ Verifier deployed to:", address);
  
  return address;
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});