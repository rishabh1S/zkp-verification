export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export interface DocumentUploadResponse {
  document_id: string
  extracted_fields: {
    name?: string
    birthYear?: number
    income?: number
    [key: string]: any
  }
  confidence: {
    [key: string]: number
  }
}

export interface ProofGenerateResponse {
  job_id: string
}

export interface ProofStatusResponse {
  status: "queued" | "running" | "done" | "failed"
  token?: any
  proof_uri?: string
  error?: string
}

export interface VerifyResponse {
  valid: boolean
  reason?: string
  method: "onchain" | "offchain"
  txHash?: string
  details?: any
}

class ApiClient {
  private baseUrlParser: string
  private baseUrlOrchestrator: string
  private mockMode: boolean

  constructor() {
    this.baseUrlParser = process.env.NEXT_PUBLIC_API_PARSER || "http://localhost:8081"
    this.baseUrlOrchestrator = process.env.NEXT_PUBLIC_API_ORCHESTRATOR || "http://localhost:8000"
    this.mockMode = process.env.NEXT_PUBLIC_MOCK === "true"
  }

  private async mockDelay(ms = 1000) {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, ms))
    }
  }

  async uploadDocument(file: File): Promise<ApiResponse<DocumentUploadResponse>> {
    if (this.mockMode) {
      await this.mockDelay(2000)
      return {
        status: 200,
        data: {
          document_id: `doc_${Date.now()}`,
          extracted_fields: {
            name: "Amit T",
            birthYear: 1989,
            income: 1200000,
            taxPaid: 150000,
          },
          confidence: {
            birthYear: 0.98,
            income: 0.95,
            taxPaid: 0.92,
          },
        },
      }
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${this.baseUrlParser}/api/v1/documents/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      return { status: 500, error: "Upload failed" }
    }
  }

  async generateProof(payload: {
    document_id: string
    claim: any
    wallet_address?: string
    expires_in_days?: number
  }): Promise<ApiResponse<ProofGenerateResponse>> {
    if (this.mockMode) {
      await this.mockDelay(1000)
      return {
        status: 202,
        data: {
          job_id: `job_${Date.now()}`,
        },
      }
    }

    try {
      const response = await fetch(`${this.baseUrlOrchestrator}/api/v1/proofs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      return { status: 500, error: "Proof generation failed" }
    }
  }

  async getProofStatus(jobId: string): Promise<ApiResponse<ProofStatusResponse>> {
    if (this.mockMode) {
      await this.mockDelay(500)
      // Simulate different states based on time
      const elapsed = Date.now() - Number.parseInt(jobId.split("_")[1])
      if (elapsed < 3000) {
        return { status: 200, data: { status: "running" } }
      }
      return {
        status: 200,
        data: {
          status: "done",
          token: {
            id: `token_${jobId}`,
            claim: { type: "age", threshold: 18, value: true },
            issuer: "ZKVerify",
            issued_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          proof_uri: `zkverify://proof/${jobId}`,
        },
      }
    }

    try {
      const response = await fetch(`${this.baseUrlOrchestrator}/api/v1/proofs/status/${jobId}`)
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      return { status: 500, error: "Status check failed" }
    }
  }

  async verifyCredential(payload: { token?: any; proof_uri?: string }): Promise<ApiResponse<VerifyResponse>> {
    if (this.mockMode) {
      await this.mockDelay(1500)
      return {
        status: 200,
        data: {
          valid: true,
          method: "offchain",
          details: {
            claim_verified: true,
            issuer_trusted: true,
            not_expired: true,
          },
        },
      }
    }

    try {
      const response = await fetch(`${this.baseUrlOrchestrator}/api/v1/credentials/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      return { status: 500, error: "Verification failed" }
    }
  }

  async revokeCredential(payload: { proof_hash: string; reason: string }): Promise<ApiResponse<{ ok: boolean }>> {
    if (this.mockMode) {
      await this.mockDelay(1000)
      return { status: 200, data: { ok: true } }
    }

    try {
      const response = await fetch(`${this.baseUrlOrchestrator}/api/v1/credentials/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      return { status: 500, error: "Revocation failed" }
    }
  }
}

export const apiClient = new ApiClient()
