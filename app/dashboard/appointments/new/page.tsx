"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin, User, Video, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default function NewAppointmentPage() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [appointmentType, setAppointmentType] = useState<string>("")
  const [specialty, setSpecialty] = useState<string>("")
  const [doctor, setDoctor] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [mode, setMode] = useState<string>("in-person")
  const [location, setLocation] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { toast } = useToast()
  const { addAppointment } = useAppContext()

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleNext = () => {
    if (step === 1 && !appointmentType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de rendez-vous",
      })
      return
    }

    if (step === 2 && (!specialty || !doctor)) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une spécialité et un médecin",
      })
      return
    }

    if (step === 3 && (!date || !time)) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure",
      })
      return
    }

    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleSubmit = () => {
    if (mode === "in-person" && !location) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un lieu pour votre rendez-vous",
      })
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour prendre un rendez-vous",
      })
      return
    }

    // Récupérer les informations du médecin sélectionné
    const selectedDoctor = doctors[specialty as keyof typeof doctors]?.find((d) => d.value === doctor)
    const selectedLocation = locations.find((loc) => loc.value === location)

    // Créer le nouveau rendez-vous
    addAppointment({
      doctor: selectedDoctor?.label || "",
      specialty: specialties.find((s) => s.value === specialty)?.label || "",
      date: date ? date.toISOString().split("T")[0] : "",
      time: time,
      type: appointmentType === "consultation" ? "Consultation générale" : "Consultation spécialisée",
      location: selectedLocation?.label || "",
      mode: mode as "in-person" | "virtual",
      notes: reason,
      status: "scheduled",
      patientId: currentUser.id,
    })

    toast({
      title: "Rendez-vous créé",
      description: "Votre rendez-vous a été créé avec succès",
    })

    router.push("/dashboard/appointments")
  }

  const specialties = [
    { value: "general", label: "Médecine générale" },
    { value: "cardiology", label: "Cardiologie" },
    { value: "dermatology", label: "Dermatologie" },
    { value: "gynecology", label: "Gynécologie" },
    { value: "pediatrics", label: "Pédiatrie" },
    { value: "ophthalmology", label: "Ophtalmologie" },
    { value: "dentistry", label: "Dentisterie" },
  ]

  const doctors = {
    general: [
      { value: "dr-mensah", label: "Dr. Kofi Mensah" },
      { value: "dr-addo", label: "Dr. Kwame Addo" },
    ],
    cardiology: [
      { value: "dr-diallo", label: "Dr. Ama Diallo" },
      { value: "dr-toure", label: "Dr. Ibrahim Touré" },
    ],
    dermatology: [
      { value: "dr-koffi", label: "Dr. Emmanuel Koffi" },
      { value: "dr-balde", label: "Dr. Fatou Baldé" },
    ],
    gynecology: [
      { value: "dr-keita", label: "Dr. Aminata Keita" },
      { value: "dr-traore", label: "Dr. Mariam Traoré" },
    ],
    pediatrics: [
      { value: "dr-sow", label: "Dr. Mamadou Sow" },
      { value: "dr-diop", label: "Dr. Aïcha Diop" },
    ],
    ophthalmology: [
      { value: "dr-barry", label: "Dr. Ousmane Barry" },
      { value: "dr-camara", label: "Dr. Fatoumata Camara" },
    ],
    dentistry: [
      { value: "dr-conde", label: "Dr. Sékou Condé" },
      { value: "dr-sylla", label: "Dr. Mariama Sylla" },
    ],
  }

  const locations = [
    { value: "centre-medical-lome", label: "Centre Médical de Lomé" },
    { value: "hopital-universitaire-lome", label: "Hôpital Universitaire de Lomé" },
    { value: "clinique-internationale", label: "Clinique Internationale" },
    { value: "centre-sante-kara", label: "Centre de Santé de Kara" },
  ]

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/appointments" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Nouveau rendez-vous</h2>
      </div>

      <div className="flex justify-between mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            1
          </div>
          <span className={step >= 1 ? "font-medium" : "text-gray-500"}>Type</span>
        </div>
        <div className="h-0.5 flex-1 bg-gray-200 self-center mx-2">
          <div className={`h-full bg-blue-600 ${step >= 2 ? "w-full" : "w-0"}`}></div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
          <span className={step >= 2 ? "font-medium" : "text-gray-500"}>Médecin</span>
        </div>
        <div className="h-0.5 flex-1 bg-gray-200 self-center mx-2">
          <div className={`h-full bg-blue-600 ${step >= 3 ? "w-full" : "w-0"}`}></div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            3
          </div>
          <span className={step >= 3 ? "font-medium" : "text-gray-500"}>Date & Heure</span>
        </div>
        <div className="h-0.5 flex-1 bg-gray-200 self-center mx-2">
          <div className={`h-full bg-blue-600 ${step >= 4 ? "w-full" : "w-0"}`}></div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            4
          </div>
          <span className={step >= 4 ? "font-medium" : "text-gray-500"}>Détails</span>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Type de rendez-vous</CardTitle>
            <CardDescription>Sélectionnez le type de rendez-vous que vous souhaitez prendre</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={appointmentType}
              onValueChange={setAppointmentType}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="consultation" id="consultation" className="peer sr-only" />
                <Label
                  htmlFor="consultation"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                >
                  <User className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Consultation générale</p>
                    <p className="text-sm text-muted-foreground">Consultez un médecin pour un bilan de santé général</p>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="specialist" id="specialist" className="peer sr-only" />
                <Label
                  htmlFor="specialist"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                >
                  <User className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Consultation spécialisée</p>
                    <p className="text-sm text-muted-foreground">
                      Consultez un spécialiste pour un suivi médical spécifique
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext}>Suivant</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisir un médecin</CardTitle>
            <CardDescription>Sélectionnez la spécialité et le médecin pour votre rendez-vous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Spécialité</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Sélectionnez une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {specialty && (
              <div className="space-y-2">
                <Label htmlFor="doctor">Médecin</Label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Sélectionnez un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors[specialty as keyof typeof doctors]?.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Retour
            </Button>
            <Button onClick={handleNext}>Suivant</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Date et heure</CardTitle>
            <CardDescription>Choisissez la date et l'heure de votre rendez-vous</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionnez une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {date && (
              <div className="space-y-2">
                <Label>Heure</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={time === slot ? "default" : "outline"}
                      className={time === slot ? "bg-blue-600" : ""}
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Retour
            </Button>
            <Button onClick={handleNext}>Suivant</Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Détails du rendez-vous</CardTitle>
            <CardDescription>Complétez les détails de votre rendez-vous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mode">Mode de consultation</Label>
              <RadioGroup value={mode} onValueChange={setMode} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="in-person" id="in-person" />
                  <Label htmlFor="in-person" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    En personne
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="virtual" id="virtual" />
                  <Label htmlFor="virtual" className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    Téléconsultation
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {mode === "in-person" && (
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Sélectionnez un lieu" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Motif de la consultation</Label>
              <Textarea
                id="reason"
                placeholder="Décrivez brièvement la raison de votre rendez-vous"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md space-y-2 mt-6">
              <h3 className="font-medium">Récapitulatif</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>
                    {doctors[specialty as keyof typeof doctors]?.find((d) => d.value === doctor)?.label || ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span>{date ? format(date, "PPP", { locale: fr }) : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{time}</span>
                </div>
                {mode === "in-person" && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>{locations.find((loc) => loc.value === location)?.label || ""}</span>
                  </div>
                )}
                {mode === "virtual" && (
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span>Téléconsultation</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Retour
            </Button>
            <Button onClick={handleSubmit}>Confirmer le rendez-vous</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
