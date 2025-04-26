"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Menu, X, FileText, Calendar, Bell, Activity, LogOut, Settings, Users, DropletIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserRole, logoutUser, getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)

    const user = getCurrentUser()
    if (user) {
      setUserName(`${user.firstName} ${user.lastName}`)
    }
  }, [])

  const handleLogout = () => {
    logoutUser()
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    })
    router.push("/")
  }

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: Activity },
    { name: "Dossier médical", href: "/dashboard/medical-record", icon: FileText },
    { name: "Rendez-vous", href: "/dashboard/appointments", icon: Calendar },
    { name: "Médicaments", href: "/dashboard/medications", icon: Bell },
  ]

  // Ajouter des éléments de navigation spécifiques au rôle
  if (userRole === "admin" || userRole === "doctor" || userRole === "secretary") {
    navigation.push({ name: "Patients", href: "/dashboard/patients", icon: Users })
  }

  if (userRole === "admin" || userRole === "doctor" || userRole === "secretary") {
    navigation.push({ name: "Dons de sang", href: "/dashboard/blood-donation", icon: DropletIcon })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-bold text-xl ml-2">SantéTogo</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  )}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href ? "text-teal-600" : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-5 w-5",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link href="/dashboard/profile" className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src="/placeholder.svg?height=36&width=36"
                    alt="Photo de profil"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {userName || "Utilisateur"}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Voir le profil</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 flex z-40 md:hidden", sidebarOpen ? "block" : "hidden")}>
        <div
          className={cn(
            "fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity",
            sidebarOpen ? "opacity-100 ease-out duration-300" : "opacity-0 ease-in duration-200",
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={cn(
            "relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white transition transform",
            sidebarOpen ? "translate-x-0 ease-out duration-300" : "-translate-x-full ease-in duration-200",
          )}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center px-4">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-bold text-xl ml-2">SantéTogo</span>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      pathname === item.href ? "text-teal-600" : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-5 w-5",
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link href="/dashboard/profile" className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src="/placeholder.svg?height=36&width=36"
                    alt="Photo de profil"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {userName || "Utilisateur"}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Voir le profil</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || "Tableau de bord"}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
