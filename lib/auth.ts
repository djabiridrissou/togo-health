"use client"

import { getUserByEmail, initDB } from "./db"

// Initialiser la base de données au démarrage
if (typeof window !== "undefined") {
  initDB()
}

// État d'authentification
let currentUser: any = null

// Fonction de connexion
export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    // Récupérer l'utilisateur depuis la base de données
    const user = await getUserByEmail(email)

    if (user && user.password === password) {
      // Stocker l'utilisateur dans localStorage
      localStorage.setItem("currentUser", JSON.stringify(user))
      currentUser = user
      return true
    }

    return false
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    return false
  }
}

// Fonction d'inscription
export async function registerUser(userData: any): Promise<boolean> {
  try {
    // Vérifier si l'email existe déjà
    const existingUser = await getUserByEmail(userData.email)

    if (existingUser) {
      return false
    }

    // Créer un nouvel utilisateur dans la base de données
    const { addUser } = await import("./db")
    await addUser(userData)

    return true
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return false
  }
}

// Fonction de déconnexion
export function logoutUser(): void {
  localStorage.removeItem("currentUser")
  currentUser = null

  // Rediriger vers la page d'accueil
  if (typeof window !== "undefined") {
    window.location.href = "/"
  }
}

// Obtenir l'utilisateur actuel
export function getCurrentUser(): any {
  if (currentUser) {
    return currentUser
  }

  // Essayer de récupérer depuis localStorage
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      currentUser = JSON.parse(storedUser)
      return currentUser
    }
  }

  return null
}

// Obtenir le rôle de l'utilisateur
export function getUserRole(): string | null {
  const user = getCurrentUser()
  return user ? user.role : null
}

// Vérifier si l'utilisateur est authentifié
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

// Vérifier si l'utilisateur a un rôle spécifique
export function hasRole(role: string): boolean {
  const user = getCurrentUser()
  return user ? user.role === role : false
}

// Vérifier si l'utilisateur a l'un des rôles spécifiés
export function hasAnyRole(roles: string[]): boolean {
  const user = getCurrentUser()
  return user ? roles.includes(user.role) : false
}

// Middleware pour protéger les routes
export function authMiddleware(allowedRoles: string[] = []): boolean {
  const user = getCurrentUser()

  if (!user) {
    return false
  }

  if (allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.includes(user.role)
}
