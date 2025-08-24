"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { apiClient, type ProofStatusResponse } from "@/lib/api";
import { proofStorage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  QrCode,
  Wallet,
  ArrowLeft,
} from "lucide-react";

export default function ProofStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const jobId = params.jobId as string;

  const [status, setStatus] = useState<ProofStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const response = await apiClient.getProofStatus(jobId);
        if (response.data) {
          setStatus(response.data);

          // Update progress based on status
          switch (response.data.status) {
            case "queued":
              setProgress(25);
              break;
            case "running":
              setProgress(75);
              break;
            case "done":
              setProgress(100);
              setIsPolling(false);
              break;
            case "failed":
              setProgress(100);
              setIsPolling(false);
              break;
          }
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
        setIsPolling(false);
      }
    };

    // Initial fetch
    pollStatus();

    // Set up polling
    const interval = setInterval(() => {
      if (isPolling) {
        pollStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, isPolling]);

  const handleSaveToWallet = async () => {
    if (!status?.token) return;

    try {
      const proofId = await proofStorage.saveProof({
        token_json: status.token,
        proof_hash: status.token.proof_hash || `hash_${jobId}`,
        name: `Proof ${new Date().toLocaleDateString()}`,
      });

      toast({
        title: "Saved to wallet",
        description: "Proof has been saved to your local wallet",
      });

      router.push("/wallet");
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save proof to wallet",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!status?.token) return;

    const blob = new Blob([JSON.stringify(status.token, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zkverify-proof-${jobId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    if (!status)
      return <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />;

    switch (status.status) {
      case "done":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "failed":
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    }
  };

  const getStatusText = () => {
    if (!status) return "Loading...";

    switch (status.status) {
      case "queued":
        return "Queued for processing";
      case "running":
        return "Generating proof...";
      case "done":
        return "Proof generated successfully";
      case "failed":
        return "Proof generation failed";
      default:
        return "Unknown status";
    }
  };

  const getStatusColor = () => {
    if (!status) return "secondary";

    switch (status.status) {
      case "done":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/upload">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{getStatusIcon()}</div>
              <CardTitle>Proof Generation Status</CardTitle>
              <CardDescription>Job ID: {jobId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
                </div>
                <Progress value={progress} />
              </div>

              {status?.status === "done" && status.token && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Proof Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {status.token.claim?.type || "Eligibility Proof"}
                      </p>
                      <p>
                        <span className="font-medium">Issued:</span>{" "}
                        {new Date(status.token.issued_at).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(status.token.expires_at).toLocaleDateString()}
                      </p>
                      {status.proof_uri && (
                        <p>
                          <span className="font-medium">Proof URI:</span>{" "}
                          <code className="text-xs bg-background px-1 rounded">
                            {status.proof_uri}
                          </code>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleSaveToWallet} className="flex-1">
                      <Wallet className="mr-2 h-4 w-4" />
                      Save to Wallet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1 bg-transparent"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download JSON
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="flex-1 bg-transparent"
                    >
                      <Link
                        href={`/verify?token=${encodeURIComponent(
                          JSON.stringify(status.token)
                        )}`}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Show QR
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {status?.status === "failed" && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h3 className="font-medium text-destructive mb-2">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-destructive/80">
                    {status.error ||
                      "An error occurred during proof generation. Please try again."}
                  </p>
                  <Button
                    variant="outline"
                    asChild
                    className="mt-3 bg-transparent"
                  >
                    <Link href="/upload">Try Again</Link>
                  </Button>
                </div>
              )}

              {isPolling && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    This page will automatically update when your proof is
                    ready.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
