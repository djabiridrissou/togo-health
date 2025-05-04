"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft } from "lucide-react"
import { loginUser, isAuthenticated } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  const { toast } = useToast()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await loginUser(email, password)

      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à votre compte",
        })
        router.push(callbackUrl)
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour se connecter rapidement avec un compte de démonstration
  const handleDemoLogin = async (role: string) => {
    setIsLoading(true)
    try {
      let demoEmail = "patient@example.com"
      const demoPassword = "password123"

      switch (role) {
        case "patient":
          demoEmail = "patient@example.com"
          break
        case "doctor":
          demoEmail = "medecin@example.com"
          break
        case "admin":
          demoEmail = "admin@example.com"
          break
      }

      const success = await loginUser(demoEmail, demoPassword)
      if (success) {
        toast({
          title: `Connexion en tant que ${role} réussie`,
          description: `Vous êtes connecté avec un compte de démonstration (${role}).`,
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Retour à l'accueil
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <Heart className="h-8 w-8 text-rose-500" />
        <span className="font-bold text-2xl">SantéTogo</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">Entrez vos identifiants pour accéder à votre compte</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Connexion rapide (Démo)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="outline" onClick={() => handleDemoLogin("patient")} disabled={isLoading}>
                  Patient
                </Button>
                <Button type="button" variant="outline" onClick={() => handleDemoLogin("doctor")} disabled={isLoading}>
                  Médecin
                </Button>
                <Button type="button" variant="outline" onClick={() => handleDemoLogin("admin")} disabled={isLoading}>
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Vous n'avez pas de compte?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                S'inscrire
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
