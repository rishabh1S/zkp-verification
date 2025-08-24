export const sampleDocuments = {
  passport: {
    document_id: "doc_passport_001",
    extracted_fields: {
      name: "Amit Kumar",
      birthYear: 1989,
      nationality: "Indian",
      passportNumber: "A1234567",
    },
    confidence: {
      name: 0.99,
      birthYear: 0.98,
      nationality: 0.99,
      passportNumber: 0.97,
    },
  },

  salarySlip: {
    document_id: "doc_salary_001",
    extracted_fields: {
      name: "Priya Sharma",
      monthlyIncome: 85000,
      annualIncome: 1020000,
      employer: "Tech Corp India",
    },
    confidence: {
      name: 0.96,
      monthlyIncome: 0.94,
      annualIncome: 0.95,
      employer: 0.92,
    },
  },

  taxReturn: {
    document_id: "doc_tax_001",
    extracted_fields: {
      name: "Rajesh Patel",
      financialYear: "2023-24",
      totalIncome: 1500000,
      taxPaid: 180000,
    },
    confidence: {
      name: 0.98,
      financialYear: 0.99,
      totalIncome: 0.93,
      taxPaid: 0.91,
    },
  },
}

export const sampleTokens = {
  ageProof: {
    id: "token_age_001",
    type: "eligibility_proof",
    claim: {
      type: "age_verification",
      threshold: 18,
      operator: "gte",
      verified: true,
    },
    issuer: "ZKVerify",
    subject: "0x1234567890abcdef",
    issued_at: "2024-01-15T10:30:00Z",
    expires_at: "2024-07-15T10:30:00Z",
    proof_hash: "zk_proof_hash_001",
  },

  incomeProof: {
    id: "token_income_001",
    type: "eligibility_proof",
    claim: {
      type: "income_verification",
      threshold: 1000000,
      operator: "gte",
      verified: true,
    },
    issuer: "ZKVerify",
    subject: "0x1234567890abcdef",
    issued_at: "2024-01-15T10:30:00Z",
    expires_at: "2024-07-15T10:30:00Z",
    proof_hash: "zk_proof_hash_002",
  },
}
