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
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, FileText, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { getCurrentUser } from "@/lib/auth"

export default function MedicationsPage() {
  const [activeTab, setActiveTab] = useState("current")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    withFood: false,
    notes: "",
  })
  const { toast } = useToast()
  const { getUserMedications, addMedication, updateMedication, deleteMedication } = useAppContext()

  // Récupérer tous les médicaments de l'utilisateur
  const allMedications = getUserMedications()

  // Filtrer les médicaments actifs et terminés
  const currentMedications = allMedications
    .filter((medication) => medication.status === "active")
    .map((medication) => {
      // Calculer les jours restants
      const endDate = new Date(medication.endDate)
      const today = new Date()
      const remainingDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...medication,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
      }
    })

  const pastMedications = allMedications.filter((medication) => medication.status === "completed")

  const handleAddMedication = () => {
    // Valider le formulaire
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.startDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
      })
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un médicament",
      })
      return
    }

    // Ajouter le nouveau médicament
    addMedication({
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      startDate: newMedication.startDate,
      endDate:
        newMedication.endDate || new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
      withFood: newMedication.withFood,
      notes: newMedication.notes,
      status: "active",
      adherence: 100,
      patientId: currentUser.id,
    })

    toast({
      title: "Médicament ajouté",
      description: `${newMedication.name} a été ajouté à votre liste de médicaments`,
    })

    // Réinitialiser le formulaire et fermer la boîte de dialogue
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      withFood: false,
      notes: "",
    })
    setShowAddDialog(false)
  }

  const handleStopMedication = (id: string) => {
    updateMedication(id, { status: "completed" })
    toast({
      title: "Médicament arrêté",
      description: "Le médicament a été marqué comme terminé",
    })
  }

  const handleResumeMedication = (id: string) => {
    updateMedication(id, {
      status: "active",
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    })
    toast({
      title: "Médicament repris",
      description: "Le médicament a été remis dans votre liste active",
    })
  }

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return "text-green-600 bg-green-100"
    if (adherence >= 70) return "text-amber-600 bg-amber-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Médicaments</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un médicament
        </Button>
      </div>

      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">En cours</TabsTrigger>
          <TabsTrigger value="past">Terminés</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentMedications.length > 0 ? (
            currentMedications.map((medication) => (
              <Card key={medication.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{medication.name}</h3>
                          <span className="text-sm text-muted-foreground">{medication.dosage}</span>
                        </div>
                        <p className="text-muted-foreground">{medication.frequency}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            Du {new Date(medication.startDate).toLocaleDateString("fr-FR")} au{" "}
                            {new Date(medication.endDate).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {medication.remainingDays} jours restants
                          </div>
                        </div>
                        {medication.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>{medication.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs ${getAdherenceColor(medication.adherence)}`}>
                        Observance: {medication.adherence}%
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleStopMedication(medication.id)}
                        >
                          Arrêter
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun médicament en cours</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas de médicaments actifs pour le moment.</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un médicament
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMedications.length > 0 ? (
            pastMedications.map((medication) => (
              <Card key={medication.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{medication.name}</h3>
                          <span className="text-sm text-muted-foreground">{medication.dosage}</span>
                        </div>
                        <p className="text-muted-foreground">{medication.frequency}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            Du {new Date(medication.startDate).toLocaleDateString("fr-FR")} au{" "}
                            {new Date(medication.endDate).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                        {medication.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p>{medication.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs ${getAdherenceColor(medication.adherence)}`}>
                        Observance: {medication.adherence}%
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleResumeMedication(medication.id)}>
                        Reprendre
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun médicament terminé</h3>
                <p className="text-muted-foreground">Vous n'avez pas d'historique de médicaments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un médicament</DialogTitle>
            <DialogDescription>Ajoutez un nouveau médicament à votre liste de traitements</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du médicament *</Label>
                <Input
                  id="name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="ex: Paracétamol"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="ex: 500mg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence *</Label>
              <Select
                value={newMedication.frequency}
                onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Sélectionnez une fréquence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 fois par jour">1 fois par jour</SelectItem>
                  <SelectItem value="2 fois par jour">2 fois par jour</SelectItem>
                  <SelectItem value="3 fois par jour">3 fois par jour</SelectItem>
                  <SelectItem value="4 fois par jour">4 fois par jour</SelectItem>
                  <SelectItem value="Au besoin">Au besoin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newMedication.endDate}
                  onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="withFood"
                checked={newMedication.withFood}
                onCheckedChange={(checked) => setNewMedication({ ...newMedication, withFood: checked })}
              />
              <Label htmlFor="withFood">Prendre avec de la nourriture</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newMedication.notes}
                onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                placeholder="Instructions spéciales ou notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddMedication}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
