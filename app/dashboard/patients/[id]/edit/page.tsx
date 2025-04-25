"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { authMiddleware, getCurrentUser } from "@/lib/auth"
import type { Patient } from "@/types"

export default function EditPatientPage() {
  const params = useParams()
  const patientId = Number(params.id)
  const router = useRouter()
  const { toast } = useToast()
  const { getPatientById, getUserById, updatePatient } = useAppContext()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: [] as string[],
    chronicConditions: [] as string[],
  })
  const [newAllergy, setNewAllergy] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [patientPassword, setPatientPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Vérifier l'accès et rediriger si nécessaire
  useEffect(() => {
    if (!authMiddleware(["admin", "doctor", "secretary"])) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [router, toast])

  // Charger les données du patient
  useEffect(() => {
    const loadPatient = () => {
      const patientData = getPatientById(patientId)
      if (patientData) {
        setPatient(patientData)
        setPatientData({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phoneNumber: patientData.phoneNumber,
          bloodType: patientData.bloodType || "",
          height: patientData.height || "",
          weight: patientData.weight || "",
          allergies: patientData.allergies || [],
          chronicConditions: patientData.chronicConditions || [],
        })
      } else {
        toast({
          title: "Erreur",
          description: "Patient non trouvé",
          variant: "destructive",
        })
        router.push("/dashboard/patients")
      }
    }

    loadPatient()
  }, [patientId, getPatientById, router, toast])

  const handleAddAllergy = () => {
    if (newAllergy && !patientData.allergies.includes(newAllergy)) {
      setPatientData({
        ...patientData,
        allergies: [...patientData.allergies, newAllergy],
      })
      setNewAllergy("")
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    setPatientData({
      ...patientData,
      allergies: patientData.allergies.filter((a) => a !== allergy),
    })
  }

  const handleAddCondition = () => {
    if (newCondition && !patientData.chronicConditions.includes(newCondition)) {
      setPatientData({
        ...patientData,
        chronicConditions: [...patientData.chronicConditions, newCondition],
      })
      setNewCondition("")
    }
  }

  const handleRemoveCondition = (condition: string) => {
    setPatientData({
      ...patientData,
      chronicConditions: patientData.chronicConditions.filter((c) => c !== condition),
    })
  }

  const handleSubmit = () => {
    setError(null)

    // Vérifier si c'est le patient lui-même qui fait la mise à jour
    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive",
      })
      return
    }

    if (currentUser.role === "patient" && currentUser.id === patientId) {
      // Le patient peut mettre à jour ses propres informations sans mot de passe supplémentaire
      saveChanges()
    } else {
      // Pour les docteurs/secrétaires, demander le mot de passe du patient
      setShowPasswordDialog(true)
    }
  }

  const validatePassword = () => {
    setError(null)

    if (!patientPassword) {
      setError("Veuillez entrer le mot de passe du patient")
      return
    }

    // Récupérer l'utilisateur correspondant au patient
    const user = getUserById(patientId)
    if (!user) {
      setError("Utilisateur introuvable")
      return
    }

    // Vérifier le mot de passe
    if (user.password !== patientPassword) {
      setError("Le mot de passe est incorrect")
      return
    }

    // Mot de passe correct, sauvegarder les modifications
    setShowPasswordDialog(false)
    saveChanges()
  }

  const saveChanges = async () => {
    try {
      // Mettre à jour le patient
      const success = await updatePatient(patientId, patientData)

      if (success) {
        toast({
          title: "Patient mis à jour",
          description: "Les informations du patient ont été mises à jour avec succès",
        })
        router.push(`/dashboard/patients/${patientId}`)
      } else {
        setError("Une erreur s'est produite lors de la mise à jour du patient")
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la mise à jour du patient")
    }
  }

  if (!patient) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href={`/dashboard/patients/${patientId}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Modifier le patient</h2>
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
          <CardDescription>Modifiez les informations personnelles du patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={patientData.firstName}
                onChange={(e) => setPatientData({ ...patientData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={patientData.lastName}
                onChange={(e) => setPatientData({ ...patientData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={patientData.email}
              onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              value={patientData.phoneNumber}
              onChange={(e) => setPatientData({ ...patientData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Groupe sanguin</Label>
              <Select
                value={patientData.bloodType}
                onValueChange={(value) => setPatientData({ ...patientData, bloodType: value })}
              >
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Taille</Label>
              <Input
                id="height"
                value={patientData.height}
                onChange={(e) => setPatientData({ ...patientData, height: e.target.value })}
                placeholder="ex: 175 cm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Poids</Label>
              <Input
                id="weight"
                value={patientData.weight}
                onChange={(e) => setPatientData({ ...patientData, weight: e.target.value })}
                placeholder="ex: 70 kg"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="allergies">Allergies</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="newAllergy"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Ajouter une allergie"
                  className="w-48"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddAllergy}>
                  Ajouter
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {patientData.allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune allergie enregistrée</p>
              ) : (
                patientData.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm">
                    {allergy}
                    <button
                      type="button"
                      className="ml-2 text-red-800 hover:text-red-900"
                      onClick={() => handleRemoveAllergy(allergy)}
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="conditions">Conditions chroniques</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="newCondition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Ajouter une condition"
                  className="w-48"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCondition}>
                  Ajouter
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {patientData.chronicConditions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune condition chronique enregistrée</p>
              ) : (
                patientData.chronicConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-sm"
                  >
                    {condition}
                    <button
                      type="button"
                      className="ml-2 text-amber-800 hover:text-amber-900"
                      onClick={() => handleRemoveCondition(condition)}
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/dashboard/patients/${patientId}`)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer les modifications</Button>
        </CardFooter>
      </Card>

      {/* Dialogue de mot de passe */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmation requise</DialogTitle>
            <DialogDescription>
              Pour modifier les informations du patient, veuillez entrer son mot de passe pour confirmer son
              consentement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patientPassword">Mot de passe du patient</Label>
              <Input
                id="patientPassword"
                type="password"
                value={patientPassword}
                onChange={(e) => setPatientPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Annuler
            </Button>
            <Button onClick={validatePassword}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
