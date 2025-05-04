"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"

// Get the current user from the session
export async function getCurrentUser() {
  try {
    // Get the session token from cookies
    const sessionToken = cookies().get("next-auth.session-token")?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Find the session
    const session = await db.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
      },
    })
    
    if (!session || new Date(session.expires) < new Date()) {
      return null
    }
    
    return session.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
