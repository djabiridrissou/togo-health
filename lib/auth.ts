"use client"

import { getUserByEmail } from "./in-memory-store"
import type { User } from "@/types"

// State to hold current user information during the session
let currentUser: User | null = null

// Function to login a user
export async function loginUser(email: string, password: string): Promise<boolean> {
  try {
    // Get user from in-memory store
    const user = getUserByEmail(email)

    if (user && user.password === password) {
      // Store user in memory and in a cookie
      currentUser = user

      // In a client component, we can't use the cookies() API directly
      // So we'll store the user in memory and use localStorage as a fallback
      try {
        typeof window !== "undefined" && localStorage.setItem("currentUser", JSON.stringify(user))
      } catch (error) {
        console.warn("Failed to store user in localStorage", error)
      }

      return true
    }

    return false
  } catch (error) {
    console.error("Error during login:", error)
    return false
  }
}

// Function to register a new user
export async function registerUser(userData: Partial<User>): Promise<boolean> {
  try {
    // Check if user already exists
    const existingUser = getUserByEmail(userData.email || "")
    if (existingUser) {
      return false
    }

    // Add new user to in-memory store
    const { addUser } = await import("./in-memory-store")
    const newUser = addUser(userData as Omit<User, "id">)

    return !!newUser
  } catch (error) {
    console.error("Error during registration:", error)
    return false
  }
}

// Function to logout a user
export async function logoutUser(): Promise<void> {
  currentUser = null
  try {
    typeof window !== "undefined" && localStorage.removeItem("currentUser")
  } catch (error) {
    console.warn("Failed to remove user from localStorage", error)
  }
}

// Function to get the current user
export function getCurrentUser(): User | null {
  if (currentUser) {
    return currentUser
  }

  // Try to get user from localStorage as fallback
  try {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        currentUser = JSON.parse(storedUser)
        return currentUser
      }
    }
  } catch (error) {
    console.warn("Failed to get user from localStorage", error)
  }

  return null
}

// Function to get the current user's role
export function getUserRole(): string | null {
  const user = getCurrentUser()
  return user ? user.role : null
}

// Function to check if a user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

// Function to check if a user has a specific role
export function hasRole(role: string): boolean {
  const user = getCurrentUser()
  return user ? user.role === role : false
}

// Function to check if a user has any of the specified roles
export function hasAnyRole(roles: string[]): boolean {
  const user = getCurrentUser()
  return user ? roles.includes(user.role) : false
}

// Function to protect routes based on roles
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
