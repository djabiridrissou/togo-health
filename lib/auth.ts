"use client"

import { getUserByEmail, addUser, initDB } from "./db"
import type { UserRole } from "./permissions.tsx"

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
        const parsedUser = JSON.parse(storedUser)

        // Vérifier que l'utilisateur a les propriétés essentielles
        if (!parsedUser || !parsedUser.email || !parsedUser.role) {
          console.warn("Données utilisateur incomplètes dans localStorage")
          localStorage.removeItem("currentUser")
          localStorage.removeItem("userRole")
          return null
        }

        // Stocker l'utilisateur valide
        currentUser = parsedUser

        // Stocker également le rôle séparément pour un accès facile
        localStorage.setItem("userRole", currentUser.role)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
        localStorage.removeItem("currentUser")
        localStorage.removeItem("userRole")
        return null
      }
    }
  }
  return currentUser
}

// Appeler initCurrentUser au chargement
if (typeof window !== "undefined") {
  initCurrentUser()
}

// Fonction de connexion
export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    // Importer la fonction de journalisation
    const { logActivity } = await import("./activity-log")

    // Récupérer l'utilisateur depuis la base de données
    const user = await getUserByEmail(email)

    if (user && user.password === password) {
      // Stocker l'utilisateur dans localStorage
      localStorage.setItem("currentUser", JSON.stringify(user))
      localStorage.setItem("userRole", user.role)
      currentUser = user

      // Journaliser la connexion réussie
      await logActivity("LOGIN", "USER", user.id.toString(), `Connexion réussie pour ${email}`, true)

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

      // Ajouter l'utilisateur à la base de données
      const userId = await addUser(demoUser)
      const newUser = { ...demoUser, id: userId }
      localStorage.setItem("currentUser", JSON.stringify(newUser))
      localStorage.setItem("userRole", newUser.role)
      currentUser = newUser

      // Journaliser la création et la connexion
      await logActivity("REGISTER", "USER", userId.toString(), `Création automatique du compte démo`, true)
      await logActivity("LOGIN", "USER", userId.toString(), `Connexion réussie pour ${email}`, true)

      return true
    }

    // Utilisateurs de test pour la démonstration
    const testUsers = [
      {
        id: "1",
        firstName: "Patient",
        lastName: "Test",
        email: "patient@example.com",
        password: "password123",
        role: "patient",
        phoneNumber: "+228 11111111",
      },
      {
        id: "2",
        firstName: "Médecin",
        lastName: "Test",
        email: "medecin@example.com",
        password: "password123",
        role: "doctor",
        phoneNumber: "+228 22222222",
      },
      {
        id: "3",
        firstName: "Admin",
        lastName: "Test",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        phoneNumber: "+228 33333333",
      },
    ]

    // Vérifier si l'email et le mot de passe correspondent à un utilisateur de test
    const testUser = testUsers.find((u) => u.email === email && u.password === password)

    if (testUser) {
      // Vérifier si l'utilisateur de test existe déjà dans la base de données
      const existingUser = await getUserByEmail(testUser.email)

      if (!existingUser) {
        // Ajouter l'utilisateur de test à la base de données s'il n'existe pas
        await addUser(testUser)
        await logActivity("REGISTER", "USER", testUser.id, `Création automatique du compte de test`, true)
      }

      localStorage.setItem("currentUser", JSON.stringify(testUser))
      localStorage.setItem("userRole", testUser.role)
      currentUser = testUser

      // Journaliser la connexion réussie
      await logActivity("LOGIN", "USER", testUser.id, `Connexion réussie pour ${email}`, true)

      return true
    }

    // Journaliser la tentative de connexion échouée
    await logActivity(
      "LOGIN",
      "USER",
      undefined,
      `Tentative de connexion échouée pour ${email}`,
      false,
      "Identifiants invalides"
    )

    return false
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)

    // Importer la fonction de journalisation
    try {
      const { logActivity } = await import("./activity-log")
      await logActivity(
        "LOGIN",
        "USER",
        undefined,
        `Erreur lors de la connexion pour ${email}`,
        false,
        error instanceof Error ? error.message : "Erreur inconnue"
      )
    } catch (logError) {
      console.error("Erreur lors de la journalisation:", logError)
    }

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

      // Ajouter l'utilisateur de secours à la base de données
      try {
        await addUser(fallbackUser)
      } catch (addError) {
        console.error("Erreur lors de l'ajout de l'utilisateur de secours:", addError)
      }

      localStorage.setItem("currentUser", JSON.stringify(fallbackUser))
      localStorage.setItem("userRole", fallbackUser.role)
      currentUser = fallbackUser

      // Journaliser la connexion de secours
      try {
        const { logActivity } = await import("./activity-log")
        await logActivity(
          "LOGIN",
          "USER",
          fallbackUser.id.toString(),
          `Connexion de secours pour ${email}`,
          true,
          "Mode de secours activé"
        )
      } catch (logError) {
        console.error("Erreur lors de la journalisation:", logError)
      }

      return true
    }

    return false
  }
}

// Fonction d'inscription
export async function registerUser(userData: any): Promise<boolean> {
  try {
    // Importer la fonction de journalisation
    const { logActivity } = await import("./activity-log")

    // Vérifier si l'email existe déjà
    const existingUser = await getUserByEmail(userData.email)

    if (existingUser) {
      // Journaliser la tentative d'inscription échouée (email déjà utilisé)
      await logActivity(
        "REGISTER",
        "USER",
        undefined,
        `Tentative d'inscription échouée pour ${userData.email}`,
        false,
        "Email déjà utilisé"
      )
      return false
    }

    // S'assurer que le rôle est défini comme "patient" par défaut
    if (!userData.role) {
      userData.role = "patient"
    }

    // Créer un nouvel utilisateur dans la base de données
    const userId = await addUser(userData)

    // Connecter automatiquement l'utilisateur après l'inscription
    const newUser = { ...userData, id: userId }
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    localStorage.setItem("userRole", newUser.role)
    currentUser = newUser

    // Journaliser l'inscription réussie
    await logActivity(
      "REGISTER",
      "USER",
      userId.toString(),
      `Inscription réussie pour ${userData.email} avec le rôle ${userData.role}`,
      true
    )

    return true
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)

    // Journaliser l'erreur
    try {
      const { logActivity } = await import("./activity-log")
      await logActivity(
        "REGISTER",
        "USER",
        undefined,
        `Erreur lors de l'inscription pour ${userData.email}`,
        false,
        error instanceof Error ? error.message : "Erreur inconnue"
      )
    } catch (logError) {
      console.error("Erreur lors de la journalisation:", logError)
    }

    // Pour les besoins de démonstration, permettre une inscription de secours
    const fallbackUser = {
      id: Date.now(),
      ...userData,
      role: userData.role || "patient", // S'assurer que le rôle est défini
    }

    // Essayer d'ajouter l'utilisateur de secours à la base de données
    try {
      await addUser(fallbackUser)
    } catch (addError) {
      console.error("Erreur lors de l'ajout de l'utilisateur de secours:", addError)
    }

    localStorage.setItem("currentUser", JSON.stringify(fallbackUser))
    localStorage.setItem("userRole", fallbackUser.role)
    currentUser = fallbackUser

    // Journaliser l'inscription de secours
    try {
      const { logActivity } = await import("./activity-log")
      await logActivity(
        "REGISTER",
        "USER",
        fallbackUser.id.toString(),
        `Inscription de secours pour ${userData.email}`,
        true,
        "Mode de secours activé"
      )
    } catch (logError) {
      console.error("Erreur lors de la journalisation:", logError)
    }

    return true
  }
}

// Fonction de déconnexion
export async function logoutUser(): Promise<void> {
  try {
    // Récupérer les informations de l'utilisateur avant la déconnexion
    const user = getCurrentUser()

    // Supprimer les données de session
    localStorage.removeItem("currentUser")
    localStorage.removeItem("userRole")
    currentUser = null

    // Journaliser la déconnexion
    if (user) {
      try {
        const { logActivity } = await import("./activity-log")
        await logActivity(
          "LOGOUT",
          "USER",
          user.id.toString(),
          `Déconnexion réussie pour ${user.email}`,
          true
        )
      } catch (logError) {
        console.error("Erreur lors de la journalisation de la déconnexion:", logError)
      }
    }

    // Rediriger vers la page d'accueil
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error)

    // Forcer la déconnexion même en cas d'erreur
    localStorage.removeItem("currentUser")
    localStorage.removeItem("userRole")
    currentUser = null

    // Rediriger vers la page d'accueil
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
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
export function getUserRole(): UserRole | null {
  const user = getCurrentUser()
  return user ? user.role : null
}

// Vérifier si l'utilisateur est authentifié
export function isAuthenticated(): boolean {
  const user = getCurrentUser()

  // Vérifier que l'utilisateur existe et qu'il a au moins les propriétés essentielles
  if (!user) return false

  // Vérifier que l'utilisateur a au moins un email et un rôle
  return Boolean(user.email && user.role)
}

// Vérifier si l'utilisateur a un rôle spécifique
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser()
  return user ? user.role === role : false
}

// Vérifier si l'utilisateur a l'un des rôles spécifiés
export function hasAnyRole(roles: UserRole[]): boolean {
  const user = getCurrentUser()
  return user ? roles.includes(user.role as UserRole) : false
}

// Middleware pour protéger les routes
export function authMiddleware(allowedRoles: UserRole[] = []): boolean {
  const user = getCurrentUser()

  if (!user) {
    return false
  }

  if (allowedRoles.length === 0) {
    return true
  }

  return allowedRoles.includes(user.role as UserRole)
}
