"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download, Plus, Eye } from "lucide-react"
import Link from "next/link"

export default function MedicalRecordPage() {
  const [activeTab, setActiveTab] = useState("general")

  const medicalInfo = {
    general: {
      bloodType: "O+",
      height: "175 cm",
      weight: "70 kg",
      allergies: ["Pénicilline", "Arachides"],
      chronicConditions: ["Asthme"],
    },
    consultations: [
      {
        id: 1,
        date: "2023-05-15",
        doctor: "Dr. Kofi Mensah",
        specialty: "Médecine générale",
        diagnosis: "Infection respiratoire",
        notes: "Prescription d'antibiotiques pour 7 jours. Repos recommandé.",
      },
      {
        id: 2,
        date: "2023-04-02",
        doctor: "Dr. Ama Diallo",
        specialty: "Cardiologie",
        diagnosis: "Examen cardiaque de routine",
        notes: "Résultats normaux. Prochain contrôle dans 6 mois.",
      },
    ],
    tests: [
      {
        id: 1,
        date: "2023-05-16",
        name: "Analyse de sang",
        requestedBy: "Dr. Kofi Mensah",
        results: "Légère anémie. Supplémentation en fer recommandée.",
        documentUrl: "#",
      },
      {
        id: 2,
        date: "2023-04-02",
        name: "Électrocardiogramme",
        requestedBy: "Dr. Ama Diallo",
        results: "Rythme cardiaque normal. Aucune anomalie détectée.",
        documentUrl: "#",
      },
    ],
    documents: [
      {
        id: 1,
        name: "Résultats d'analyse de sang",
        date: "2023-05-16",
        type: "PDF",
        size: "1.2 MB",
        url: "#",
      },
      {
        id: 2,
        name: "Électrocardiogramme",
        date: "2023-04-02",
        type: "PDF",
        size: "3.5 MB",
        url: "#",
      },
      {
        id: 3,
        name: "Radiographie pulmonaire",
        date: "2023-03-10",
        type: "JPEG",
        size: "2.8 MB",
        url: "#",
      },
    ],
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
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.consultations.map((consultation) => (
                <div key={consultation.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">{consultation.diagnosis}</h3>
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
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
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
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalInfo.tests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-teal-600" />
                      <h3 className="font-medium">{test.name}</h3>
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
                  <div className="flex justify-end">
                    <Link href={test.documentUrl}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir le document
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
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
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg divide-y">
                {medicalInfo.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-10 w-10 text-gray-400" />
                      <div>
                        <p className="font-medium">{document.name}</p>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
