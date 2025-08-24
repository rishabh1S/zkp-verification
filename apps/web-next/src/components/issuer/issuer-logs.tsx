"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Ban, Anchor, AlertCircle } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  action: "issue" | "revoke" | "anchor" | "error"
  token_id?: string
  subject?: string
  details: string
  metadata?: any
}

export function IssuerLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery, actionFilter])

  const loadLogs = async () => {
    try {
      // Mock log data for development
      if (process.env.NEXT_PUBLIC_MOCK === "true") {
        const mockLogs: LogEntry[] = [
          {
            id: "log_001",
            timestamp: "2024-01-15T10:30:00Z",
            action: "issue",
            token_id: "token_001",
            subject: "0x1234567890abcdef1234567890abcdef12345678",
            details: "Issued age verification token for subject",
            metadata: { claim_type: "age_verification", expiration: "2024-07-15" },
          },
          {
            id: "log_002",
            timestamp: "2024-01-15T10:25:00Z",
            action: "anchor",
            token_id: "token_001",
            details: "Token anchored on-chain",
            metadata: { tx_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" },
          },
          {
            id: "log_003",
            timestamp: "2024-01-14T16:45:00Z",
            action: "revoke",
            token_id: "token_003",
            subject: "0x5555666677778888999900001111222233334444",
            details: "Token revoked: Requested by subject",
            metadata: { reason: "Requested by subject" },
          },
          {
            id: "log_004",
            timestamp: "2024-01-14T14:20:00Z",
            action: "issue",
            token_id: "token_002",
            subject: "0x9876543210fedcba9876543210fedcba98765432",
            details: "Issued income verification token for subject",
            metadata: { claim_type: "income_verification", expiration: "2024-04-10" },
          },
          {
            id: "log_005",
            timestamp: "2024-01-14T09:15:00Z",
            action: "error",
            details: "Failed to process document upload: Invalid file format",
            metadata: { error_code: "INVALID_FORMAT", file_type: "txt" },
          },
        ]
        setLogs(mockLogs.reverse()) // Show newest first
      }
    } catch (error) {
      console.error("Failed to load logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = logs

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (log) =>
          log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.token_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    setFilteredLogs(filtered)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "issue":
        return <FileText className="h-4 w-4 text-green-600" />
      case "revoke":
        return <Ban className="h-4 w-4 text-red-600" />
      case "anchor":
        return <Anchor className="h-4 w-4 text-blue-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "issue":
        return <Badge variant="default">Issue</Badge>
      case "revoke":
        return <Badge variant="destructive">Revoke</Badge>
      case "anchor":
        return <Badge variant="secondary">Anchor</Badge>
      case "error":
        return <Badge variant="outline">Error</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Track all issuance, revocation, and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by details, token ID, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="revoke">Revoke</SelectItem>
                <SelectItem value="anchor">Anchor</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {logs.length === 0 ? "No activity logs yet" : "No logs match your search criteria"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp)
                return (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">{getActionIcon(log.action)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getActionBadge(log.action)}
                              {log.token_id && (
                                <span className="text-sm font-mono text-muted-foreground">{log.token_id}</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {date} at {time}
                            </div>
                          </div>
                          <p className="text-sm">{log.details}</p>
                          {log.subject && (
                            <p className="text-xs text-muted-foreground">Subject: {formatAddress(log.subject)}</p>
                          )}
                          {log.metadata && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
