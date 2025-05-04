"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getCurrentUser, isAuthenticated, getUserRole, hasRole, hasAnyRole, logoutUser } from "@/lib/auth"

type AuthContextType = {
  user: any
  isAuthenticated: boolean
  userRole: string | null
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  userRole: null,
  hasRole: () => false,
  hasAnyRole: () => false,
  logout: () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState<{
    user: any
    isAuthenticated: boolean
    userRole: string | null
  }>({
    user: null,
    isAuthenticated: false,
    userRole: null,
  })

  useEffect(() => {
    // Initialiser l'état d'authentification
    const user = getCurrentUser()
    const authenticated = isAuthenticated()
    const role = getUserRole()

    setAuthState({
      user,
      isAuthenticated: authenticated,
      userRole: role,
    })
    setLoading(false)
  }, [])

  const authContextValue: AuthContextType = {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    userRole: authState.userRole,
    hasRole: (role: string) => hasRole(role as any),
    hasAnyRole: (roles: string[]) => hasAnyRole(roles as any[]),
    logout: logoutUser,
    loading,
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>
}
