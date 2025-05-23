"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserRole } from "@/lib/auth"
import { useAppContext } from "@/contexts/app-context"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState({
    appointments: 0,
    medications: 0,
    bloodDonations: 0,
    patients: 0,
  })

  const { getUserAppointments, getUserMedications, getUserBloodRequests, getDoctorPatients } = useAppContext()
  const { user, logout } = useAuth()

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

  // Ces données sont déjà calculées dans les statistiques

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Button onClick={logout}>Déconnexion</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Bienvenue, {user?.firstName} {user?.lastName}
              </CardTitle>
              <CardDescription>Votre rôle: {user?.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Que souhaitez-vous faire aujourd'hui?</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Tous les utilisateurs peuvent voir les rendez-vous */}
                <Link href="/dashboard/appointments">
                  <Button variant="outline" className="w-full">
                    Rendez-vous
                  </Button>
                </Link>

                {/* Dossier médical visible pour patients, médecins, infirmiers et admin */}
                {(userRole === "patient" || userRole === "doctor" || userRole === "nurse" || userRole === "admin") && (
                  <Link href="/dashboard/medical-record">
                    <Button variant="outline" className="w-full">
                      Dossier médical
                    </Button>
                  </Link>
                )}

                {/* Médicaments visibles pour patients, médecins, infirmiers et admin */}
                {(userRole === "patient" || userRole === "doctor" || userRole === "nurse" || userRole === "admin") && (
                  <Link href="/dashboard/medications">
                    <Button variant="outline" className="w-full">
                      Médicaments
                    </Button>
                  </Link>
                )}

                {/* Don de sang visible pour tous */}
                <Link href="/dashboard/blood-donation">
                  <Button variant="outline" className="w-full">
                    Don de sang
                  </Button>
                </Link>

                {/* Administration visible uniquement pour les admin */}
                {(userRole === "admin" || userRole === "ADMIN" || userRole === "SYSTEM_ADMIN") && (
                  <Link href="/dashboard/admin">
                    <Button variant="outline" className="w-full">
                      Administration
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Aperçu de vos activités récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Rendez-vous à venir</p>
                  <p className="text-2xl font-bold">{stats.appointments}</p>
                </div>
                <div>
                  <p className="font-medium">Médicaments actifs</p>
                  <p className="text-2xl font-bold">{stats.medications}</p>
                </div>
                <div>
                  <p className="font-medium">Dernière visite</p>
                  <p className="text-2xl font-bold">Il y a 2 semaines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
