"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, UserCog } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/types"

export default function ProfilePage() {
  const [userData, setUserData] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()
  const { updateUserProfile } = useAppContext()

  // Charger les données utilisateur
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setUserData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      })
    }
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Réinitialiser les champs
    const user = getCurrentUser()
    if (user) {
      setUserData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      })
    }
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError(null)
    setIsEditing(false)
  }

  const handleSubmit = async () => {
    setError(null)

    // Vérifier le mot de passe actuel
    const user = getCurrentUser()
    if (!user) {
      setError("Utilisateur non connecté")
      return
    }

    if (currentPassword && currentPassword !== user.password) {
      setError("Le mot de passe actuel est incorrect")
      return
    }

    // Vérifier si un nouveau mot de passe est fourni
    if (newPassword) {
      if (newPassword.length < 6) {
        setError("Le nouveau mot de passe doit contenir au moins 6 caractères")
        return
      }

      if (newPassword !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas")
        return
      }

      // Ajouter le nouveau mot de passe aux données à mettre à jour
      userData.password = newPassword
    }

    try {
      // Mettre à jour le profil
      await updateUserProfile(user.id, userData)

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      })

      setIsEditing(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setError("Une erreur s'est produite lors de la mise à jour du profil")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profil</h2>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <UserCog className="mr-2 h-4 w-4" />
            Modifier le profil
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Gérez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={userData.firstName}
                onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={userData.lastName}
                onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              value={userData.phoneNumber}
              onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Changer de mot de passe</h3>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>Enregistrer les modifications</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
