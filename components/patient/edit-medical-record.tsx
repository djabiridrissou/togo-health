"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Edit, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/contexts/app-context"
import { updatePatientMedicalRecord } from "@/lib/actions/medical-record-actions"
import type { MedicalRecord } from "@/contexts/app-context"

interface EditMedicalRecordProps {
  record: MedicalRecord
}

export function EditMedicalRecord({ record }: EditMedicalRecordProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(record.date ? new Date(record.date) : undefined)
  const [formData, setFormData] = useState({
    title: record.title || "",
    type: record.type || "SELF_REPORT",
    description: record.description || "",
    attachments: [] as File[],
    existingAttachments: record.attachments ? record.attachments.split(",") : [],
    pinAccess: record.pinAccess !== undefined ? record.pinAccess : true,
  })
  
  const { toast } = useToast()
  const { updateMedicalRecord } = useAppContext()
  
  // Mettre à jour le formulaire lorsque le record change
  useEffect(() => {
    setFormData({
      title: record.title || "",
      type: record.type || "SELF_REPORT",
      description: record.description || "",
      attachments: [],
      existingAttachments: record.attachments ? record.attachments.split(",") : [],
      pinAccess: record.pinAccess !== undefined ? record.pinAccess : true,
    })
    setDate(record.date ? new Date(record.date) : undefined)
  }, [record])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (!date) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une date.",
          variant: "destructive",
        })
        return
      }
      
      // Créer un objet FormData pour l'action serveur
      const formDataObj = new FormData()
      formDataObj.append("recordId", record.id)
      formDataObj.append("title", formData.title)
      formDataObj.append("type", formData.type)
      formDataObj.append("description", formData.description)
      formDataObj.append("date", date.toISOString())
      formDataObj.append("pinAccess", formData.pinAccess.toString())
      
      // Ajouter les pièces jointes existantes
      formDataObj.append("existingAttachments", JSON.stringify(formData.existingAttachments))
      
      // Ajouter les nouvelles pièces jointes
      formData.attachments.forEach((file, index) => {
        formDataObj.append(`attachment-${index}`, file)
      })
      
      const result = await updatePatientMedicalRecord(formDataObj)
      
      if (result.success) {
        toast({
          title: "Dossier médical mis à jour",
          description: "Votre dossier médical a été mis à jour avec succès.",
        })
        
        // Mettre à jour localement
        updateMedicalRecord(record.id, {
          title: formData.title,
          type: formData.type,
          description: formData.description,
          date: date.toISOString(),
          pinAccess: formData.pinAccess,
          attachments: [...formData.existingAttachments, ...formData.attachments.map(file => file.name)].join(","),
        })
        
        // Fermer la boîte de dialogue
        setOpen(false)
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur s'est produite lors de la mise à jour du dossier médical.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du dossier médical:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du dossier médical.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFormData({ ...formData, attachments: [...formData.attachments, ...newFiles] })
    }
  }
  
  const removeFile = (index: number) => {
    const newFiles = [...formData.attachments]
    newFiles.splice(index, 1)
    setFormData({ ...formData, attachments: newFiles })
  }
  
  const removeExistingFile = (index: number) => {
    const newFiles = [...formData.existingAttachments]
    newFiles.splice(index, 1)
    setFormData({ ...formData, existingAttachments: newFiles })
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier l'entrée du dossier médical</DialogTitle>
            <DialogDescription>
              Modifiez cette entrée de votre dossier médical. Ces informations seront visibles par vos médecins.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELF_REPORT">Auto-déclaration</SelectItem>
                    <SelectItem value="TEST_RESULT">Résultat de test</SelectItem>
                    <SelectItem value="MEDICATION">Médicament</SelectItem>
                    <SelectItem value="ALLERGY">Allergie</SelectItem>
                    <SelectItem value="VACCINATION">Vaccination</SelectItem>
                    <SelectItem value="CHRONIC_CONDITION">Condition chronique</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez en détail cette entrée médicale"
                required
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Pièces jointes existantes</Label>
              {formData.existingAttachments.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {formData.existingAttachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate max-w-[300px]">{file}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingFile(index)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune pièce jointe existante</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attachments">Ajouter des pièces jointes</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload-edit")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Télécharger des fichiers
                </Button>
                <Input
                  id="file-upload-edit"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pinAccess"
                checked={formData.pinAccess}
                onChange={(e) => setFormData({ ...formData, pinAccess: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="pinAccess" className="text-sm font-normal">
                Protéger cette entrée avec un code PIN
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
