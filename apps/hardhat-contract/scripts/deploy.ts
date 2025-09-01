import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  // 1. Show network info
  const value = await network.connect();
  console.log("📡 Network:", value.networkName);
  console.log("Chain ID:", value.networkConfig.chainId);

  // 2. Grab deployer
  const [deployer] = await ethers.getSigners();
  const deployerAddr = await deployer.getAddress();
  const balanceBefore = await ethers.provider.getBalance(deployerAddr);

  console.log("👤 Deployer:", deployerAddr);
  console.log(
    "💰 Balance before deploy:",
    ethers.formatEther(balanceBefore),
    "ETH"
  );

  // 3. Deploy contract
  console.log("🚀 Deploying Groth16Verifier...");
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const contract = await Verifier.deploy();
  await contract.waitForDeployment();

  const contractAddr = await contract.getAddress();
  console.log("✅ Verifier deployed at:", contractAddr);

  // 4. Gas + balance details
  const receipt = await contract.deploymentTransaction()?.wait();
  if (receipt) {
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
    console.log("Tx Hash:", receipt.hash);
  }
  const balanceAfter = await ethers.provider.getBalance(deployerAddr);
  console.log(
    "💸 Balance after deploy:",
    ethers.formatEther(balanceAfter),
    "ETH"
  );

  // 5. Explorer hint (Sepolia)
  if (value.networkName === "sepolia") {
    console.log(
      `🔍 Explorer URL: https://sepolia.etherscan.io/address/${contractAddr}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
