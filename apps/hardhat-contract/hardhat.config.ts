import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();
/**
 * ESM Hardhat config.
 * We include multiple compiler versions to match pragma ranges like ">=0.7.0 <0.9.0".
 */

const { SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY } = process.env;
export default {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.7.6",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },
  plugins: [hardhatEthers],
  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [`0x${SEPOLIA_PRIVATE_KEY}`],
    },
  },
  paths: {
    // default is fine, but made explicit for clarity
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
  },
};
