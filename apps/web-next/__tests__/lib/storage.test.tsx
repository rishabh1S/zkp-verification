import { proofStorage } from "@/lib/storage"

describe("Proof Storage", () => {
  beforeEach(async () => {
    // Clear storage before each test
    const proofs = await proofStorage.getAll()
    for (const proof of proofs) {
      await proofStorage.delete(proof.id)
    }
  })

  it("saves and retrieves proofs", async () => {
    const mockProof = {
      id: "test-1",
      token: "mock-token",
      claim: "age_over_18",
      status: "completed" as const,
      createdAt: new Date(),
      documentName: "test.pdf",
    }

    await proofStorage.save(mockProof)
    const retrieved = await proofStorage.get("test-1")

    expect(retrieved).toMatchObject({
      id: "test-1",
      token: "mock-token",
      claim: "age_over_18",
    })
  })

  it("lists all proofs", async () => {
    const proof1 = {
      id: "test-1",
      token: "token-1",
      claim: "age_over_18",
      status: "completed" as const,
      createdAt: new Date(),
      documentName: "test1.pdf",
    }

    const proof2 = {
      id: "test-2",
      token: "token-2",
      claim: "income_over_50k",
      status: "completed" as const,
      createdAt: new Date(),
      documentName: "test2.pdf",
    }

    await proofStorage.save(proof1)
    await proofStorage.save(proof2)

    const allProofs = await proofStorage.getAll()
    expect(allProofs).toHaveLength(2)
  })

  it("deletes proofs", async () => {
    const mockProof = {
      id: "test-delete",
      token: "mock-token",
      claim: "age_over_18",
      status: "completed" as const,
      createdAt: new Date(),
      documentName: "test.pdf",
    }

    await proofStorage.save(mockProof)
    await proofStorage.delete("test-delete")

    const retrieved = await proofStorage.get("test-delete")
    expect(retrieved).toBeNull()
  })
})
