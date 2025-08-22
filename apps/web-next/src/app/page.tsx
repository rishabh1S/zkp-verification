import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          ZKP Age Verification — Frontend
        </h1>
        <p className="mb-2 text-gray-700">
          Upload ID image in Parser service, then request proof generation.
        </p>
        <p className="text-gray-600">
          Open{" "}
          <code className="bg-gray-100 px-1 rounded text-sm">
            apps/parser-java
          </code>{" "}
          and{" "}
          <code className="bg-gray-100 px-1 rounded text-sm">
            apps/prover-fastapi
          </code>{" "}
          in separate terminals to run services.
        </p>
      </div>
    </main>
  );
}
