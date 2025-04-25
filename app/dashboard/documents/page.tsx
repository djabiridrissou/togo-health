"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, Eye, Plus, Lock, Share, Calendar, Ban, Check } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth"

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("my-documents")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showAccessRequestsDialog, setShowAccessRequestsDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "",
    isPrivate: true,
    notes: "",
    file: null as File | null,
  })
  const [shareForm, setShareForm] = useState({
    userId: 0,
    expiryDays: 30,
    message: "",
  })

  const { toast } = useToast()
  const {
    getUserDocuments,
    getAccessibleDocuments,
    getUserDocumentAccesses,
    addDocument,
    userHasDocumentAccess,
    requestDocumentAccess,
    approveDocumentAccess,
    denyDocumentAccess,
    documents,
    documentAccesses,
  } = useAppContext()

  // Get current user
  const currentUser = getCurrentUser()

  // Get documents
  const myDocuments = getUserDocuments()
  const accessibleDocuments = getAccessibleDocuments().filter((doc) => doc.ownerId !== currentUser?.id)
  const accessRequests = getUserDocumentAccesses().filter((access) => access.status === "pending")

  // Handle file upload (mock implementation)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] })
    }
  }

  // Handle document upload
  const handleUploadDocument = () => {
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour télécharger un document",
        variant: "destructive",
      })
      return
    }

    if (!uploadForm.name || !uploadForm.type || !uploadForm.file) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    // Mock document creation
    const newDocument = {
      name: uploadForm.name,
      type: uploadForm.type as "prescription" | "medical_test" | "invoice" | "report" | "other",
      date: new Date().toISOString().split("T")[0],
      fileType: uploadForm.file.type.split("/")[1].toUpperCase(),
      fileSize: `${Math.round(uploadForm.file.size / 1024)} KB`,
      url: URL.createObjectURL(uploadForm.file), // This is temporary and will not persist
      uploaderId: currentUser.id,
      ownerId: currentUser.id,
      isPrivate: uploadForm.isPrivate,
    }

    addDocument(newDocument)

    toast({
      title: "Document téléchargé",
      description: "Le document a été téléchargé avec succès",
    })

    // Reset form and close dialog
    setUploadForm({
      name: "",
      type: "",
      isPrivate: true,
      notes: "",
      file: null,
    })
    setShowUploadDialog(false)
  }

  // Handle requesting access to a document
  const handleRequestAccess = () => {
    if (!currentUser || !selectedDocument) return

    // Get document owner ID
    const document = documents.find((doc) => doc.id === selectedDocument)
    if (!document) return

    requestDocumentAccess(selectedDocument, currentUser.id)

    toast({
      title: "Demande envoyée",
      description: "Votre demande d'accès a été envoyée au propriétaire du document",
    })

    setSelectedDocument(null)
  }

  // Handle approving access request
  const handleApproveAccess = (accessId: string) => {
    approveDocumentAccess(accessId)

    toast({
      title: "Accès approuvé",
      description: "La demande d'accès a été approuvée",
    })
  }

  // Handle denying access request
  const handleDenyAccess = (accessId: string) => {
    denyDocumentAccess(accessId)

    toast({
      title: "Accès refusé",
      description: "La demande d'accès a été refusée",
    })
  }

  // Get document access status for display
  const getAccessStatus = (documentId: string) => {
    if (!currentUser) return "not-accessible"

    // Check if user is the owner
    const document = documents.find((doc) => doc.id === documentId)
    if (document?.ownerId === currentUser.id) return "owner"

    // Check if document is public
    if (document && !document.isPrivate) return "public"

    // Check if user has access
    if (userHasDocumentAccess(documentId)) return "granted"

    // Check if there's a pending request
    const pendingRequest = documentAccesses.find(
      (access) => access.documentId === documentId && access.userId === currentUser.id && access.status === "pending",
    )
    if (pendingRequest) return "pending"

    return "not-accessible"
  }

  // Format document type for display
  const formatDocumentType = (type: string) => {
    switch (type) {
      case "prescription":
        return "Prescription"
      case "medical_test":
        return "Test médical"
      case "invoice":
        return "Facture"
      case "report":
        return "Rapport"
      default:
        return "Autre"
    }
  }

  // Get users for sharing (mock)
  const availableUsers = [
    { id: 1, name: "John Doe (Patient)" },
    { id: 2, name: "Jane Smith (Médecin)" },
    { id: 3, name: "Alice Johnson (Secrétaire)" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAccessRequestsDialog(true)} className="gap-2">
            <Eye className="h-4 w-4" />
            Demandes d'accès
            {accessRequests.length > 0 && (
              <span className="ml-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {accessRequests.length}
              </span>
            )}
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Télécharger un document
          </Button>
        </div>
      </div>

      <Tabs defaultValue="my-documents" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-documents">Mes documents</TabsTrigger>
          <TabsTrigger value="shared-documents">Documents partagés</TabsTrigger>
        </TabsList>

        <TabsContent value="my-documents" className="space-y-4">
          {myDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {myDocuments.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="p-6 flex-1 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg flex items-center gap-2">
                            {document.name}
                            {document.isPrivate && <Lock className="h-4 w-4 text-amber-500" />}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">{formatDocumentType(document.type)}</span>
                            <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                            <span className="text-sm text-muted-foreground">
                              {document.fileType} • {document.fileSize}
                            </span>
                            <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(document.date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 md:p-6 flex items-center gap-2 md:flex-col md:items-end">
                        <Button variant="outline" size="sm" className="flex-1 md:w-full gap-2">
                          <Eye className="h-4 w-4" />
                          <span className="hidden md:inline">Visualiser</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 md:w-full gap-2">
                          <Download className="h-4 w-4" />
                          <span className="hidden md:inline">Télécharger</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:w-full gap-2"
                          onClick={() => {
                            setSelectedDocument(document.id)
                            setShowShareDialog(true)
                          }}
                        >
                          <Share className="h-4 w-4" />
                          <span className="hidden md:inline">Partager</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun document</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore téléchargé de documents</p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Télécharger un document
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shared-documents" className="space-y-4">
          {accessibleDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {accessibleDocuments.map((document) => {
                const accessStatus = getAccessStatus(document.id)

                return (
                  <Card key={document.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center">
                        <div className="p-6 flex-1 flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{document.name}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">{formatDocumentType(document.type)}</span>
                              <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                              <span className="text-sm text-muted-foreground">
                                {document.fileType} • {document.fileSize}
                              </span>
                              <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(document.date).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 md:p-6 md:flex-shrink-0">
                          {accessStatus === "granted" || accessStatus === "public" ? (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                <span className="hidden md:inline">Visualiser</span>
                              </Button>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden md:inline">Télécharger</span>
                              </Button>
                            </div>
                          ) : accessStatus === "pending" ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                              Demande en attente
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(document.id)
                                handleRequestAccess()
                              }}
                            >
                              Demander l'accès
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-4">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-lg">Aucun document partagé</h3>
                <p className="text-muted-foreground">Aucun document n'a été partagé avec vous pour le moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Télécharger un document</DialogTitle>
            <DialogDescription>Ajoutez un nouveau document médical à votre dossier</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du document *</Label>
              <Input
                id="name"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                placeholder="ex: Résultats d'analyse de sang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de document *</Label>
              <Select value={uploadForm.type} onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="medical_test">Test médical</SelectItem>
                  <SelectItem value="invoice">Facture</SelectItem>
                  <SelectItem value="report">Rapport</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Fichier *</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPrivate"
                checked={uploadForm.isPrivate}
                onCheckedChange={(checked) => setUploadForm({ ...uploadForm, isPrivate: checked })}
              />
              <Label htmlFor="isPrivate">Document privé (requiert une autorisation d'accès)</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                placeholder="Informations supplémentaires sur ce document"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUploadDocument}>Télécharger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Document Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Partager le document</DialogTitle>
            <DialogDescription>Accordez l'accès à ce document à d'autres utilisateurs</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Utilisateur *</Label>
              <Select
                value={shareForm.userId.toString()}
                onValueChange={(value) => setShareForm({ ...shareForm, userId: Number.parseInt(value) })}
              >
                <SelectTrigger id="userId">
                  <SelectValue placeholder="Sélectionnez un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDays">Durée d'accès</Label>
              <Select
                value={shareForm.expiryDays.toString()}
                onValueChange={(value) => setShareForm({ ...shareForm, expiryDays: Number.parseInt(value) })}
              >
                <SelectTrigger id="expiryDays">
                  <SelectValue placeholder="Sélectionnez une durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                  <SelectItem value="0">Illimité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                value={shareForm.message}
                onChange={(e) => setShareForm({ ...shareForm, message: e.target.value })}
                placeholder="Message pour le destinataire"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                // Mock implementation
                toast({
                  title: "Document partagé",
                  description: "L'utilisateur a été notifié et pourra accéder au document",
                })
                setShowShareDialog(false)
              }}
            >
              Partager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Requests Dialog */}
      <Dialog open={showAccessRequestsDialog} onOpenChange={setShowAccessRequestsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Demandes d'accès aux documents</DialogTitle>
            <DialogDescription>Gérez les demandes d'accès à vos documents</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {accessRequests.length > 0 ? (
              <div className="space-y-4">
                {accessRequests.map((access) => {
                  const document = documents.find((doc) => doc.id === access.documentId)
                  const requester =
                    document?.uploaderId === access.userId
                      ? "Le médecin qui a créé ce document"
                      : `Utilisateur #${access.userId}`

                  return (
                    <div key={access.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{document?.name || "Document inconnu"}</h3>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(access.grantedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{requester}</span> a demandé l'accès à ce document.
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleDenyAccess(access.id)}
                        >
                          <Ban className="h-4 w-4" />
                          Refuser
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => handleApproveAccess(access.id)}>
                          <Check className="h-4 w-4" />
                          Approuver
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="bg-gray-100 p-3 rounded-full mx-auto w-fit mb-4">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-medium text-lg">Aucune demande en attente</h3>
                <p className="text-muted-foreground">Vous n'avez pas de demandes d'accès en attente</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAccessRequestsDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
