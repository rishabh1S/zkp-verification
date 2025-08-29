"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import type { VerifyResponse } from "@/lib/api";

interface VerificationResultProps {
  result: VerifyResponse;
  token?: any;
  onNewVerification: () => void;
}

export function VerificationResult({
  result,
  token,
  onNewVerification,
}: VerificationResultProps) {
  const getStatusIcon = () => {
    if (result.valid) {
      return <CheckCircle className="h-12 w-12 text-green-500" />;
    } else {
      return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    return result.valid ? "default" : "destructive";
  };

  const getStatusText = () => {
    if (result.valid) {
      return "Valid Proof";
    } else {
      switch (result.reason) {
        case "expired":
          return "Expired Proof";
        case "revoked":
          return "Revoked Proof";
        case "invalid":
          return "Invalid Proof";
        default:
          return "Verification Failed";
      }
    }
  };

  const copyTxHash = () => {
    if (result.txHash) {
      navigator.clipboard.writeText(result.txHash);
      toast.success("Transaction hash copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getClaimDescription = (claim: any) => {
    if (!claim) return "Unknown claim";

    switch (claim.type) {
      case "age_verification":
        return `Age verification (≥${claim.threshold || 18} years)`;
      case "income_verification":
        return `Income verification (≥₹${(
          claim.threshold || 0
        ).toLocaleString()})`;
      case "tax_verification":
        return `Tax verification (≥₹${(
          claim.threshold || 0
        ).toLocaleString()})`;
      default:
        return (
          claim.type
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
          "Custom verification"
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-2xl">{getStatusText()}</CardTitle>
          <CardDescription>
            Verification completed via{" "}
            {result.method === "onchain" ? "on-chain" : "off-chain"} method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Badge variant={getStatusColor()} className="text-sm px-4 py-2">
              {result.valid ? "✓ Verified" : "✗ Not Verified"}
            </Badge>
          </div>

          {!result.valid && result.reason && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">
                  Verification Failed
                </span>
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                {result.reason === "expired" &&
                  "This proof has expired and is no longer valid."}
                {result.reason === "revoked" &&
                  "This proof has been revoked by the issuer."}
                {result.reason === "invalid" &&
                  "This proof is invalid or has been tampered with."}
                {!["expired", "revoked", "invalid"].includes(result.reason) &&
                  `Reason: ${result.reason}`}
              </p>
            </div>
          )}

          {token && (
            <div className="space-y-3">
              <h3 className="font-semibold">Proof Details</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claim:</span>
                  <span>{getClaimDescription(token.claim)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issuer:</span>
                  <span>{token.issuer || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <span>
                    {token.issued_at ? formatDate(token.issued_at) : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>
                    {token.expires_at
                      ? formatDate(token.expires_at)
                      : "No expiration"}
                  </span>
                </div>
                {token.subject && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-mono text-xs">
                      {token.subject.slice(0, 10)}...{token.subject.slice(-8)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.details && (
            <div className="space-y-3">
              <h3 className="font-semibold">Verification Details</h3>
              <div className="grid gap-2 text-sm">
                {Object.entries(result.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span>
                      {value === true
                        ? "✓"
                        : value === false
                        ? "✗"
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.method === "onchain" && result.txHash && (
            <div className="space-y-2">
              <h3 className="font-semibold">Blockchain Verification</h3>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Transaction Hash</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {result.txHash.slice(0, 20)}...
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={copyTxHash}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={`https://etherscan.io/tx/${result.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button onClick={onNewVerification} className="w-full">
            Verify Another Proof
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
