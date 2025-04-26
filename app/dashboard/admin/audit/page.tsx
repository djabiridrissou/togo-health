"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, User, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { authMiddleware } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function AuditLogPage() {
  const [search, setSearch] = useState("")
  const [entityType, setEntityType] = useState("all")
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Vérifier l'accès et rediriger si nécessaire
  useEffect(() => {
    if (!authMiddleware(["admin"])) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [router, toast])

  // Charger les logs d'audit
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        // Dans une implémentation réelle, cela serait un appel API
        // Pour l'instant, nous simulons des données
        const mockLogs = [
          {
            id: "1",
            userId: 2,
            userName: "Dr. Jane Smith",
            entityType: "patient",
            entityId: "1",
            entityName: "John Doe",
            action: "update",
            timestamp: "2023-06-15T10:30:00Z",
            changes: "Mise à jour des allergies",
          },
          {
            id: "2",
            userId: 3,
            userName: "Alice Johnson",
            entityType: "medical_record",
            entityId: "2",
            entityName: "Analyse de sang",
            action: "create",
            timestamp: "2023-06-14T14:45:00Z",
            changes: "Création d'un nouveau dossier médical",
          },
          {
            id: "3",
            userId: 2,
            userName: "Dr. Jane Smith",
            entityType: "patient",
            entityId: "5",
            entityName: "Marie Dupont",
            action: "update",
            timestamp: "2023-06-13T09:15:00Z",
            changes: "Mise à jour des informations de contact",
          },
        ]

        setAuditLogs(mockLogs)
        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des logs d'audit:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les logs d'audit",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [toast])

  // Filtrer les logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.entityName.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.changes.toLowerCase().includes(search.toLowerCase())

    const matchesType = entityType === "all" || log.entityType === entityType

    return matchesSearch && matchesType
  })

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

  // Obtenir la couleur en fonction de l'action
  const getActionColor = (action) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      case "delete":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Journal d'audit</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher dans les logs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type d'entité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="medical_record">Dossiers médicaux</SelectItem>
            <SelectItem value="appointment">Rendez-vous</SelectItem>
            <SelectItem value="medication">Médicaments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des modifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {log.entityType === "patient" ? (
                          <User className="h-4 w-4 text-gray-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <span>{log.entityName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(log.action)}`}>
                        {log.action === "create" && "Création"}
                        {log.action === "update" && "Modification"}
                        {log.action === "delete" && "Suppression"}
                      </span>
                    </TableCell>
                    <TableCell>{log.changes}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="font-medium text-lg">Aucun log d'audit trouvé</h3>
              <p className="text-muted-foreground">Aucun log ne correspond à votre recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
