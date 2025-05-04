"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, Plus, Eye, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { getUserRole, getCurrentUser } from "@/lib/auth"
import { AddMedicalRecord } from "@/components/patient/add-medical-record"
import { EditMedicalRecord } from "@/components/patient/edit-medical-record"
import { deletePatientMedicalRecord } from "@/lib/actions/medical-record-actions"
import Link from "next/link"

export default function MedicalRecordPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)

  const { toast } = useToast()
  const { medicalRecords, patients, getUserMedicalRecords } = useAppContext()
  const userRole = getUserRole()
  const currentUser = getCurrentUser()

  // Récupérer les dossiers médicaux de l'utilisateur
  const userMedicalRecords = getUserMedicalRecords()

  // Récupérer les informations générales du patient
  const patient = currentUser ? patients.find(p => p.id === currentUser.id || p.email === currentUser.email) : null

  const medicalInfo = {
    general: {
      bloodType: patient?.bloodType || "Non spécifié",
      height: patient?.height || "Non spécifié",
      weight: patient?.weight || "Non spécifié",
      allergies: patient?.allergies || ["Non spécifié"],
      chronicConditions: patient?.chronicConditions || ["Non spécifié"],
    },
    consultations: userMedicalRecords
      .filter(record => record.type === "CONSULTATION" || record.type === "SELF_REPORT")
      .map(record => ({
        id: record.id,
        date: record.date,
        doctor: record.doctorId ? `Dr. ${record.doctor}` : "Auto-déclaration",
        specialty: "Médecine générale",
        diagnosis: record.title,
        notes: record.description,
        pinAccess: record.pinAccess,
        isApproved: record.isApproved,
      })),
    tests: userMedicalRecords
      .filter(record => record.type === "TEST_RESULT")
      .map(record => ({
        id: record.id,
        date: record.date,
        name: record.title,
        requestedBy: record.doctorId ? `Dr. ${record.doctor}` : "Auto-déclaration",
        results: record.description,
        documentUrl: record.attachments,
        pinAccess: record.pinAccess,
        isApproved: record.isApproved,
      })),
    documents: userMedicalRecords
      .filter(record => record.attachments)
      .flatMap(record => {
        const attachments = record.attachments ? record.attachments.split(",") : []
        return attachments.map((attachment, index) => ({
          id: `${record.id}-${index}`,
          recordId: record.id,
          name: attachment.trim(),
          date: record.date,
          type: attachment.split(".").pop()?.toUpperCase() || "PDF",
          size: "1.0 MB",
          url: "#",
          pinAccess: record.pinAccess,
          isApproved: record.isApproved,
        }))
      }),
  }

  // Fonction pour supprimer un dossier médical
  const handleDeleteRecord = async (recordId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est irréversible.")) {
      setIsLoading(true)

      try {
        const result = await deletePatientMedicalRecord(recordId)

        if (result.success) {
          toast({
            title: "Entrée supprimée",
            description: "L'entrée a été supprimée avec succès.",
          })

          // Actualiser les données
          window.location.reload()
        } else {
          toast({
            title: "Erreur",
            description: result.message || "Une erreur s'est produite lors de la suppression de l'entrée.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'entrée:", error)
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression de l'entrée.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Fonction pour obtenir la couleur du badge en fonction du type de dossier
  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return "bg-blue-100 text-blue-800"
      case "TEST_RESULT":
        return "bg-purple-100 text-purple-800"
      case "MEDICATION":
        return "bg-green-100 text-green-800"
      case "ALLERGY":
        return "bg-red-100 text-red-800"
      case "VACCINATION":
        return "bg-teal-100 text-teal-800"
      case "CHRONIC_CONDITION":
        return "bg-amber-100 text-amber-800"
      case "SELF_REPORT":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dossier médical</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Importer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="tests">Tests & Résultats</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Vos informations médicales de base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                  <p className="font-medium">{medicalInfo.general.bloodType}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Taille</p>
                  <p className="font-medium">{medicalInfo.general.height}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Poids</p>
                  <p className="font-medium">{medicalInfo.general.weight}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {medicalInfo.general.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      {allergy}
                    </span>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 rounded-full">
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conditions chroniques</p>
                <div className="flex flex-wrap gap-2">
                  {medicalInfo.general.chronicConditions.map((condition, index) => (
                    <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                      {condition}
                    </span>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 rounded-full">
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Mettre à jour les informations</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Consultations médicales</CardTitle>
                <CardDescription>Historique de vos consultations médicales</CardDescription>
              </div>
              {userRole === "patient" && <AddMedicalRecord />}
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.consultations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Aucune consultation médicale enregistrée</p>
                  {userRole === "patient" && (
                    <Button variant="outline" className="mt-4" onClick={() => document.querySelector<HTMLButtonElement>('[data-add-record]')?.click()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter votre première consultation
                    </Button>
                  )}
                </div>
              ) : (
                medicalInfo.consultations.map((consultation) => {
                  // Trouver le record original pour l'édition
                  const originalRecord = userMedicalRecords.find(r => r.id === consultation.id)

                  return (
                    <div key={consultation.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium">{consultation.diagnosis}</h3>
                          {!consultation.isApproved && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 text-xs">
                              En attente d'approbation
                            </Badge>
                          )}
                          {consultation.pinAccess && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 text-xs">
                              Protégé par PIN
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(consultation.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>
                          <span className="font-medium">Médecin:</span> {consultation.doctor}
                        </p>
                        <p>
                          <span className="font-medium">Spécialité:</span> {consultation.specialty}
                        </p>
                        <p>
                          <span className="font-medium">Notes:</span> {consultation.notes}
                        </p>
                      </div>

                      {userRole === "patient" && originalRecord && (
                        <div className="flex justify-end gap-2 mt-2">
                          <EditMedicalRecord record={originalRecord} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteRecord(consultation.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tests & Résultats</CardTitle>
                <CardDescription>Vos tests médicaux et leurs résultats</CardDescription>
              </div>
              {userRole === "patient" && <AddMedicalRecord />}
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.tests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Aucun test médical enregistré</p>
                  {userRole === "patient" && (
                    <Button variant="outline" className="mt-4" onClick={() => document.querySelector<HTMLButtonElement>('[data-add-record]')?.click()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter votre premier test
                    </Button>
                  )}
                </div>
              ) : (
                medicalInfo.tests.map((test) => {
                  // Trouver le record original pour l'édition
                  const originalRecord = userMedicalRecords.find(r => r.id === test.id)

                  return (
                    <div key={test.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-teal-600" />
                          <h3 className="font-medium">{test.name}</h3>
                          {!test.isApproved && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 text-xs">
                              En attente d'approbation
                            </Badge>
                          )}
                          {test.pinAccess && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 text-xs">
                              Protégé par PIN
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(test.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>
                          <span className="font-medium">Demandé par:</span> {test.requestedBy}
                        </p>
                        <p>
                          <span className="font-medium">Résultats:</span> {test.results}
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        {test.documentUrl && (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le document
                          </Button>
                        )}

                        {userRole === "patient" && originalRecord && (
                          <>
                            <EditMedicalRecord record={originalRecord} />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteRecord(test.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents médicaux</CardTitle>
                <CardDescription>Tous vos documents médicaux</CardDescription>
              </div>
              {userRole === "patient" && <AddMedicalRecord />}
            </CardHeader>
            <CardContent>
              {medicalInfo.documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Aucun document médical enregistré</p>
                  {userRole === "patient" && (
                    <Button variant="outline" className="mt-4" onClick={() => document.querySelector<HTMLButtonElement>('[data-add-record]')?.click()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter votre premier document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg divide-y">
                  {medicalInfo.documents.map((document) => {
                    // Trouver le record original pour l'édition
                    const originalRecord = userMedicalRecords.find(r => r.id === document.recordId)

                    return (
                      <div key={document.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-10 w-10 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{document.name}</p>
                              {!document.isApproved && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 text-xs">
                                  En attente d'approbation
                                </Badge>
                              )}
                              {document.pinAccess && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-800 text-xs">
                                  Protégé par PIN
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(document.date).toLocaleDateString("fr-FR")} • {document.type} • {document.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Télécharger</span>
                          </Button>

                          {userRole === "patient" && originalRecord && (
                            <>
                              <EditMedicalRecord record={originalRecord} />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleDeleteRecord(document.recordId)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
