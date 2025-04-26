"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"
import { hasPermission, type Permission } from "@/lib/permissions"

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermission?: Permission
  fallbackUrl?: string
}

export function AuthGuard({ children, requiredPermission, fallbackUrl = "/login" }: AuthGuardProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const authenticated = isAuthenticated()

    if (!authenticated) {
      router.push(fallbackUrl)
      return
    }

    // Si une permission spécifique est requise, vérifier si l'utilisateur l'a
    if (requiredPermission) {
      const userRole = getUserRole()
      const hasRequiredPermission = hasPermission(userRole, requiredPermission)

      if (!hasRequiredPermission) {
        router.push("/dashboard")
        return
      }
    }

    setAuthorized(true)
  }, [router, requiredPermission, fallbackUrl])

  // Afficher un écran de chargement pendant la vérification
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
