"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/navbar";
import { QRScanner } from "@/components/verification/qr-scanner";
import { VerificationResult } from "@/components/verification/verification-result";
import { apiClient, type VerifyResponse, type ProofToken } from "@/lib/api";
import toast from "react-hot-toast";
import { QrCode, FileText, Loader2, Shield } from "lucide-react";

export default function VerifyPage() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState("paste");
  const [tokenInput, setTokenInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerifyResponse | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<ProofToken | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      try {
        const token = JSON.parse(decodeURIComponent(tokenParam));
        setTokenInput(JSON.stringify(token, null, 2));
        setActiveTab("paste");
      } catch (error) {
        console.error("Failed to parse token from URL:", error);
      }
    }
  }, [searchParams]);

  const handleVerify = async (tokenData: string) => {
    setIsVerifying(true);
    setVerificationResult(null);
    setVerifiedToken(null);

    try {
      let token: ProofToken;
      try {
        token = JSON.parse(tokenData);
      } catch {
        throw new Error("Invalid JSON format");
      }

      const response = await apiClient.verifyCredential({ token });

      if (response.data) {
        setVerificationResult(response.data);
        console.log(token);
        setVerifiedToken(token);
        toast.success("Verification completed");
      } else {
        throw new Error(response.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasteVerify = () => {
    if (!tokenInput.trim()) {
      toast.error("Please enter a proof token to verify");
      return;
    }
    handleVerify(tokenInput);
  };

  const handleQRScan = (data: string) => {
    setShowScanner(false);

    try {
      const token = JSON.parse(data);
      const pretty = JSON.stringify(token, null, 2);
      setTokenInput(pretty);
      setActiveTab("paste");
      handleVerify(pretty);
    } catch {
      toast.error("The scanned QR code doesn't contain a valid proof token");
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setVerifiedToken(null);
    setTokenInput("");
    setActiveTab("paste");
  };

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
    );
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <QRScanner
              onScan={handleQRScan}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Verify Proof</h1>
            <p className="text-muted-foreground">
              Verify the authenticity and validity of a ZKVerify proof
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Methods</CardTitle>
              <CardDescription>
                Provide the proof token for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste">
                    <FileText className="mr-2 h-4 w-4" />
                    Paste Token
                  </TabsTrigger>
                  <TabsTrigger value="qr">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR
                  </TabsTrigger>
                </TabsList>

                {/* Paste JSON token */}
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
                  <Button
                    onClick={handlePasteVerify}
                    disabled={isVerifying || !tokenInput.trim()}
                    className="w-full"
                  >
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

                {/* QR scanner */}
                <TabsContent value="qr" className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan a QR code containing a proof token
                    </p>
                    <Button
                      onClick={() => setShowScanner(true)}
                      className="w-full"
                    >
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
              <li>• Cryptographic signature is validated</li>
              <li>• Expiration date is checked</li>
              <li>• Revocation status is verified</li>
              <li>• On-chain anchoring is confirmed (if applicable)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
