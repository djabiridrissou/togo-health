"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, RefreshCw, Trash2, AlertTriangle, CheckCircle, Search } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { getActivityLogs, clearActivityLogs, type ActivityLog, type ActivityType, type ActivityTarget } from "@/lib/activity-log"

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    activityType: "" as ActivityType | "",
    activityTarget: "" as ActivityTarget | "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    searchTerm: "",
  })
  const { toast } = useToast()

  // Charger les journaux d'activité
  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const activityLogs = await getActivityLogs({
        activityType: filters.activityType || undefined,
        activityTarget: filters.activityTarget || undefined,
        startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
        endDate: filters.endDate ? filters.endDate.toISOString() : undefined,
      })
      
      // Appliquer le filtre de recherche
      let filteredLogs = activityLogs
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredLogs = activityLogs.filter(log => 
          (log.userEmail && log.userEmail.toLowerCase().includes(searchLower)) ||
          (log.details && log.details.toLowerCase().includes(searchLower)) ||
          (log.errorMessage && log.errorMessage.toLowerCase().includes(searchLower))
        )
      }
      
      setLogs(filteredLogs)
    } catch (error) {
      console.error("Erreur lors du chargement des journaux d'activité:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les journaux d'activité.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les journaux au démarrage
  useEffect(() => {
    loadLogs()
  }, [])

  // Recharger les journaux lorsque les filtres changent
  useEffect(() => {
    loadLogs()
  }, [filters.activityType, filters.activityTarget, filters.startDate, filters.endDate])

  // Effacer tous les journaux
  const handleClearLogs = async () => {
    if (confirm("Êtes-vous sûr de vouloir effacer tous les journaux d'activité ? Cette action est irréversible.")) {
      try {
        const success = await clearActivityLogs()
        if (success) {
          toast({
            title: "Journaux effacés",
            description: "Tous les journaux d'activité ont été effacés avec succès.",
          })
          setLogs([])
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'effacer les journaux d'activité.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erreur lors de l'effacement des journaux d'activité:", error)
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de l'effacement des journaux.",
          variant: "destructive",
        })
      }
    }
  }

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy HH:mm:ss", { locale: fr })
    } catch (error) {
      return dateString
    }
  }

  // Obtenir la classe CSS en fonction du statut de l'activité
  const getStatusClass = (success: boolean) => {
    return success
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }

  // Obtenir la classe CSS en fonction du type d'activité
  const getActivityTypeClass = (type: ActivityType) => {
    switch (type) {
      case "LOGIN":
      case "REGISTER":
        return "bg-blue-100 text-blue-800"
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-amber-100 text-amber-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "VIEW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AuthGuard allowedRoles={["admin", "ADMIN", "SYSTEM_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Journaux d'activité</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadLogs} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="destructive" onClick={handleClearLogs} disabled={isLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer tout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Filtrer les journaux d'activité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type d'activité</label>
                <Select
                  value={filters.activityType}
                  onValueChange={(value) => setFilters({ ...filters, activityType: value as ActivityType | "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
                    <SelectItem value="LOGIN">Connexion</SelectItem>
                    <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                    <SelectItem value="REGISTER">Inscription</SelectItem>
                    <SelectItem value="CREATE">Création</SelectItem>
                    <SelectItem value="UPDATE">Modification</SelectItem>
                    <SelectItem value="DELETE">Suppression</SelectItem>
                    <SelectItem value="VIEW">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Cible</label>
                <Select
                  value={filters.activityTarget}
                  onValueChange={(value) => setFilters({ ...filters, activityTarget: value as ActivityTarget | "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les cibles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les cibles</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="APPOINTMENT">Rendez-vous</SelectItem>
                    <SelectItem value="MEDICATION">Médicament</SelectItem>
                    <SelectItem value="MEDICAL_RECORD">Dossier médical</SelectItem>
                    <SelectItem value="BLOOD_DONATION">Don de sang</SelectItem>
                    <SelectItem value="BLOOD_REQUEST">Demande de sang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => setFilters({ ...filters, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => setFilters({ ...filters, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Recherche</label>
                <div className="flex">
                  <Input
                    placeholder="Rechercher..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    className="ml-2" 
                    onClick={() => loadLogs()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journaux ({logs.length})</CardTitle>
            <CardDescription>Historique des activités du système</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun journal d'activité trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Cible</TableHead>
                      <TableHead>Détails</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          {log.userEmail || "Anonyme"}
                          {log.userRole && <div className="text-xs text-gray-500">{log.userRole}</div>}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getActivityTypeClass(log.activityType)}`}>
                            {log.activityType}
                          </span>
                        </TableCell>
                        <TableCell>{log.activityTarget}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {log.details}
                          {log.errorMessage && (
                            <div className="text-xs text-red-500 mt-1">
                              Erreur: {log.errorMessage}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(log.success)}`}>
                              {log.success ? "Succès" : "Échec"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
