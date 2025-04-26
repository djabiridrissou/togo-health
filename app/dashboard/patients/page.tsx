"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, FileText, Calendar, Plus, MoreHorizontal, User, Heart } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import type { Patient } from "@/types"

export default function PatientsPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false)
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    bloodType: "",
  })

  const { getDoctorPatients, addPatient } = useAppContext()
  const { toast } = useToast()
  const currentUser = getCurrentUser()

  // Get patients and filter by search term
  const allPatients = getDoctorPatients()
  const filteredPatients = allPatients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
      patient.email.toLowerCase().includes(search.toLowerCase()),
  )

  // Handle adding a new patient
  const handleAddPatient = () => {
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter un patient",
        variant: "destructive",
      })
      return
    }

    if (!newPatient.firstName || !newPatient.lastName || !newPatient.email || !newPatient.phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    // Create a new patient
    const patientData: Omit<Patient, "id"> = {
      ...newPatient,
      allergies: [],
      chronicConditions: [],
      doctorId: currentUser.id,
    }

    addPatient(patientData)

    toast({
      title: "Patient ajouté",
      description: "Le patient a été ajouté avec succès",
    })

    // Reset form and close dialog
    setNewPatient({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      bloodType: "",
    })
    setShowAddPatientDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        {currentUser?.role === "doctor" && (
          <Button onClick={() => setShowAddPatientDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un patient
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un patient..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="recent">Récents</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "all" && (
          <div className="space-y-4 mt-0">
            {filteredPatients.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Groupe sanguin</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>{patient.phoneNumber}</TableCell>
                          <TableCell>{patient.bloodType || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Ouvrir le menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/dashboard/patients/${patient.id}`}>
                                  <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Voir le profil</span>
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/dashboard/patients/${patient.id}/medical-record`}>
                                  <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Dossier médical</span>
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/dashboard/patients/${patient.id}/appointments`}>
                                  <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Rendez-vous</span>
                                  </DropdownMenuItem>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-3 rounded-full mb-4">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-lg">Aucun patient trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    {search
                      ? "Aucun patient ne correspond à votre recherche."
                      : "Vous n'avez pas encore de patients attribués."}
                  </p>
                  {currentUser?.role === "doctor" && (
                    <Button onClick={() => setShowAddPatientDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un patient
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "recent" && (
          <div className="space-y-4 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.slice(0, 6).map((patient) => (
                <Card key={patient.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>
                        {patient.firstName} {patient.lastName}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              <span>Voir le profil</span>
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/patients/${patient.id}/medical-record`}>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Dossier médical</span>
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/patients/${patient.id}/appointments`}>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Rendez-vous</span>
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Téléphone:</span>
                        <span>{patient.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Groupe sanguin:</span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-rose-500" />
                          {patient.bloodType || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Link href={`/dashboard/patients/${patient.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Profil
                        </Button>
                      </Link>
                      <Link href={`/dashboard/patients/${patient.id}/medical-record`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Dossier médical
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredPatients.length === 0 && (
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="bg-gray-100 p-3 rounded-full mb-4">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-lg">Aucun patient récent</h3>
                  <p className="text-muted-foreground mb-4">
                    {search ? "Aucun patient ne correspond à votre recherche." : "Vous n'avez pas de patients récents."}
                  </p>
                  {currentUser?.role === "doctor" && (
                    <Button onClick={() => setShowAddPatientDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un patient
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un patient</DialogTitle>
            <DialogDescription>Entrez les informations du nouveau patient</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone *</Label>
              <Input
                id="phoneNumber"
                value={newPatient.phoneNumber}
                onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Groupe sanguin</Label>
              <Input
                id="bloodType"
                value={newPatient.bloodType}
                onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                placeholder="ex: A+"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPatient}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
