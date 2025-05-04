"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p>Non connecté</p>
        <Button asChild variant="outline">
          <a href="/login">Se connecter</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p>Connecté en tant que {session?.user?.name}</p>
      <p>Rôle: {session?.user?.role}</p>
      <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Se déconnecter
      </Button>
    </div>
  )
}
