"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { History, AlertTriangle, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authMiddleware } from "@/lib/auth"

export default function PatientHistoryPage() {
  const params = useParams()
  const patientId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState(null)
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [restoring, setRestoring] = useState(false)

  // Vérifier l'accès et rediriger si nécessaire
  useEffect(() => {
    if (!authMiddleware(["admin", "doctor"])) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [router, toast])

  // Charger les données du patient et ses versions
  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        // Dans une implémentation réelle, cela serait un appel API
        // Pour l'instant, nous simulons des données
        const mockPatient = {
          id: patientId,
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+228 90123456",
          birthDate: "1985-05-15",
        }

        const mockVersions = [
          {
            id: 1,
            version: 3,
            timestamp: "2023-06-15T10:30:00Z",
            userId: 2,
            userName: "Dr. Jane Smith",
            data: {
              ...mockPatient,
              phone: "+228 90123456",
              allergies: "Pénicilline, Arachides",
            },
            changes: "Mise à jour des allergies",
          },
          {
            id: 2,
            version: 2,
            timestamp: "2023-06-10T14:45:00Z",
            userId: 3,
            userName: "Alice Johnson",
            data: {
              ...mockPatient,
              phone: "+228 90123456",
              allergies: "Pénicilline",
            },
            changes: "Ajout d'allergie",
          },
          {
            id: 3,
            version: 1,
            timestamp: "2023-06-05T09:15:00Z",
            userId: 2,
            userName: "Dr. Jane Smith",
            data: {
              ...mockPatient,
              phone: "+228 90123455",
              allergies: "",
            },
            changes: "Création du dossier patient",
          },
        ]

        setPatient(mockPatient)
        setVersions(mockVersions)
        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique du patient:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique du patient",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatientHistory()
    }
  }, [patientId, toast])

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Afficher les détails d'une version
  const viewVersion = (version) => {
    setSelectedVersion(version)
  }

  // Restaurer une version
  const confirmRestore = (version) => {
    setSelectedVersion(version)
    setShowRestoreDialog(true)
  }

  // Effectuer la restauration
  const handleRestore = async () => {
    setRestoring(true)
    try {
      // Dans une implémentation réelle, cela serait un appel API
      // Pour l'instant, nous simulons une restauration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Version restaurée",
        description: `Le dossier patient a été restauré à la version du ${formatDate(selectedVersion.timestamp)}`,
      })

      setShowRestoreDialog(false)
      setRestoring(false)
      // Rediriger vers la page du patient
      router.push(`/dashboard/patients/${patientId}`)
    } catch (error) {
      console.error("Erreur lors de la restauration:", error)
      toast({
        title: "Erreur",
        description: "Impossible de restaurer cette version",
        variant: "destructive",
      })
      setRestoring(false)
    }
  }

  // Comparer les objets pour trouver les différences
  const getDifferences = (currentVersion, previousVersion) => {
    if (!previousVersion) return []

    const differences = []
    const currentData = currentVersion.data
    const previousData = previousVersion.data

    // Comparer les propriétés
    Object.keys(currentData).forEach((key) => {
      if (JSON.stringify(currentData[key]) !== JSON.stringify(previousData[key])) {
        differences.push({
          field: key,
          oldValue: previousData[key] || "Non défini",
          newValue: currentData[key],
        })
      }
    })

    return differences
  }

  // Trouver la version précédente
  const getPreviousVersion = (currentIndex) => {
    return currentIndex < versions.length - 1 ? versions[currentIndex + 1] : null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Historique du patient {patient?.name}</h2>
        <Button variant="outline" onClick={() => router.push(`/dashboard/patients/${patientId}`)}>
          Retour au dossier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Versions du dossier patient</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : versions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Modifications</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version, index) => (
                  <TableRow key={version.id}>
                    <TableCell>v{version.version}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(version.timestamp)}</TableCell>
                    <TableCell>{version.userName}</TableCell>
                    <TableCell>{version.changes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => viewVersion(version)}>
                          <History className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                        {index > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => confirmRestore(version)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="font-medium text-lg">Aucun historique trouvé</h3>
              <p className="text-muted-foreground">Aucune version précédente n'a été trouvée pour ce patient.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de détails de version */}
      {selectedVersion && (
        <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Version {selectedVersion.version} - {formatDate(selectedVersion.timestamp)}
              </DialogTitle>
              <DialogDescription>Modifications effectuées par {selectedVersion.userName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <h4 className="font-medium">Modifications apportées:</h4>
              {getDifferences(selectedVersion, getPreviousVersion(versions.indexOf(selectedVersion))).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Champ</TableHead>
                      <TableHead>Ancienne valeur</TableHead>
                      <TableHead>Nouvelle valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDifferences(selectedVersion, getPreviousVersion(versions.indexOf(selectedVersion))).map(
                      (diff, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{diff.field}</TableCell>
                          <TableCell>{diff.oldValue}</TableCell>
                          <TableCell>{diff.newValue}</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  {versions.indexOf(selectedVersion) === versions.length - 1
                    ? "Version initiale du dossier."
                    : "Aucune modification détectée."}
                </p>
              )}

              <h4 className="font-medium mt-4">État complet du dossier à cette version:</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(selectedVersion.data, null, 2)}</pre>
              </div>
            </div>

            <DialogFooter>
              {versions.indexOf(selectedVersion) > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVersion(null)
                    confirmRestore(selectedVersion)
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurer cette version
                </Button>
              )}
              <Button onClick={() => setSelectedVersion(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de confirmation de restauration */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la restauration</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de restaurer le dossier patient à la version du{" "}
              {selectedVersion && formatDate(selectedVersion.timestamp)}.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              Cette action remplacera toutes les données actuelles du patient par celles de cette version. Cette
              opération ne peut pas être annulée.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring ? "Restauration en cours..." : "Confirmer la restauration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
