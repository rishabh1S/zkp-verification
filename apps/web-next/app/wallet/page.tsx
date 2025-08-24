"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Navbar } from "@/components/layout/navbar"
import { proofStorage, type StoredProof } from "@/lib/storage"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Wallet,
  Plus,
  QrCode,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Edit3,
  Check,
  X,
  Shield,
  Search,
  Tag,
} from "lucide-react"

export default function WalletPage() {
  const [proofs, setProofs] = useState<StoredProof[]>([])
  const [filteredProofs, setFilteredProofs] = useState<StoredProof[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingProof, setEditingProof] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [selectedProof, setSelectedProof] = useState<StoredProof | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProofs()
  }, [])

  useEffect(() => {
    // Filter proofs based on search query
    if (searchQuery.trim()) {
      const filtered = proofs.filter(
        (proof) =>
          proof.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getClaimLabel(proof.token_json).toLowerCase().includes(searchQuery.toLowerCase()) ||
          proof.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredProofs(filtered)
    } else {
      setFilteredProofs(proofs)
    }
  }, [proofs, searchQuery])

  const loadProofs = async () => {
    try {
      const allProofs = await proofStorage.getAllProofs()
      setProofs(allProofs.reverse()) // Show newest first
    } catch (error) {
      console.error("Failed to load proofs:", error)
      toast({
        title: "Load failed",
        description: "Failed to load proofs from wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (proof: StoredProof) => {
    const blob = new Blob([JSON.stringify(proof.token_json, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zkverify-proof-${proof.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Downloaded",
      description: "Proof downloaded successfully",
    })
  }

  const handleVerify = async (proof: StoredProof) => {
    try {
      const response = await apiClient.verifyCredential({ token: proof.token_json })

      if (response.data) {
        toast({
          title: response.data.valid ? "Valid proof" : "Invalid proof",
          description: response.data.valid
            ? "This proof is valid and verified"
            : `Verification failed: ${response.data.reason || "Unknown reason"}`,
          variant: response.data.valid ? "default" : "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Failed to verify proof",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (proofId: string) => {
    try {
      await proofStorage.deleteProof(proofId)
      setProofs(proofs.filter((p) => p.id !== proofId))
      toast({
        title: "Proof deleted",
        description: "Proof has been removed from your wallet",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete proof",
        variant: "destructive",
      })
    }
  }

  const handleEditName = async (proofId: string, newName: string) => {
    try {
      await proofStorage.updateProof(proofId, { name: newName })
      setProofs(proofs.map((p) => (p.id === proofId ? { ...p, name: newName } : p)))
      setEditingProof(null)
      setEditName("")
      toast({
        title: "Name updated",
        description: "Proof name has been updated",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update proof name",
        variant: "destructive",
      })
    }
  }

  const startEditing = (proof: StoredProof) => {
    setEditingProof(proof.id)
    setEditName(proof.name || "")
  }

  const cancelEditing = () => {
    setEditingProof(null)
    setEditName("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getClaimLabel = (token: any) => {
    if (token.claim?.type) {
      return token.claim.type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
    }
    return "Eligibility Proof"
  }

  const isExpired = (token: any) => {
    if (!token.expires_at) return false
    return new Date(token.expires_at) < new Date()
  }

  const getStatusBadge = (proof: StoredProof) => {
    if (isExpired(proof.token_json)) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Proof Wallet</h1>
              <p className="text-muted-foreground">Manage your locally stored privacy-preserving proofs</p>
            </div>
            <Button asChild>
              <Link href="/upload">
                <Plus className="mr-2 h-4 w-4" />
                New Proof
              </Link>
            </Button>
          </div>

          {proofs.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proofs by name, type, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {filteredProofs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {proofs.length === 0 ? "No Proofs in Wallet" : "No Matching Proofs"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {proofs.length === 0
                    ? "Your proof wallet is empty. Create your first proof to get started."
                    : "No proofs match your search criteria. Try a different search term."}
                </p>
                {proofs.length === 0 && (
                  <Button asChild>
                    <Link href="/upload">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Proof
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProofs.map((proof) => (
                <Card key={proof.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingProof === proof.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1"
                              placeholder="Enter proof name"
                            />
                            <Button size="sm" onClick={() => handleEditName(proof.id, editName)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{proof.name || "Unnamed Proof"}</CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(proof)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <CardDescription>
                          {getClaimLabel(proof.token_json)} • Created {formatDate(proof.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(proof)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedProof(proof)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVerify(proof)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Verify Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(proof)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(proof.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {proof.token_json.claim && (
                        <div className="text-sm">
                          <span className="font-medium">Claim:</span> {getClaimLabel(proof.token_json)}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-medium">Expires:</span>{" "}
                        {proof.token_json.expires_at ? formatDate(proof.token_json.expires_at) : "No expiration"}
                      </div>
                      {proof.tags && proof.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {proof.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="mr-1 h-2 w-2" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/verify?token=${encodeURIComponent(JSON.stringify(proof.token_json))}`}>
                            <QrCode className="mr-2 h-3 w-3" />
                            Show QR
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(proof)}>
                          <Download className="mr-2 h-3 w-3" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVerify(proof)}>
                          <Shield className="mr-2 h-3 w-3" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Proof Details Dialog */}
          <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedProof?.name || "Proof Details"}</DialogTitle>
                <DialogDescription>Complete information about this proof</DialogDescription>
              </DialogHeader>
              {selectedProof && (
                <div className="space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">ID:</span>
                      <span className="font-mono text-xs">{selectedProof.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span>{formatDate(selectedProof.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Proof Hash:</span>
                      <span className="font-mono text-xs">{selectedProof.proof_hash}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Token JSON:</Label>
                    <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                      {JSON.stringify(selectedProof.token_json, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
