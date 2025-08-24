"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/layout/navbar"
import { QRScanner } from "@/components/verification/qr-scanner"
import { VerificationResult } from "@/components/verification/verification-result"
import { apiClient, type VerifyResponse } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { QrCode, FileText, LinkIcon, Loader2, Shield } from "lucide-react"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("paste")
  const [tokenInput, setTokenInput] = useState("")
  const [uriInput, setUriInput] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerifyResponse | null>(null)
  const [verifiedToken, setVerifiedToken] = useState<any>(null)

  // Check for token in URL params
  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      try {
        const token = JSON.parse(decodeURIComponent(tokenParam))
        setTokenInput(JSON.stringify(token, null, 2))
        setActiveTab("paste")
      } catch (error) {
        console.error("Failed to parse token from URL:", error)
      }
    }
  }, [searchParams])

  const handleVerify = async (tokenData?: string, proofUri?: string) => {
    setIsVerifying(true)
    setVerificationResult(null)
    setVerifiedToken(null)

    try {
      const payload: { token?: any; proof_uri?: string } = {}
      let token = null

      if (tokenData) {
        try {
          token = JSON.parse(tokenData)
          payload.token = token
        } catch (error) {
          throw new Error("Invalid JSON format")
        }
      } else if (proofUri) {
        payload.proof_uri = proofUri
      } else {
        throw new Error("No token or URI provided")
      }

      const response = await apiClient.verifyCredential(payload)

      if (response.data) {
        setVerificationResult(response.data)
        setVerifiedToken(token)
        toast({
          title: response.data.valid ? "Verification successful" : "Verification failed",
          description: response.data.valid ? "The proof is valid" : "The proof is not valid",
          variant: response.data.valid ? "default" : "destructive",
        })
      } else {
        throw new Error(response.error || "Verification failed")
      }
    } catch (error) {
      toast({
        title: "Verification error",
        description: error instanceof Error ? error.message : "An error occurred during verification",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handlePasteVerify = () => {
    if (!tokenInput.trim()) {
      toast({
        title: "No token provided",
        description: "Please paste a token to verify",
        variant: "destructive",
      })
      return
    }
    handleVerify(tokenInput)
  }

  const handleUriVerify = () => {
    if (!uriInput.trim()) {
      toast({
        title: "No URI provided",
        description: "Please enter a proof URI to verify",
        variant: "destructive",
      })
      return
    }
    handleVerify(undefined, uriInput)
  }

  const handleQRScan = (data: string) => {
    setShowScanner(false)

    // Try to parse as JSON first (direct token)
    try {
      JSON.parse(data)
      setTokenInput(data)
      setActiveTab("paste")
      handleVerify(data)
      return
    } catch {
      // Not JSON, might be a URI
      if (data.startsWith("zkverify://") || data.startsWith("https://")) {
        setUriInput(data)
        setActiveTab("uri")
        handleVerify(undefined, data)
      } else {
        toast({
          title: "Invalid QR code",
          description: "The scanned QR code doesn't contain a valid proof",
          variant: "destructive",
        })
      }
    }
  }

  const resetVerification = () => {
    setVerificationResult(null)
    setVerifiedToken(null)
    setTokenInput("")
    setUriInput("")
    setActiveTab("paste")
  }

  if (verificationResult) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <VerificationResult
              result={verificationResult}
              token={verifiedToken}
              onNewVerification={resetVerification}
            />
          </div>
        </div>
      </div>
    )
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Verify Proof</h1>
            <p className="text-muted-foreground">Verify the authenticity and validity of a ZKVerify proof</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Methods</CardTitle>
              <CardDescription>Choose how you want to provide the proof for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="paste">
                    <FileText className="mr-2 h-4 w-4" />
                    Paste Token
                  </TabsTrigger>
                  <TabsTrigger value="uri">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Proof URI
                  </TabsTrigger>
                  <TabsTrigger value="qr">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Proof Token (JSON)</Label>
                    <Textarea
                      id="token"
                      placeholder="Paste the complete proof token JSON here..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button onClick={handlePasteVerify} disabled={isVerifying || !tokenInput.trim()} className="w-full">
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Token"
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="uri" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="uri">Proof URI</Label>
                    <Input
                      id="uri"
                      placeholder="zkverify://proof/... or https://..."
                      value={uriInput}
                      onChange={(e) => setUriInput(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a proof URI that links to the verification data
                    </p>
                  </div>
                  <Button onClick={handleUriVerify} disabled={isVerifying || !uriInput.trim()} className="w-full">
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify URI"
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="qr" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Scan a QR code containing a proof token or URI</p>
                    <Button onClick={() => setShowScanner(true)} className="w-full">
                      <QrCode className="mr-2 h-4 w-4" />
                      Open Camera Scanner
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">How Verification Works</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cryptographic signatures are validated</li>
              <li>• Expiration dates are checked</li>
              <li>• Revocation status is verified</li>
              <li>• On-chain anchoring is confirmed (if applicable)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
