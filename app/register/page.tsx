"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, User, UserPlus, Stethoscope, Building, ChevronDown, Check } from "lucide-react"
import { registerUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("patient")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // État initial pour chaque type d'utilisateur
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    birthDate: "",
    gender: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    chronicConditions: "",
  })

  const [assistantData, setAssistantData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    specialization: "",
    experience: "",
    license: "",
    supervisorDoctor: "",
  })

  const [doctorData, setDoctorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    specialization: "",
    experience: "",
    license: "",
    consultationFee: "",
    availability: "",
    education: "",
  })

  const [hospitalData, setHospitalData] = useState({
    facilityName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    contactPerson: "",
    services: "",
    facilities: "",
    regNumber: "",
  })

  // Gestionnaires pour chaque type de formulaire
  const handlePatientChange = (e: any) => {
    const { name, value } = e.target
    setPatientData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePatientSelectChange = (name: any, value: any) => {
    setPatientData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAssistantChange = (e: any) => {
    const { name, value } = e.target
    setAssistantData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAssistantSelectChange = (name: any, value: any) => {
    setAssistantData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDoctorChange = (e: any) => {
    const { name, value } = e.target
    setDoctorData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDoctorSelectChange = (name: any, value: any) => {
    setDoctorData((prev) => ({ ...prev, [name]: value }))
  }

  const handleHospitalChange = (e: any) => {
    const { name, value } = e.target
    setHospitalData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    let formData
    let passwordsMatch = false

    // Sélectionner les données en fonction du rôle
    switch (selectedRole) {
      case "patient":
        formData = { ...patientData, role: "patient" }
        passwordsMatch = patientData.password === patientData.confirmPassword
        break
      case "assistant":
        formData = { ...assistantData, role: "assistant" }
        passwordsMatch = assistantData.password === assistantData.confirmPassword
        break
      case "doctor":
        formData = { ...doctorData, role: "doctor" }
        passwordsMatch = doctorData.password === doctorData.confirmPassword
        break
      case "hospital":
        formData = { ...hospitalData, role: "hospital" }
        passwordsMatch = hospitalData.password === hospitalData.confirmPassword
        break
      default:
        formData = patientData
        passwordsMatch = patientData.password === patientData.confirmPassword
    }

    if (!passwordsMatch) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const success = await registerUser(formData)

      if (success) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
        })
        router.push("/login")
      } else {
        toast({
          title: "Échec de l'inscription",
          description: "Une erreur s'est produite lors de l'inscription.",
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

  // Les icônes pour chaque rôle
  const roleIcons = {
    patient: <User className="h-5 w-5" />,
    assistant: <UserPlus className="h-5 w-5" />,
    doctor: <Stethoscope className="h-5 w-5" />,
    hospital: <Building className="h-5 w-5" />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 p-4 py-10">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <Heart className="h-10 w-10 text-rose-600" />
        <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">SantéTogo</span>
      </div>

      <Card className="w-full max-w-3xl shadow-lg border-blue-100">
        <CardHeader className="space-y-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
          <CardDescription className="text-center text-blue-50">
            Rejoignez la plateforme SantéTogo et accédez à nos services de santé en ligne
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="patient" className="w-full" onValueChange={setSelectedRole}>
          <div className="px-6 pt-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="patient" className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Patient</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Assistant</span>
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center justify-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Médecin</span>
              </TabsTrigger>
              <TabsTrigger value="hospital" className="flex items-center justify-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Hôpital</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Formulaire Patient */}
            <TabsContent value="patient">
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={patientData.firstName} 
                      onChange={handlePatientChange}
                      placeholder="Votre prénom" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={patientData.lastName} 
                      onChange={handlePatientChange}
                      placeholder="Votre nom" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={patientData.email}
                      onChange={handlePatientChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+228 XX XX XX XX"
                      value={patientData.phoneNumber}
                      onChange={handlePatientChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={patientData.birthDate}
                      onChange={handlePatientChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre</Label>
                    <Select name="gender" onValueChange={(value) => handlePatientSelectChange("gender", value)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Sélectionnez votre genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Votre adresse complète"
                    value={patientData.address}
                    onChange={handlePatientChange}
                    required
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="medical-info">
                    <AccordionTrigger className="text-blue-600">Informations médicales (optionnel)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                          <Input
                            id="emergencyContact"
                            name="emergencyContact"
                            placeholder="Nom et numéro de téléphone"
                            value={patientData.emergencyContact}
                            onChange={handlePatientChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <Input
                            id="allergies"
                            name="allergies"
                            placeholder="Listez vos allergies connues"
                            value={patientData.allergies}
                            onChange={handlePatientChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chronicConditions">Conditions chroniques</Label>
                          <Input
                            id="chronicConditions"
                            name="chronicConditions"
                            placeholder="Conditions médicales chroniques"
                            value={patientData.chronicConditions}
                            onChange={handlePatientChange}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={patientData.password}
                      onChange={handlePatientChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={patientData.confirmPassword}
                      onChange={handlePatientChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Formulaire Assistant */}
            <TabsContent value="assistant">
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={assistantData.firstName} 
                      onChange={handleAssistantChange}
                      placeholder="Votre prénom" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={assistantData.lastName} 
                      onChange={handleAssistantChange}
                      placeholder="Votre nom" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={assistantData.email}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+228 XX XX XX XX"
                      value={assistantData.phoneNumber}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Spécialisation</Label>
                    <Select name="specialization" onValueChange={(value) => handleAssistantSelectChange("specialization", value)}>
                      <SelectTrigger id="specialization">
                        <SelectValue placeholder="Sélectionnez votre spécialisation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Soins généraux</SelectItem>
                        <SelectItem value="pediatric">Pédiatrie</SelectItem>
                        <SelectItem value="geriatric">Gériatrie</SelectItem>
                        <SelectItem value="emergency">Urgences</SelectItem>
                        <SelectItem value="cardiology">Cardiologie</SelectItem>
                        <SelectItem value="orthopaedics">Orthopédie</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Années d'expérience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      placeholder="Nombre d'années"
                      value={assistantData.experience}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license">Numéro de licence</Label>
                    <Input
                      id="license"
                      name="license"
                      placeholder="Numéro de licence professionnelle"
                      value={assistantData.license}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supervisorDoctor">Médecin superviseur</Label>
                    <Input
                      id="supervisorDoctor"
                      name="supervisorDoctor"
                      placeholder="Nom du médecin superviseur"
                      value={assistantData.supervisorDoctor}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={assistantData.password}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={assistantData.confirmPassword}
                      onChange={handleAssistantChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Formulaire Médecin */}
            <TabsContent value="doctor">
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      value={doctorData.firstName} 
                      onChange={handleDoctorChange}
                      placeholder="Votre prénom" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      value={doctorData.lastName} 
                      onChange={handleDoctorChange}
                      placeholder="Votre nom" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={doctorData.email}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+228 XX XX XX XX"
                      value={doctorData.phoneNumber}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Spécialité</Label>
                    <Select name="specialization" onValueChange={(value) => handleDoctorSelectChange("specialization", value)}>
                      <SelectTrigger id="specialization">
                        <SelectValue placeholder="Sélectionnez votre spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Médecine générale</SelectItem>
                        <SelectItem value="pediatrics">Pédiatrie</SelectItem>
                        <SelectItem value="cardiology">Cardiologie</SelectItem>
                        <SelectItem value="neurology">Neurologie</SelectItem>
                        <SelectItem value="dermatology">Dermatologie</SelectItem>
                        <SelectItem value="orthopedics">Orthopédie</SelectItem>
                        <SelectItem value="gynecology">Gynécologie</SelectItem>
                        <SelectItem value="dentistry">Dentisterie</SelectItem>
                        <SelectItem value="ophthalmology">Ophtalmologie</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">Numéro de licence</Label>
                    <Input
                      id="license"
                      name="license"
                      placeholder="Numéro de licence médicale"
                      value={doctorData.license}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Années d'expérience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      placeholder="Nombre d'années"
                      value={doctorData.experience}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">Tarif de consultation (FCFA)</Label>
                    <Input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      placeholder="Tarif en FCFA"
                      value={doctorData.consultationFee}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="additional-info">
                    <AccordionTrigger className="text-blue-600">Informations supplémentaires</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="education">Formation et diplômes</Label>
                          <Input
                            id="education"
                            name="education"
                            placeholder="Vos diplômes et parcours académique"
                            value={doctorData.education}
                            onChange={handleDoctorChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="availability">Disponibilité</Label>
                          <Input
                            id="availability"
                            name="availability"
                            placeholder="Ex: Lundi-Vendredi, 9h-17h"
                            value={doctorData.availability}
                            onChange={handleDoctorChange}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={doctorData.password}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={doctorData.confirmPassword}
                      onChange={handleDoctorChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Formulaire Hôpital */}
            <TabsContent value="hospital">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="facilityName">Nom de l'établissement</Label>
                  <Input 
                    id="facilityName" 
                    name="facilityName" 
                    value={hospitalData.facilityName} 
                    onChange={handleHospitalChange}
                    placeholder="Nom de votre établissement" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="exemple@hopital.com"
                      value={hospitalData.email}
                      onChange={handleHospitalChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+228 XX XX XX XX"
                      value={hospitalData.phoneNumber}
                      onChange={handleHospitalChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Adresse de l'établissement"
                    value={hospitalData.address}
                    onChange={handleHospitalChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Personne à contacter</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      placeholder="Nom et fonction"
                      value={hospitalData.contactPerson}
                      onChange={handleHospitalChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regNumber">Numéro d'enregistrement</Label>
                    <Input
                      id="regNumber"
                      name="regNumber"
                      placeholder="Numéro d'enregistrement officiel"
                      value={hospitalData.regNumber}
                      onChange={handleHospitalChange}
                      required
                    />
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="facility-info">
                    <AccordionTrigger className="text-blue-600">Informations sur l'établissement</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="services">Services offerts</Label>
                          <Input
                            id="services"
                            name="services"
                            placeholder="Liste des services médicaux proposés"
                            value={hospitalData.services}
                            onChange={handleHospitalChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facilities">Équipements et infrastructures</Label>
                          <Input
                            id="facilities"
                            name="facilities"
                            placeholder="Équipements spécialisés, nombre de lits, etc."
                            value={hospitalData.facilities}
                            onChange={handleHospitalChange}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={hospitalData.password}
                      onChange={handleHospitalChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={hospitalData.confirmPassword}
                      onChange={handleHospitalChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <CardFooter className="flex flex-col pt-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    S'inscrire comme {selectedRole === "patient" ? "patient" : selectedRole === "assistant" ? "assistant médical" : selectedRole === "doctor" ? "médecin" : "établissement de santé"}
                  </span>
                )}
              </Button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Vous avez déjà un compte?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Tabs>
      </Card>

      <p className="mt-8 text-center text-xs text-gray-500">
        En vous inscrivant, vous acceptez les conditions d'utilisation et la politique de confidentialité de SantéTogo.
      </p>
    </div>
  )
}