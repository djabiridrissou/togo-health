"use client"

import { getUserByEmail, addUser, initDB } from "./db"

// Initialiser la base de données au démarrage
if (typeof window !== "undefined") {
  initDB().catch((error) => console.error("Erreur d'initialisation de la base de données:", error))
}

// État d'authentification
let currentUser: any = null

// Fonction pour initialiser l'utilisateur depuis localStorage au chargement
export function initCurrentUser() {
  if (typeof window !== "undefined" && !currentUser) {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }
  return currentUser
}

// Appeler initCurrentUser au chargement
initCurrentUser()

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

    // Si l'utilisateur n'existe pas, créer un compte de démonstration pour faciliter les tests
    if (!user && email === "demo@example.com" && password === "demo123") {
      const demoUser = {
        firstName: "Utilisateur",
        lastName: "Démo",
        email: "demo@example.com",
        password: "demo123",
        role: "patient",
        phoneNumber: "+228 98765432",
      }

      const userId = await addUser(demoUser)
      const newUser = { ...demoUser, id: userId }
      localStorage.setItem("currentUser", JSON.stringify(newUser))
      currentUser = newUser
      return true
    }

    return false
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)

    // Pour les besoins de démonstration, permettre une connexion de secours
    if (email && password) {
      const fallbackUser = {
        id: Date.now(),
        firstName: "Utilisateur",
        lastName: "Temporaire",
        email: email,
        password: password,
        role: "patient",
        phoneNumber: "+228 00000000",
      }
      localStorage.setItem("currentUser", JSON.stringify(fallbackUser))
      currentUser = fallbackUser
      return true
    }

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
    const userId = await addUser(userData)

    // Connecter automatiquement l'utilisateur après l'inscription
    const newUser = { ...userData, id: userId }
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    currentUser = newUser

    return true
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)

    // Pour les besoins de démonstration, permettre une inscription de secours
    const fallbackUser = {
      id: Date.now(),
      ...userData,
    }
    localStorage.setItem("currentUser", JSON.stringify(fallbackUser))
    currentUser = fallbackUser
    return true
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
  return initCurrentUser()
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
