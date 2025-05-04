"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PinValidationModal } from "@/components/pin-validation-modal"
import { formatDate } from "@/lib/utils"
import { Lock, Unlock, FileText, Download, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { MedicalRecordWithDoctor } from "@/lib/types"

interface MedicalRecordProps {
  record: MedicalRecordWithDoctor
  isPatient: boolean
  isDoctor: boolean
}

export function MedicalRecord({ record, isPatient, isDoctor }: MedicalRecordProps) {
  const [showPinModal, setShowPinModal] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const { toast } = useToast()

  const handleUnlock = () => {
    if (record.pinAccess) {
      setShowPinModal(true)
    } else {
      setIsUnlocked(true)
    }
  }

  const handlePinSuccess = () => {
    setShowPinModal(false)
    setIsUnlocked(true)
    toast({
      title: "Accès autorisé",
      description: "Vous pouvez maintenant consulter ce dossier médical",
    })
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return "bg-blue-100 text-blue-800"
      case "TEST":
        return "bg-purple-100 text-purple-800"
      case "SURGERY":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {record.title}
                <Badge className={getRecordTypeColor(record.type)}>{record.type}</Badge>
              </CardTitle>
              <CardDescription>
                {formatDate(record.date)} • {record.doctor?.user?.name || "Médecin non spécifié"}
              </CardDescription>
            </div>
            <div>
              {record.pinAccess && !isUnlocked ? (
                <Button variant="outline" size="icon" onClick={handleUnlock}>
                  <Lock className="h-4 w-4" />
                </Button>
              ) : (
                <Badge variant="outline" className="bg-green-50">
                  <Unlock className="h-3 w-3 mr-1" /> Accessible
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {isUnlocked || !record.pinAccess || (isDoctor && record.isApproved) ? (
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{record.description}</p>

              {record.attachments && JSON.parse(record.attachments).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Pièces jointes</h4>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(record.attachments).map((attachment: string, index: number) => (
                      <Button key={index} variant="outline" size="sm" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Document {index + 1}
                        <Download className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        ) : (
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Contenu protégé</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ce dossier médical nécessite une vérification par code PIN pour être consulté
              </p>
              <Button onClick={handleUnlock}>
                <Eye className="h-4 w-4 mr-2" />
                Déverrouiller
              </Button>
            </div>
          </CardContent>
        )}

        <CardFooter className="bg-muted/20 flex justify-between">
          <div className="text-xs text-muted-foreground">ID: {record.id.substring(0, 8)}</div>
          <div className="flex gap-2">
            {isPatient && (
              <Button variant="outline" size="sm">
                Gérer l'accès
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Détails
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PinValidationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        patientId={record.patientId}
        onSuccess={handlePinSuccess}
      />
    </>
  )
}
