"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/components/auth/auth-provider";
import { proofStorage, type StoredProof } from "@/lib/storage";
import { Plus, QrCode, Download, Eye, Trash2, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [proofs, setProofs] = useState<StoredProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { walletSession } = useAuth();

  useEffect(() => {
    loadProofs();
  }, []);

  const loadProofs = async () => {
    try {
      const allProofs = await proofStorage.getAllProofs();
      setProofs(allProofs.toReversed()); // Show newest first
    } catch (error) {
      console.error("Failed to load proofs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (proof: StoredProof) => {
    const blob = new Blob([JSON.stringify(proof.token_json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zkverify-proof-${proof.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (proofId: string) => {
    try {
      await proofStorage.deleteProof(proofId);
      setProofs(proofs.filter((p) => p.id !== proofId));
      toast.success("Proof has been removed from your wallet");
    } catch (error) {
      console.error("Failed to delete proof:", error);
      toast.error("Failed to delete proof");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getClaimLabel = (token: any) => {
    if (token.claim?.type) {
      return token.claim.type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    return "Eligibility Proof";
  };

  if (!walletSession) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Connect Your Wallet
                </h2>
                <p className="text-muted-foreground mb-4">
                  Please connect your wallet to view your proofs and access the
                  dashboard.
                </p>
                <Button asChild>
                  <Link href="/auth/login">Connect Wallet</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your privacy-preserving proofs
              </p>
            </div>
            <Button asChild>
              <Link href="/upload">
                <Plus className="mr-2 h-4 w-4" />
                New Proof
              </Link>
            </Button>
          </div>

          {(() => {
            let content;
            if (isLoading) {
              content = (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            } else if (proofs.length === 0) {
              content = (
                <Card>
                  <CardContent className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Proofs Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any proofs yet. Start by uploading a
                      document to generate your first privacy-preserving proof.
                    </p>
                    <Button asChild>
                      <Link href="/upload">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Proof
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            } else {
              content = (
                <div className="grid gap-4">
                  {proofs.map((proof) => (
                    <Card key={proof.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {proof.name || "Unnamed Proof"}
                            </CardTitle>
                            <CardDescription>
                              {getClaimLabel(proof.token_json)} • Created{" "}
                              {formatDate(proof.created_at)}
                            </CardDescription>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {proof.token_json.claim && (
                            <div className="text-sm">
                              <span className="font-medium">Claim:</span>{" "}
                              {proof.token_json.claim.type || "Eligibility"}
                            </div>
                          )}
                          <div className="text-sm">
                            <span className="font-medium">Expires:</span>{" "}
                            {proof.token_json.expires_at
                              ? formatDate(proof.token_json.expires_at)
                              : "No expiration"}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/verify?token=${encodeURIComponent(
                                  JSON.stringify(proof.token_json)
                                )}`}
                              >
                                <QrCode className="mr-2 h-3 w-3" />
                                Show QR
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(proof)}
                            >
                              <Download className="mr-2 h-3 w-3" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/verify?token=${encodeURIComponent(
                                  JSON.stringify(proof.token_json)
                                )}`}
                              >
                                <Eye className="mr-2 h-3 w-3" />
                                Verify
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(proof.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            }
            return content;
          })()}
        </div>
      </div>
    </div>
  );
}
