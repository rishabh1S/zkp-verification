"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/layout/navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { IssueAssistant } from "@/components/issuer/issue-assistant"
import { IssuedTokensList } from "@/components/issuer/issued-tokens-list"
import { IssuerLogs } from "@/components/issuer/issuer-logs"
import { Shield, FileText, History } from "lucide-react"

interface IssuerStats {
  totalIssued: number
  activeTokens: number
  revokedTokens: number
  expiredTokens: number
}

export default function IssuerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<IssuerStats>({
    totalIssued: 0,
    activeTokens: 0,
    revokedTokens: 0,
    expiredTokens: 0,
  })

  useEffect(() => {
    // Load issuer statistics
    loadStats()
  }, [])

  const loadStats = async () => {
    // Mock statistics for development
    if (process.env.NEXT_PUBLIC_MOCK === "true") {
      setStats({
        totalIssued: 47,
        activeTokens: 32,
        revokedTokens: 3,
        expiredTokens: 12,
      })
    }
  }

  return (
    <ProtectedRoute requiredRole="issuer">
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Issuer Console</h1>
              <p className="text-muted-foreground">
                Manage proof issuance, revocation, and monitoring for {session?.user?.email}
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalIssued}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                  <Shield className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.activeTokens}</div>
                  <p className="text-xs text-muted-foreground">Currently valid</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revoked</CardTitle>
                  <Shield className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.revokedTokens}</div>
                  <p className="text-xs text-muted-foreground">Manually revoked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expired</CardTitle>
                  <Shield className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.expiredTokens}</div>
                  <p className="text-xs text-muted-foreground">Naturally expired</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Console Tabs */}
            <Tabs defaultValue="assistant" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="assistant">
                  <FileText className="mr-2 h-4 w-4" />
                  Issue Assistant
                </TabsTrigger>
                <TabsTrigger value="tokens">
                  <Shield className="mr-2 h-4 w-4" />
                  Issued Tokens
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <History className="mr-2 h-4 w-4" />
                  Activity Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assistant">
                <IssueAssistant onTokenIssued={loadStats} />
              </TabsContent>

              <TabsContent value="tokens">
                <IssuedTokensList />
              </TabsContent>

              <TabsContent value="logs">
                <IssuerLogs />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
