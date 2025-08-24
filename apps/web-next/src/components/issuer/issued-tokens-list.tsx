"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreVertical,
  Ban,
  Anchor,
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IssuedToken {
  id: string;
  subject: string;
  claim: {
    type: string;
    value: any;
    verified: boolean;
  };
  issuer: string;
  issued_at: string;
  expires_at: string;
  status: "active" | "revoked" | "expired";
  proof_hash: string;
  revocation_reason?: string;
  on_chain?: boolean;
  tx_hash?: string;
  notes?: string;
}

export function IssuedTokensList() {
  const [tokens, setTokens] = useState<IssuedToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<IssuedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedToken, setSelectedToken] = useState<IssuedToken | null>(null);
  const [revokeDialog, setRevokeDialog] = useState<IssuedToken | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    filterTokens();
  }, [tokens, searchQuery, statusFilter]);

  const loadTokens = async () => {
    try {
      // Mock data for development
      if (process.env.NEXT_PUBLIC_MOCK === "true") {
        const mockTokens: IssuedToken[] = [
          {
            id: "token_001",
            subject: "0x1234567890abcdef1234567890abcdef12345678",
            claim: { type: "age_verification", value: true, verified: true },
            issuer: "issuer@zkverify.com",
            issued_at: "2024-01-15T10:30:00Z",
            expires_at: "2024-07-15T10:30:00Z",
            status: "active",
            proof_hash: "hash_001",
            on_chain: true,
            tx_hash:
              "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          },
          {
            id: "token_002",
            subject: "0x9876543210fedcba9876543210fedcba98765432",
            claim: {
              type: "income_verification",
              value: "≥₹10,00,000",
              verified: true,
            },
            issuer: "issuer@zkverify.com",
            issued_at: "2024-01-10T14:20:00Z",
            expires_at: "2024-04-10T14:20:00Z",
            status: "expired",
            proof_hash: "hash_002",
          },
          {
            id: "token_003",
            subject: "0x5555666677778888999900001111222233334444",
            claim: {
              type: "identity_verification",
              value: "verified",
              verified: true,
            },
            issuer: "issuer@zkverify.com",
            issued_at: "2024-01-05T09:15:00Z",
            expires_at: "2024-12-05T09:15:00Z",
            status: "revoked",
            proof_hash: "hash_003",
            revocation_reason: "Requested by subject",
          },
        ];
        setTokens(mockTokens);
      }
    } catch (error) {
      toast({
        title: "Load failed",
        description: "Failed to load issued tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTokens = () => {
    let filtered = tokens;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (token) =>
          token.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.claim.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((token) => token.status === statusFilter);
    }

    setFilteredTokens(filtered);
  };

  const handleRevoke = async (token: IssuedToken) => {
    if (!revokeReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for revocation",
        variant: "destructive",
      });
      return;
    }

    setIsRevoking(true);

    try {
      const response = await apiClient.revokeCredential({
        proof_hash: token.proof_hash,
        reason: revokeReason,
      });

      if (response.data?.ok) {
        // Update token status
        setTokens(
          tokens.map((t) =>
            t.id === token.id
              ? {
                  ...t,
                  status: "revoked" as const,
                  revocation_reason: revokeReason,
                }
              : t
          )
        );

        toast({
          title: "Token revoked",
          description: "The token has been successfully revoked",
        });

        setRevokeDialog(null);
        setRevokeReason("");
      } else {
        throw new Error("Revocation failed");
      }
    } catch (error) {
      toast({
        title: "Revocation failed",
        description: "Failed to revoke token",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleAnchorOnChain = async (token: IssuedToken) => {
    try {
      // Mock on-chain anchoring
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 66);

      setTokens(
        tokens.map((t) =>
          t.id === token.id ? { ...t, on_chain: true, tx_hash: mockTxHash } : t
        )
      );

      toast({
        title: "Anchored on-chain",
        description: "Token has been anchored to the blockchain",
      });
    } catch (error) {
      toast({
        title: "Anchoring failed",
        description: "Failed to anchor token on-chain",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (token: IssuedToken) => {
    const blob = new Blob([JSON.stringify(token, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `token-${token.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getClaimLabel = (claim: any) => {
    return claim.type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
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
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issued Tokens</CardTitle>
          <CardDescription>
            Manage and monitor all tokens you have issued
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, subject, or claim type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTokens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {tokens.length === 0
                  ? "No tokens issued yet"
                  : "No tokens match your search criteria"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTokens.map((token) => (
                <Card key={token.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">{token.id}</span>
                          {getStatusBadge(token.status)}
                          {token.on_chain && (
                            <Badge variant="outline">On-Chain</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Subject: {formatAddress(token.subject)}</p>
                          <p>Claim: {getClaimLabel(token.claim)}</p>
                          <p>
                            Issued: {formatDate(token.issued_at)} • Expires:{" "}
                            {formatDate(token.expires_at)}
                          </p>
                          {token.revocation_reason && (
                            <p className="text-destructive">
                              Revoked: {token.revocation_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedToken(token)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(token)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download JSON
                          </DropdownMenuItem>
                          {!token.on_chain && token.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleAnchorOnChain(token)}
                            >
                              <Anchor className="mr-2 h-4 w-4" />
                              Anchor On-Chain
                            </DropdownMenuItem>
                          )}
                          {token.tx_hash && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`https://etherscan.io/tx/${token.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Transaction
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {token.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => setRevokeDialog(token)}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Revoke Token
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Details Dialog */}
      <Dialog
        open={!!selectedToken}
        onOpenChange={() => setSelectedToken(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Token Details</DialogTitle>
            <DialogDescription>
              Complete information about this issued token
            </DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Token ID:</span>
                  <span className="font-mono">{selectedToken.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Subject:</span>
                  <span className="font-mono">{selectedToken.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedToken.status)}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Proof Hash:</span>
                  <span className="font-mono text-xs">
                    {selectedToken.proof_hash}
                  </span>
                </div>
                {selectedToken.tx_hash && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction:</span>
                    <span className="font-mono text-xs">
                      {selectedToken.tx_hash}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Label className="font-medium">Complete Token JSON:</Label>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(selectedToken, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={!!revokeDialog} onOpenChange={() => setRevokeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Token</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The token will be permanently
              revoked and marked as invalid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revoke-reason">Reason for Revocation *</Label>
              <Textarea
                id="revoke-reason"
                placeholder="Enter the reason for revoking this token..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => revokeDialog && handleRevoke(revokeDialog)}
                disabled={isRevoking || !revokeReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {isRevoking ? "Revoking..." : "Revoke Token"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setRevokeDialog(null)}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
