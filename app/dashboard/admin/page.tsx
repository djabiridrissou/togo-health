"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Settings, Plus, Edit, Trash2 } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { AuthGuard } from "@/components/auth-guard"
import { getUserRole } from "@/lib/auth"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")
  const { patients, appointments, medicalRecords, bloodDonations, bloodRequests } = useAppContext()
  const userRole = getUserRole()

  return (
    <AuthGuard requiredPermission="admin_access">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres du système
          </Button>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="records">Dossiers médicaux</TabsTrigger>
            <TabsTrigger value="blood">Dons de sang</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>Gérer les utilisateurs du système</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.id}</TableCell>
                        <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des rendez-vous</CardTitle>
                  <CardDescription>Gérer tous les rendez-vous du système</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un rendez-vous
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.id}</TableCell>
                        <TableCell>
                          {patients.find((p) => p.id === appointment.patientId)
                            ? `${patients.find((p) => p.id === appointment.patientId)?.firstName} ${
                                patients.find((p) => p.id === appointment.patientId)?.lastName
                              }`
                            : "Patient inconnu"}
                        </TableCell>
                        <TableCell>{appointment.doctor}</TableCell>
                        <TableCell>
                          {new Date(appointment.date).toLocaleDateString("fr-FR")} à {appointment.time}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {appointment.status === "scheduled"
                              ? "Planifié"
                              : appointment.status === "completed"
                                ? "Terminé"
                                : "Annulé"}
                          </span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des dossiers médicaux</CardTitle>
                  <CardDescription>Gérer tous les dossiers médicaux du système</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un dossier
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Médecin</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.id}</TableCell>
                        <TableCell>
                          {patients.find((p) => p.id === record.patientId)
                            ? `${patients.find((p) => p.id === record.patientId)?.firstName} ${
                                patients.find((p) => p.id === record.patientId)?.lastName
                              }`
                            : "Patient inconnu"}
                        </TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{record.doctor}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blood" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des dons de sang</CardTitle>
                  <CardDescription>Gérer tous les dons et demandes de sang</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="donations">
                  <TabsList className="mb-4">
                    <TabsTrigger value="donations">Dons</TabsTrigger>
                    <TabsTrigger value="requests">Demandes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="donations">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Donneur</TableHead>
                          <TableHead>Groupe sanguin</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bloodDonations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>{donation.id}</TableCell>
                            <TableCell>
                              {patients.find((p) => p.id === donation.donorId)
                                ? `${patients.find((p) => p.id === donation.donorId)?.firstName} ${
                                    patients.find((p) => p.id === donation.donorId)?.lastName
                                  }`
                                : "Donneur inconnu"}
                            </TableCell>
                            <TableCell>{donation.bloodType}</TableCell>
                            <TableCell>{new Date(donation.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  donation.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : donation.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {donation.status === "scheduled"
                                  ? "Planifié"
                                  : donation.status === "completed"
                                    ? "Terminé"
                                    : "Annulé"}
                              </span>
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent value="requests">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Groupe sanguin</TableHead>
                          <TableHead>Hôpital</TableHead>
                          <TableHead>Urgence</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bloodRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.id}</TableCell>
                            <TableCell>{request.bloodType}</TableCell>
                            <TableCell>{request.hospital}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  request.urgency === "high"
                                    ? "bg-red-100 text-red-800"
                                    : request.urgency === "medium"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {request.urgency === "high"
                                  ? "Élevée"
                                  : request.urgency === "medium"
                                    ? "Moyenne"
                                    : "Faible"}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(request.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
