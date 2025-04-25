"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, MoreHorizontal, UserPlus, Lock } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { authMiddleware } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { User } from "@/types"

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    phoneNumber: "",
    specialty: "",
    hospital: "",
  })

  const { getAllUsers, addUser } = useAppContext()
  const { toast } = useToast()
  const router = useRouter()

  // Vérifier l'accès et rediriger si nécessaire
  useEffect(() => {
    if (!authMiddleware(["admin", "secretary"])) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [router, toast])

  // Récupérer les utilisateurs
  const allUsers = getAllUsers()

  // Filtrer les utilisateurs
  const filteredUsers = allUsers.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase()),
  )

  // Filtrer par onglet
  const tabFilteredUsers =
    activeTab === "all"
      ? filteredUsers
      : filteredUsers.filter((user) => user.role.toLowerCase() === activeTab.toLowerCase())

  const handleAddUser = () => {
    // Validation
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.password ||
      !newUser.phoneNumber ||
      !newUser.role
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }

    if (newUser.role === "doctor" && !newUser.specialty) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier une spécialité pour le médecin",
        variant: "destructive",
      })
      return
    }

    // Créer l'utilisateur
    try {
      const userData: Omit<User, "id"> = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as any,
        phoneNumber: newUser.phoneNumber,
      }

      if (newUser.role === "doctor") {
        userData.specialty = newUser.specialty
      }

      addUser(userData)

      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur a été créé avec succès",
      })

      // Réinitialiser le formulaire
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "patient",
        phoneNumber: "",
        specialty: "",
        hospital: "",
      })
      setShowAddUserDialog(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'utilisateur",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h2>
        <Button onClick={() => setShowAddUserDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="doctor">Médecins</TabsTrigger>
            <TabsTrigger value="secretary">Secrétaires</TabsTrigger>
            <TabsTrigger value="patient">Patients</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {tabFilteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabFilteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs 
                          ${user.role === "admin" ? "bg-rose-100 text-rose-800" : ""}
                          ${user.role === "doctor" ? "bg-blue-100 text-blue-800" : ""}
                          ${user.role === "secretary" ? "bg-amber-100 text-amber-800" : ""}
                          ${user.role === "patient" ? "bg-green-100 text-green-800" : ""}
                        `}
                      >
                        {user.role === "admin" && "Administrateur"}
                        {user.role === "doctor" && "Médecin"}
                        {user.role === "secretary" && "Secrétaire"}
                        {user.role === "patient" && "Patient"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Réinitialiser le mot de passe</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Modifier le profil</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="font-medium text-lg">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground">Aucun utilisateur ne correspond à votre recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue d'ajout d'utilisateur */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            <DialogDescription>Créez un compte pour un nouvel utilisateur du système</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone *</Label>
              <Input
                id="phoneNumber"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="secretary">Secrétaire</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newUser.role === "doctor" && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Spécialité *</Label>
                <Select
                  value={newUser.specialty}
                  onValueChange={(value) => setNewUser({ ...newUser, specialty: value })}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Sélectionnez une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Médecine générale">Médecine générale</SelectItem>
                    <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                    <SelectItem value="Dermatologie">Dermatologie</SelectItem>
                    <SelectItem value="Gynécologie">Gynécologie</SelectItem>
                    <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                    <SelectItem value="Ophtalmologie">Ophtalmologie</SelectItem>
                    <SelectItem value="Dentisterie">Dentisterie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hospital">Hôpital</Label>
              <Select value={newUser.hospital} onValueChange={(value) => setNewUser({ ...newUser, hospital: value })}>
                <SelectTrigger id="hospital">
                  <SelectValue placeholder="Sélectionnez un hôpital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centre Médical de Lomé">Centre Médical de Lomé</SelectItem>
                  <SelectItem value="Hôpital Universitaire de Lomé">Hôpital Universitaire de Lomé</SelectItem>
                  <SelectItem value="Clinique Internationale">Clinique Internationale</SelectItem>
                  <SelectItem value="Centre de Santé de Kara">Centre de Santé de Kara</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
