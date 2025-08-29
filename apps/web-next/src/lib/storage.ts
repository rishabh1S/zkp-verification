import { openDB, type DBSchema, type IDBPDatabase } from "idb"

export interface StoredProof {
  id: string
  token_json: any
  proof_hash: string
  created_at: string
  name?: string
  tags?: string[]
}

interface ProofDB extends DBSchema {
  proofs: {
    key: string
    value: StoredProof
    indexes: {
      "by-created": string
      "by-hash": string
    }
  }
}

class ProofStorage {
  private db: Promise<IDBPDatabase<ProofDB>>

  constructor() {
    this.db = this.initDB()
  }

  private async initDB() {
    return openDB<ProofDB>("zkverify-proofs", 1, {
      upgrade(db) {
        const store = db.createObjectStore("proofs", { keyPath: "id" })
        store.createIndex("by-created", "created_at")
        store.createIndex("by-hash", "proof_hash")
      },
    })
  }

  async saveProof(proof: Omit<StoredProof, "id" | "created_at">): Promise<string> {
    const db = await this.db
    const id = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const storedProof: StoredProof = {
      ...proof,
      id,
      created_at: new Date().toISOString(),
    }

    await db.add("proofs", storedProof)
    return id
  }

  async getProof(id: string): Promise<StoredProof | undefined> {
    const db = await this.db
    return db.get("proofs", id)
  }

  async getAllProofs(): Promise<StoredProof[]> {
    const db = await this.db
    return db.getAllFromIndex("proofs", "by-created")
  }

  async updateProof(id: string, updates: Partial<StoredProof>): Promise<void> {
    const db = await this.db
    const existing = await db.get("proofs", id)
    if (existing) {
      await db.put("proofs", { ...existing, ...updates })
    }
  }

  async deleteProof(id: string): Promise<void> {
    const db = await this.db
    await db.delete("proofs", id)
  }

  async findByHash(hash: string): Promise<StoredProof | undefined> {
    const db = await this.db
    return db.getFromIndex("proofs", "by-hash", hash)
  }
}

export const proofStorage = new ProofStorage()
