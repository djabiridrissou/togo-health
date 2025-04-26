"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { DropletIcon, MapPin, Calendar, AlertCircle, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { getCurrentUser } from "@/lib/auth"

export default function BloodDonationPage() {
  const [activeTab, setActiveTab] = useState("requests")
  const [showDonateDialog, setShowDonateDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [donationForm, setDonationForm] = useState({
    bloodType: "",
    lastDonation: "",
    location: "",
    date: "",
    time: "",
    healthCondition: "good",
    notes: "",
  })
  const [requestForm, setRequestForm] = useState({
    bloodType: "",
    quantity: "",
    urgency: "medium",
    hospital: "",
    patientType: "",
    reason: "",
    contactPerson: "",
    contactPhone: "",
  })
  const { toast } = useToast()
  const {
    getUserBloodRequests,
    getUserBloodDonations,
    addBloodDonation,
    updateBloodDonation,
    deleteBloodDonation,
    addBloodRequest,
    updateBloodRequest,
    deleteBloodRequest,
  } = useAppContext()

  // Récupérer toutes les demandes de sang actives
  const bloodDonationRequests = getUserBloodRequests()
    .filter((request) => request.status === "active")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Récupérer tous les dons de sang de l'utilisateur
  const myDonations = getUserBloodDonations().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Modifier la fonction handleDonateSubmit
  const handleDonateSubmit = () => {
    // Valider le formulaire
    if (!donationForm.bloodType || !donationForm.location || !donationForm.date || !donationForm.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour programmer un don de sang",
        variant: "destructive",
      })
      return
    }

    // Ajouter le nouveau don de sang
    addBloodDonation({
      date: donationForm.date,
      location: donationForm.location,
      bloodType: donationForm.bloodType,
      status: "scheduled",
      donorId: currentUser.id,
    })

    toast({
      title: "Don programmé",
      description: `Votre don de sang a été programmé pour le ${new Date(donationForm.date).toLocaleDateString("fr-FR")} à ${donationForm.time}`,
    })

    // Réinitialiser le formulaire et fermer la boîte de dialogue
    setDonationForm({
      bloodType: "",
      lastDonation: "",
      location: "",
      date: "",
      time: "",
      healthCondition: "good",
      notes: "",
    })
    setShowDonateDialog(false)
  }

  // Modifier la fonction handleRequestSubmit
  const handleRequestSubmit = () => {
    // Valider le formulaire
    if (
      !requestForm.bloodType ||
      !requestForm.quantity ||
      !requestForm.hospital ||
      !requestForm.contactPerson ||
      !requestForm.contactPhone
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande de sang",
        variant: "destructive",
      })
      return
    }

    // Ajouter la nouvelle demande de sang
    addBloodRequest({
      bloodType: requestForm.bloodType,
      hospital: requestForm.hospital,
      urgency: requestForm.urgency as "high" | "medium" | "low",
      date: new Date().toISOString().split("T")[0],
      quantity: requestForm.quantity,
      patientType: requestForm.patientType,
      reason: requestForm.reason,
      status: "active",
      contactPerson: requestForm.contactPerson,
      contactPhone: requestForm.contactPhone,
      requesterId: currentUser.id,
    })

    toast({
      title: "Demande soumise",
      description: `Votre demande de sang ${requestForm.bloodType} a été soumise avec succès`,
    })

    // Réinitialiser le formulaire et fermer la boîte de dialogue
    setRequestForm({
      bloodType: "",
      quantity: "",
      urgency: "medium",
      hospital: "",
      patientType: "",
      reason: "",
      contactPerson: "",
      contactPhone: "",
    })
    setShowRequestDialog(false)
  }

  // Modifier la fonction handleCancelDonation
  const handleCancelDonation = (id: string) => {
    updateBloodDonation(id, { status: "cancelled" })
    toast({
      title: "Don annulé",
      description: "Votre don de sang a été annulé",
    })
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Élevée"
      case "medium":
        return "Moyenne"
      case "low":
        return "Faible"
      default:
        return "Moyenne"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-rose-100 text-rose-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-amber-100 text-amber-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dons de sang</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRequestDialog(true)}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Demander du sang
          </Button>
          <Button onClick={() => setShowDonateDialog(true)}>
            <Heart className="h-4 w-4 mr-2" />
            Faire un don
          </Button>
        </div>
      </div>

      <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Demandes actives</TabsTrigger>
          <TabsTrigger value="myDonations">Mes dons</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {bloodDonationRequests.length > 0 ? (
            bloodDonationRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-rose-100 p-3 rounded-full">
                        <DropletIcon className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Groupe sanguin {request.bloodType}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(request.urgency)}`}>
                            Urgence {getUrgencyLabel(request.urgency)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{request.quantity} nécessaires</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {request.hospital}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            Demande du {new Date(request.date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>
                            <span className="font-medium">Patient:</span> {request.patientType}
                          </p>
                          <p>
                            <span className="font-medium">Raison:</span> {request.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Plus d'infos
                      </Button>
                      <Button size="sm" onClick={() => setShowDonateDialog(true)}>
                        Donner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-rose-50 p-3 rounded-full mb-4">
                  <DropletIcon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-medium text-lg">Aucune demande active</h3>
                <p className="text-muted-foreground mb-4">
                  Il n'y a pas de demandes de dons de sang actives pour le moment.
                </p>
                <Button variant="outline" onClick={() => setShowRequestDialog(true)}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Créer une demande
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="myDonations" className="space-y-4">
          {myDonations.length > 0 ? (
            myDonations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          donation.status === "completed" ? "bg-green-100" : "bg-blue-100"
                        }`}
                      >
                        <Heart
                          className={`h-6 w-6 ${donation.status === "completed" ? "text-green-600" : "text-blue-600"}`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">Don de sang {donation.bloodType}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              donation.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {donation.status === "completed" ? "Complété" : "Programmé"}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(donation.date).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {donation.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {donation.status === "scheduled" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            Annuler
                          </Button>
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        </>
                      )}
                      {donation.status === "completed" && (
                        <Button variant="outline" size="sm">
                          Certificat
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun don de sang</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore fait de don de sang.</p>
                <Button onClick={() => setShowDonateDialog(true)}>
                  <Heart className="h-4 w-4 mr-2" />
                  Faire un don
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Donate Dialog */}
      <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Faire un don de sang</DialogTitle>
            <DialogDescription>Planifiez votre prochain don de sang</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Groupe sanguin *</Label>
                <Select
                  value={donationForm.bloodType}
                  onValueChange={(value) => setDonationForm({ ...donationForm, bloodType: value })}
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
                <Label htmlFor="lastDonation">Dernier don</Label>
                <Input
                  id="lastDonation"
                  type="date"
                  value={donationForm.lastDonation}
                  onChange={(e) => setDonationForm({ ...donationForm, lastDonation: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Centre de don *</Label>
              <Select
                value={donationForm.location}
                onValueChange={(value) => setDonationForm({ ...donationForm, location: value })}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Sélectionnez un centre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centre-transfusion-lome">Centre de Transfusion Sanguine de Lomé</SelectItem>
                  <SelectItem value="hopital-universitaire-lome">Hôpital Universitaire de Lomé</SelectItem>
                  <SelectItem value="clinique-internationale">Clinique Internationale</SelectItem>
                  <SelectItem value="centre-medical-kara">Centre Médical de Kara</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={donationForm.date}
                  onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                <Select
                  value={donationForm.time}
                  onValueChange={(value) => setDonationForm({ ...donationForm, time: value })}
                >
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>État de santé actuel</Label>
              <RadioGroup
                value={donationForm.healthCondition}
                onValueChange={(value) => setDonationForm({ ...donationForm, healthCondition: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good">Bon</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="average" id="average" />
                  <Label htmlFor="average">Moyen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor" />
                  <Label htmlFor="poor">Mauvais</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={donationForm.notes}
                onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                placeholder="Informations supplémentaires"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleDonateSubmit}>Programmer le don</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Demander du sang</DialogTitle>
            <DialogDescription>Créez une demande de don de sang</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestBloodType">Groupe sanguin *</Label>
                <Select
                  value={requestForm.bloodType}
                  onValueChange={(value) => setRequestForm({ ...requestForm, bloodType: value })}
                >
                  <SelectTrigger id="requestBloodType">
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
                <Label htmlFor="quantity">Quantité *</Label>
                <Select
                  value={requestForm.quantity}
                  onValueChange={(value) => setRequestForm({ ...requestForm, quantity: value })}
                >
                  <SelectTrigger id="quantity">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 unité">1 unité</SelectItem>
                    <SelectItem value="2 unités">2 unités</SelectItem>
                    <SelectItem value="3 unités">3 unités</SelectItem>
                    <SelectItem value="4 unités">4 unités</SelectItem>
                    <SelectItem value="5 unités">5 unités</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Niveau d'urgence</Label>
              <RadioGroup
                value={requestForm.urgency}
                onValueChange={(value) => setRequestForm({ ...requestForm, urgency: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Faible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Moyenne</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">Élevée</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospital">Hôpital *</Label>
              <Select
                value={requestForm.hospital}
                onValueChange={(value) => setRequestForm({ ...requestForm, hospital: value })}
              >
                <SelectTrigger id="hospital">
                  <SelectValue placeholder="Sélectionnez un hôpital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hôpital Universitaire de Lomé">Hôpital Universitaire de Lomé</SelectItem>
                  <SelectItem value="Centre Médical de Lomé">Centre Médical de Lomé</SelectItem>
                  <SelectItem value="Clinique Internationale">Clinique Internationale</SelectItem>
                  <SelectItem value="Centre Médical de Kara">Centre Médical de Kara</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientType">Type de patient</Label>
                <Select
                  value={requestForm.patientType}
                  onValueChange={(value) => setRequestForm({ ...requestForm, patientType: value })}
                >
                  <SelectTrigger id="patientType">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adulte">Adulte</SelectItem>
                    <SelectItem value="Enfant">Enfant</SelectItem>
                    <SelectItem value="Nouveau-né">Nouveau-né</SelectItem>
                    <SelectItem value="Femme enceinte">Femme enceinte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Raison de la demande</Label>
              <Textarea
                id="reason"
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="Raison de la demande de sang"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Personne à contacter *</Label>
                <Input
                  id="contactPerson"
                  value={requestForm.contactPerson}
                  onChange={(e) => setRequestForm({ ...requestForm, contactPerson: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Téléphone *</Label>
                <Input
                  id="contactPhone"
                  value={requestForm.contactPhone}
                  onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                  placeholder="+228 XX XX XX XX"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestSubmit}>Soumettre la demande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
