"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Heart, Menu, X, Calendar, FileText, Pill, Droplet, Users, Home, LogOut } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { userRole, logout } = useAuth()

  const isAdmin = userRole === "admin"
  const isDoctor = userRole === "doctor"

  const navigation = [
    { name: "Accueil", href: "/dashboard", icon: Home },
    { name: "Rendez-vous", href: "/dashboard/appointments", icon: Calendar },
    { name: "Dossier médical", href: "/dashboard/medical-record", icon: FileText },
    { name: "Médicaments", href: "/dashboard/medications", icon: Pill },
    { name: "Don de sang", href: "/dashboard/blood-donation", icon: Droplet },
  ]

  // Ajouter des liens spécifiques aux rôles
  if (isAdmin) {
    navigation.push({ name: "Administration", href: "/dashboard/admin", icon: Users })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <div className={`fixed inset-0 z-40 flex ${sidebarOpen ? "block" : "hidden"}`}>
            <div
              className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setSidebarOpen(false)}
            ></div>

            <div
              className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Fermer le menu</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Heart className="h-8 w-8 text-rose-500" />
                  <span className="ml-2 text-xl font-bold">SantéTogo</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname === item.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`mr-4 h-6 w-6 ${
                          pathname === item.href ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                        }`}
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <Button variant="outline" className="w-full flex items-center" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="ml-2 text-xl font-bold">SantéTogo</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Button variant="outline" className="w-full flex items-center" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col">
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
            <button
              type="button"
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 flex justify-center px-4">
              <div className="flex-1 flex items-center justify-center">
                <Heart className="h-8 w-8 text-rose-500" />
                <span className="ml-2 text-xl font-bold">SantéTogo</span>
              </div>
            </div>
          </div>

          <main className="flex-1 pb-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
