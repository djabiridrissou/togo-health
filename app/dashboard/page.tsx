"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Activity, FileText, Heart, AlertCircle } from "lucide-react"
import { getUserRole } from "@/lib/auth"
import { useAppContext } from "@/contexts/app-context"
import Link from "next/link"
import { useTransitionRefresh } from "@/hooks/use-transition-refresh"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState({
    appointments: 0,
    medications: 0,
    bloodDonations: 0,
    patients: 0,
  })

  const { isPending, refresh } = useTransitionRefresh()
  const { getUserAppointments, getUserMedications, getUserBloodRequests, getDoctorPatients } = useAppContext()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)

    // Calculer les statistiques à partir des données réelles
    const appointments = getUserAppointments().filter((a) => a.status === "scheduled")
    const medications = getUserMedications().filter((m) => m.status === "active")
    const bloodRequests = getUserBloodRequests().filter((r) => r.status === "active")
    const patients = getDoctorPatients()

    setStats({
      appointments: appointments.length,
      medications: medications.length,
      bloodDonations: bloodRequests.length,
      patients: role === "doctor" ? patients.length : 0,
    })
  }, [getUserAppointments, getUserMedications, getUserBloodRequests, getDoctorPatients])

  // Filtrer les rendez-vous à venir
  const upcomingAppointments = getUserAppointments()
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2)

  // Filtrer les médicaments actifs
  const recentMedications = getUserMedications()
    .filter((m) => m.status === "active")
    .slice(0, 3)

  // Filtrer les demandes de sang actives
  const bloodDonationRequests = getUserBloodRequests()
    .filter((r) => r.status === "active")
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <Button variant="outline" onClick={refresh} disabled={isPending}>
          {isPending ? "Rafraîchissement..." : "Rafraîchir"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">Rendez-vous à venir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicaments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medications}</div>
            <p className="text-xs text-muted-foreground">Médicaments actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dons de sang</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bloodDonations}</div>
            <p className="text-xs text-muted-foreground">Demandes actives</p>
          </CardContent>
        </Card>
        {userRole === "doctor" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patients}</div>
              <p className="text-xs text-muted-foreground">Patients actifs</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
          <TabsTrigger value="medications">Médicaments</TabsTrigger>
          <TabsTrigger value="bloodDonation">Dons de sang</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prochains rendez-vous</CardTitle>
                <CardDescription>Vos rendez-vous médicaux à venir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start space-x-4 rounded-md border p-4">
                      <Calendar className="mt-px h-5 w-5 text-blue-600" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {appointment.type} avec {appointment.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          à {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.location}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-4 text-muted-foreground">
                    Aucun rendez-vous à venir
                  </div>
                )}
                <div className="flex justify-center">
                  <Link href="/dashboard/appointments">
                    <Button variant="outline">Voir tous les rendez-vous</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Prendre un rendez-vous</CardTitle>
                <CardDescription>Planifiez une consultation avec un professionnel de santé</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4 bg-blue-50">
                  <div className="flex items-start space-x-4">
                    <Activity className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Consultation générale</p>
                      <p className="text-sm text-muted-foreground">
                        Consultez un médecin généraliste pour un bilan de santé
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border p-4">
                  <div className="flex items-start space-x-4">
                    <Heart className="mt-0.5 h-5 w-5 text-rose-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Consultation spécialisée</p>
                      <p className="text-sm text-muted-foreground">
                        Consultez un spécialiste pour un suivi médical spécifique
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Link href="/dashboard/appointments/new">
                    <Button>Prendre rendez-vous</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Médicaments actuels</CardTitle>
              <CardDescription>Vos médicaments et traitements en cours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMedications.length > 0 ? (
                recentMedications.map((medication) => (
                  <div key={medication.id} className="flex items-start space-x-4 rounded-md border p-4">
                    <FileText className="mt-px h-5 w-5 text-teal-600" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {medication.name} - {medication.dosage}
                      </p>
                      <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                      <p className="text-sm text-muted-foreground">
                        Du {new Date(medication.startDate).toLocaleDateString("fr-FR")} au{" "}
                        {new Date(medication.endDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-4 text-muted-foreground">Aucun médicament actif</div>
              )}
              <div className="flex justify-center">
                <Link href="/dashboard/medications">
                  <Button variant="outline">Gérer mes médicaments</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bloodDonation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de dons de sang</CardTitle>
              <CardDescription>Demandes de dons de sang actives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bloodDonationRequests.length > 0 ? (
                bloodDonationRequests.map((request) => (
                  <div key={request.id} className="flex items-start space-x-4 rounded-md border p-4">
                    <AlertCircle className="mt-px h-5 w-5 text-rose-600" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">Groupe sanguin {request.bloodType}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            request.urgency === "high" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Urgence{" "}
                          {request.urgency === "high" ? "Élevée" : request.urgency === "medium" ? "Moyenne" : "Faible"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.hospital}</p>
                      <p className="text-sm text-muted-foreground">
                        Demande du {new Date(request.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-4 text-muted-foreground">
                  Aucune demande de don de sang active
                </div>
              )}
              <div className="flex justify-center gap-4">
                <Link href="/dashboard/blood-donation">
                  <Button variant="outline">Voir toutes les demandes</Button>
                </Link>
                <Link href="/dashboard/blood-donation/donate">
                  <Button>Faire un don</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
