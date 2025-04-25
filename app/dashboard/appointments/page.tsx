"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Plus, Video } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const { getUserAppointments, updateAppointment, deleteAppointment } = useAppContext()
  const { toast } = useToast()

  // Récupérer tous les rendez-vous de l'utilisateur
  const allAppointments = getUserAppointments()

  // Filtrer les rendez-vous à venir et passés
  const upcomingAppointments = allAppointments
    .filter((appointment) => appointment.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastAppointments = allAppointments
    .filter((appointment) => appointment.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Fonction pour annuler un rendez-vous
  const handleCancelAppointment = (id: string) => {
    updateAppointment(id, { status: "cancelled" })
    toast({
      title: "Rendez-vous annulé",
      description: "Votre rendez-vous a été annulé avec succès.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rendez-vous</h2>
        <Link href="/dashboard/appointments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        {appointment.mode === "virtual" ? (
                          <Video className="h-6 w-6 text-blue-600" />
                        ) : (
                          <User className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{appointment.type}</h3>
                        <p className="text-muted-foreground">
                          {appointment.doctor} - {appointment.specialty}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {appointment.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Annuler
                      </Button>
                      {appointment.mode === "virtual" && <Button size="sm">Rejoindre</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun rendez-vous à venir</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas de rendez-vous planifiés pour le moment.</p>
                <Link href="/dashboard/appointments/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Prendre un rendez-vous
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        {appointment.mode === "virtual" ? (
                          <Video className="h-6 w-6 text-gray-600" />
                        ) : (
                          <User className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{appointment.type}</h3>
                        <p className="text-muted-foreground">
                          {appointment.doctor} - {appointment.specialty}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {appointment.location}
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                            <p className="font-medium">Notes:</p>
                            <p>{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 md:justify-end">
                      <Button variant="outline" size="sm">
                        Détails
                      </Button>
                      <Button variant="outline" size="sm">
                        Reprendre rendez-vous
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
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun rendez-vous passé</h3>
                <p className="text-muted-foreground">Vous n'avez pas d'historique de rendez-vous.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
