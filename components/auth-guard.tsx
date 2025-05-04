"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"

type AuthGuardProps = {
  children: React.ReactNode
  allowedRoles?: string[]
  fallbackUrl?: string
}

export function AuthGuard({ children, allowedRoles = [], fallbackUrl = "/login" }: AuthGuardProps) {
  const { isAuthenticated, userRole, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`${fallbackUrl}?callbackUrl=${encodeURIComponent(pathname)}`)
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole as string)) {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, userRole, loading, router, pathname, allowedRoles, fallbackUrl])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole as string)) {
    return null
  }

  return <>{children}</>
}
