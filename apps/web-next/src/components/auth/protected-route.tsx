"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/auth/login" }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push("/unauthorized")
      return
    }
  }, [session, status, router, requiredRole, redirectTo])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="flex items-center space-x-4 p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
