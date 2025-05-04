"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, User, Shield, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { getUserRole, getCurrentUser } from "@/lib/auth"
import { updatePatientProfile, updatePatientPin } from "@/lib/actions/patient-actions"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isLoading, setIsLoading] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const { toast } = useToast()
  const { patients, updatePatient } = useAppContext()
  const userRole = getUserRole()
  const currentUser = getCurrentUser()
  
  // État pour les formulaires
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })
  
  const [medicalInfo, setMedicalInfo] = useState({
    gender: "",
    bloodType: "",
    allergies: "",
    chronicConditions: "",
    address: "",
    emergencyContact: "",
  })
  
  const [pinInfo, setPinInfo] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  })
  
  // Charger les données de l'utilisateur
  useEffect(() => {
    if (currentUser) {
      setPersonalInfo({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
      })
      
      // Trouver les informations médicales du patient
      const patient = patients.find(p => p.id === currentUser.id || p.email === currentUser.email)
      
      if (patient) {
        setMedicalInfo({
          gender: patient.gender || "",
          bloodType: patient.bloodType || "",
          allergies: Array.isArray(patient.allergies) ? patient.allergies.join(", ") : patient.allergies || "",
          chronicConditions: Array.isArray(patient.chronicConditions) 
            ? patient.chronicConditions.join(", ") 
            : patient.chronicConditions || "",
          address: patient.address || "",
          emergencyContact: patient.emergencyContact || "",
        })
        
        if (patient.dateOfBirth) {
          setDateOfBirth(new Date(patient.dateOfBirth))
        }
      }
    }
  }, [currentUser, patients])
  
  // Gérer la soumission du formulaire d'informations personnelles
  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (currentUser) {
        const success = await updateUser(currentUser.id, {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phoneNumber: personalInfo.phoneNumber,
        })
        
        if (success) {
          toast({
            title: "Profil mis à jour",
            description: "Vos informations personnelles ont été mises à jour avec succès.",
          })
        } else {
          toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors de la mise à jour de votre profil.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de votre profil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Gérer la soumission du formulaire d'informations médicales
  const handleMedicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (currentUser) {
        // Créer un objet FormData pour l'action serveur
        const formData = new FormData()
        formData.append("gender", medicalInfo.gender)
        formData.append("bloodType", medicalInfo.bloodType)
        formData.append("allergies", medicalInfo.allergies)
        formData.append("chronicConditions", medicalInfo.chronicConditions)
        formData.append("address", medicalInfo.address)
        formData.append("emergencyContact", medicalInfo.emergencyContact)
        
        if (dateOfBirth) {
          formData.append("dateOfBirth", dateOfBirth.toISOString())
        }
        
        const result = await updatePatientProfile(formData)
        
        if (result.success) {
          toast({
            title: "Profil médical mis à jour",
            description: "Vos informations médicales ont été mises à jour avec succès.",
          })
          
          // Mettre à jour localement
          if (currentUser.id) {
            updatePatient(currentUser.id, {
              bloodType: medicalInfo.bloodType,
              allergies: medicalInfo.allergies.split(",").map(a => a.trim()),
              chronicConditions: medicalInfo.chronicConditions.split(",").map(c => c.trim()),
            })
          }
        } else {
          toast({
            title: "Erreur",
            description: result.message || "Une erreur s'est produite lors de la mise à jour de votre profil médical.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil médical:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de votre profil médical.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Gérer la soumission du formulaire de code PIN
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (pinInfo.newPin !== pinInfo.confirmPin) {
        toast({
          title: "Erreur",
          description: "Le nouveau code PIN et sa confirmation ne correspondent pas.",
          variant: "destructive",
        })
        return
      }
      
      // Créer un objet FormData pour l'action serveur
      const formData = new FormData()
      formData.append("currentPin", pinInfo.currentPin)
      formData.append("newPin", pinInfo.newPin)
      formData.append("confirmPin", pinInfo.confirmPin)
      
      const result = await updatePatientPin(formData)
      
      if (result.success) {
        toast({
          title: "Code PIN mis à jour",
          description: "Votre code PIN a été mis à jour avec succès.",
        })
        
        // Réinitialiser le formulaire
        setPinInfo({
          currentPin: "",
          newPin: "",
          confirmPin: "",
        })
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur s'est produite lors de la mise à jour de votre code PIN.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du code PIN:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de votre code PIN.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profil</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations personnelles
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Informations médicales
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <form onSubmit={handlePersonalSubmit}>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    L'adresse email ne peut pas être modifiée
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                  <Input
                    id="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="medical" className="space-y-4">
          <Card>
            <form onSubmit={handleMedicalSubmit}>
              <CardHeader>
                <CardTitle>Informations médicales</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations médicales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfBirth ? format(dateOfBirth, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          initialFocus
                          locale={fr}
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre</Label>
                    <Select
                      value={medicalInfo.gender}
                      onValueChange={(value) => setMedicalInfo({ ...medicalInfo, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                        <SelectItem value="prefer-not-to-say">Préfère ne pas préciser</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Groupe sanguin</Label>
                  <Select
                    value={medicalInfo.bloodType}
                    onValueChange={(value) => setMedicalInfo({ ...medicalInfo, bloodType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un groupe sanguin" />
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
                      <SelectItem value="unknown">Je ne sais pas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="Listez vos allergies, séparées par des virgules"
                    value={medicalInfo.allergies}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, allergies: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Conditions chroniques</Label>
                  <Textarea
                    id="chronicConditions"
                    placeholder="Listez vos conditions chroniques, séparées par des virgules"
                    value={medicalInfo.chronicConditions}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, chronicConditions: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    placeholder="Votre adresse complète"
                    value={medicalInfo.address}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, address: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Nom et numéro de téléphone"
                    value={medicalInfo.emergencyContact}
                    onChange={(e) => setMedicalInfo({ ...medicalInfo, emergencyContact: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <form onSubmit={handlePinSubmit}>
              <CardHeader>
                <CardTitle>Code PIN médical</CardTitle>
                <CardDescription>
                  Mettez à jour votre code PIN pour accéder à vos dossiers médicaux
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPin">Code PIN actuel</Label>
                  <Input
                    id="currentPin"
                    type="password"
                    value={pinInfo.currentPin}
                    onChange={(e) => setPinInfo({ ...pinInfo, currentPin: e.target.value })}
                    maxLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPin">Nouveau code PIN</Label>
                  <Input
                    id="newPin"
                    type="password"
                    value={pinInfo.newPin}
                    onChange={(e) => setPinInfo({ ...pinInfo, newPin: e.target.value })}
                    maxLength={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Votre code PIN doit contenir entre 4 et 6 chiffres
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirmer le nouveau code PIN</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    value={pinInfo.confirmPin}
                    onChange={(e) => setPinInfo({ ...pinInfo, confirmPin: e.target.value })}
                    maxLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Mise à jour..." : "Mettre à jour le code PIN"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
