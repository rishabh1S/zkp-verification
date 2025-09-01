const { groth16 } = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", (err) => reject(err));
  });
}

async function run() {
  try {
    const inputArg = process.argv[2];
    let inputs;

    if (!inputArg || inputArg === "-" || inputArg === "/dev/stdin") {
      const raw = await readStdin();
      if (!raw) throw new Error("No JSON received on stdin");
      inputs = JSON.parse(raw);
    } else {
      const raw = fs.readFileSync(inputArg, "utf8");
      inputs = JSON.parse(raw);
    }

    const buildPath = path.join(__dirname, "../build");
    const wasmPath = path.join(buildPath, "age_check_js", "age_check.wasm");
    const zkeyPath = path.join(buildPath, "circuit_final.zkey");

    const { proof, publicSignals } = await groth16.fullProve(
      inputs,
      wasmPath,
      zkeyPath
    );

    console.log(JSON.stringify({ proof, publicSignals }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error generating proof:", err);
    process.exit(1);
  }
}

run();
