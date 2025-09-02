export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface DocumentUploadResponse {
  documentId: string;
  fields: {
    dobPreview?: string;
    dobHash?: string;
    [key: string]: any;
  };
  confidence: number;
}

export interface ProofGenerateResponse {
  job_id: string;
}

export interface ProofToken {
  id: string;
  document_id: string;
  claim: any;
  proof_hash: string;
  issuer: string;
  issued_on: string;
  expires_on: string;
  issuer_signature: string;
}

export interface ProofStatusResponse {
  status: "queued" | "running" | "done" | "failed" | "not_found";
  token?: ProofToken;
  error?: string;
}

export interface VerifyResponse {
  valid: boolean;
  reason?: string;
  method: "onchain" | "offchain";
  txHash?: string;
  details?: any;
}

class ApiClient {
  private baseUrlParser: string;
  private baseUrlOrchestrator: string;
  private mockMode: boolean;

  constructor() {
    this.baseUrlParser =
      process.env.NEXT_PUBLIC_API_PARSER || "http://localhost:8080";
    this.baseUrlOrchestrator =
      process.env.NEXT_PUBLIC_API_ORCHESTRATOR || "http://localhost:8000";
    this.mockMode = process.env.NEXT_PUBLIC_MOCK === "true";
  }

  private async mockDelay(ms = 1000) {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  async uploadDocument(
    file: File
  ): Promise<ApiResponse<DocumentUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${this.baseUrlParser}/api/documents/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("Error uploading document:", error);
      return { status: 500, error: "Upload failed" };
    }
  }

  async generateProof(payload: {
    document_id: string;
    claim: any;
    wallet_address?: string;
    expires_in_days?: number;
  }): Promise<ApiResponse<ProofGenerateResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrlOrchestrator}/api/proofs/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("Error generating proof:", error);
      return { status: 500, error: "Proof generation failed" };
    }
  }

  async getProofStatus(
    jobId: string
  ): Promise<ApiResponse<ProofStatusResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrlOrchestrator}/api/proofs/status/${jobId}`
      );
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("Error fetching proof status:", error);
      return { status: 500, error: "Status check failed" };
    }
  }

  async verifyCredential(payload: {
    token: ProofToken;
    method?: "onchain" | "offchain";
  }): Promise<ApiResponse<VerifyResponse>> {
    try {
      const response = await fetch(
        `${this.baseUrlOrchestrator}/api/credentials/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: payload.token,
            method: payload.method,
          }),
        }
      );

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("Error verifying credential:", error);
      return { status: 500, error: "Verification failed" };
    }
  }

  async revokeCredential(payload: {
    proof_hash: string;
    reason: string;
  }): Promise<ApiResponse<{ ok: boolean }>> {
    try {
      const response = await fetch(
        `${this.baseUrlOrchestrator}/api/credentials/revoke`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      console.error("Error revoking credential:", error);
      return { status: 500, error: "Revocation failed" };
    }
  }
}

export const apiClient = new ApiClient();
