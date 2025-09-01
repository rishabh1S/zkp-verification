const express = require("express");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const vkey = require("./build/verification_key.json");
const { groth16 } = require("snarkjs");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

app.post("/api/generate-proof", async (req, res) => {
  try {
    const inputJson = req.body;
    if (!inputJson) return res.status(400).json({ error: "missing input" });

    const child = spawn("node", ["scripts/generate_proof.js", "-"], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: __dirname,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });

    // write input and close stdin in one call
    child.stdin.end(JSON.stringify(inputJson));

    // Timeout safety (kill if takes too long)
    const TIMEOUT_MS = 120000; // 2 minutes
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
    }, TIMEOUT_MS);

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error("generate_proof failed:", code, stderr);
        return res.status(500).json({ error: "prove-failed", details: stderr });
      }
      try {
        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (e) {
        console.error("invalid JSON from prover:", e, stdout, stderr);
        return res.status(500).json({
          error: "invalid-prover-output",
          details: stderr || e.message,
        });
      }
    });
  } catch (err) {
    console.error("unexpected:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/verify-proof", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    if (!proof || !publicSignals) {
      return res.status(400).json({ error: "missing proof or publicSignals" });
    }

    const valid = await groth16.verify(vkey, publicSignals, proof);
    return res.json({ valid });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`zk-prover HTTP server listening on ${PORT}`);
});
