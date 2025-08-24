"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/upload/file-upload"
import { DocumentPreview } from "@/components/upload/document-preview"
import { apiClient, type DocumentUploadResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Upload, Wand2, Loader2, CheckCircle, Copy } from "lucide-react"

interface IssueAssistantProps {
  onTokenIssued: () => void
}

interface ManualClaim {
  type: string
  label: string
  value: any
  verified: boolean
}

export function IssueAssistant({ onTokenIssued }: IssueAssistantProps) {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [mode, setMode] = useState<"upload" | "manual">("upload")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documentData, setDocumentData] = useState<DocumentUploadResponse | null>(null)
  const [hasConsented, setHasConsented] = useState(false)

  // Manual issuance fields
  const [subjectAddress, setSubjectAddress] = useState("")
  const [claimType, setClaimType] = useState("")
  const [customClaimType, setCustomClaimType] = useState("")
  const [claimValue, setClaimValue] = useState("")
  const [expirationDays, setExpirationDays] = useState("30")
  const [notes, setNotes] = useState("")

  const [isIssuing, setIsIssuing] = useState(false)
  const [issuedToken, setIssuedToken] = useState<any>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setDocumentData(null)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setDocumentData(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      const response = await apiClient.uploadDocument(selectedFile)

      if (response.data) {
        setDocumentData(response.data)
        setUploadProgress(100)
        toast({
          title: "Upload successful",
          description: "Document processed successfully",
        })
      } else {
        throw new Error(response.error || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process document",
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const handleFieldUpdate = (field: string, value: any) => {
    if (documentData) {
      setDocumentData({
        ...documentData,
        extracted_fields: {
          ...documentData.extracted_fields,
          [field]: value,
        },
      })
    }
  }

  const handleIssueFromUpload = async () => {
    if (!documentData || !hasConsented) return

    setIsIssuing(true)

    try {
      // Mock token issuance
      const mockToken = {
        id: `token_issued_${Date.now()}`,
        type: "eligibility_proof",
        claim: {
          type: "document_verification",
          verified: true,
          fields: documentData.extracted_fields,
        },
        issuer: session?.user?.email || "Unknown Issuer",
        subject: subjectAddress || "manual_issuance",
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + Number.parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString(),
        proof_hash: `hash_${Date.now()}`,
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIssuedToken(mockToken)
      onTokenIssued()

      toast({
        title: "Token issued successfully",
        description: "The proof token has been generated and signed",
      })
    } catch (error) {
      toast({
        title: "Issuance failed",
        description: "Failed to issue token",
        variant: "destructive",
      })
    } finally {
      setIsIssuing(false)
    }
  }

  const handleManualIssue = async () => {
    if (!subjectAddress || !claimType || !claimValue) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsIssuing(true)

    try {
      const finalClaimType = claimType === "custom" ? customClaimType : claimType

      const mockToken = {
        id: `token_manual_${Date.now()}`,
        type: "eligibility_proof",
        claim: {
          type: finalClaimType,
          value: claimValue,
          verified: true,
        },
        issuer: session?.user?.email || "Unknown Issuer",
        subject: subjectAddress,
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + Number.parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString(),
        proof_hash: `hash_${Date.now()}`,
        notes: notes || undefined,
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIssuedToken(mockToken)
      onTokenIssued()

      // Reset form
      setSubjectAddress("")
      setClaimType("")
      setCustomClaimType("")
      setClaimValue("")
      setNotes("")

      toast({
        title: "Token issued successfully",
        description: "The manual proof token has been generated",
      })
    } catch (error) {
      toast({
        title: "Issuance failed",
        description: "Failed to issue manual token",
        variant: "destructive",
      })
    } finally {
      setIsIssuing(false)
    }
  }

  const copyToken = () => {
    if (issuedToken) {
      navigator.clipboard.writeText(JSON.stringify(issuedToken, null, 2))
      toast({
        title: "Token copied",
        description: "Token JSON copied to clipboard",
      })
    }
  }

  const resetForm = () => {
    setIssuedToken(null)
    setSelectedFile(null)
    setDocumentData(null)
    setHasConsented(false)
    setSubjectAddress("")
    setClaimType("")
    setCustomClaimType("")
    setClaimValue("")
    setNotes("")
  }

  if (issuedToken) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Token Issued Successfully</CardTitle>
          <CardDescription>The proof token has been generated and is ready for use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Token Details</h3>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{issuedToken.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-mono text-xs">{issuedToken.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim Type:</span>
                <span>{issuedToken.claim.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span>{new Date(issuedToken.expires_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={copyToken} className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy Token JSON
            </Button>
            <Button variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
              Issue Another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issue New Proof Token</CardTitle>
          <CardDescription>Generate and sign proof tokens for verified claims</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button
              variant={mode === "upload" ? "default" : "outline"}
              onClick={() => setMode("upload")}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Document Upload
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="flex-1"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Manual Issuance
            </Button>
          </div>

          {mode === "upload" ? (
            <div className="space-y-6">
              {!documentData ? (
                <div>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                  />
                  {selectedFile && !isUploading && (
                    <div className="mt-4">
                      <Button onClick={handleUpload} className="w-full">
                        Process Document
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <DocumentPreview
                    documentData={documentData}
                    onFieldUpdate={handleFieldUpdate}
                    onConsent={setHasConsented}
                    hasConsented={hasConsented}
                  />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Address (Optional)</Label>
                      <Input
                        id="subject"
                        placeholder="0x... or leave empty for manual issuance"
                        value={subjectAddress}
                        onChange={(e) => setSubjectAddress(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiration">Expiration (Days)</Label>
                      <Select value={expirationDays} onValueChange={setExpirationDays}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleIssueFromUpload} disabled={!hasConsented || isIssuing} className="w-full">
                      {isIssuing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Issuing Token...
                        </>
                      ) : (
                        "Issue Proof Token"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-manual">Subject Address *</Label>
                <Input
                  id="subject-manual"
                  placeholder="0x... wallet address or identifier"
                  value={subjectAddress}
                  onChange={(e) => setSubjectAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claim-type">Claim Type *</Label>
                <Select value={claimType} onValueChange={setClaimType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="age_verification">Age Verification</SelectItem>
                    <SelectItem value="income_verification">Income Verification</SelectItem>
                    <SelectItem value="identity_verification">Identity Verification</SelectItem>
                    <SelectItem value="education_verification">Education Verification</SelectItem>
                    <SelectItem value="employment_verification">Employment Verification</SelectItem>
                    <SelectItem value="custom">Custom Claim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {claimType === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-claim">Custom Claim Type *</Label>
                  <Input
                    id="custom-claim"
                    placeholder="Enter custom claim type"
                    value={customClaimType}
                    onChange={(e) => setCustomClaimType(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="claim-value">Claim Value *</Label>
                <Input
                  id="claim-value"
                  placeholder="The value being verified (e.g., 'true', '25', 'verified')"
                  value={claimValue}
                  onChange={(e) => setClaimValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration-manual">Expiration (Days)</Label>
                <Select value={expirationDays} onValueChange={setExpirationDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this issuance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleManualIssue} disabled={isIssuing} className="w-full">
                {isIssuing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Issuing Token...
                  </>
                ) : (
                  "Issue Manual Token"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
