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

export interface ClaimModel {
  claimType: string;
  threshold: number;
}

export interface ProofResponse {
  proof_id: string;
  token: ProofToken;
}

export interface ProofToken {
  claim: ClaimModel;
  proof: any;
  inputs: string[];
  verifier_contract: string;
  issuer: string;
  issued_on: string;
  expires_on: string;
}

export interface VerifyResponse {
  valid: boolean;
  reason?: string;
  method: "onchain" | "offchain";
  txHash?: string;
  details?: any;
}

export interface RevokeResponse {
  ok: boolean;
  reason?: string;
}

class ApiClient {
  private readonly baseUrlParser: string;
  private readonly baseUrlOrchestrator: string;

  constructor() {
    this.baseUrlParser =
      process.env.NEXT_PUBLIC_API_PARSER || "http://localhost:8080";
    this.baseUrlOrchestrator =
      process.env.NEXT_PUBLIC_API_ORCHESTRATOR || "http://localhost:8000";
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
    claim: ClaimModel;
    wallet_address?: string;
    expires_in_days?: number;
  }): Promise<ApiResponse<ProofResponse>> {
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
          body: JSON.stringify(payload),
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
  }): Promise<ApiResponse<RevokeResponse>> {
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
