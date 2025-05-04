"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, MapPin, Phone, Clock, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Clinic } from "@/lib/types"
import { cn } from "@/lib/utils"

// Définir l'interface pour l'objet Map de Leaflet
declare global {
  interface Window {
    L: any
  }
}

interface ClinicMapProps {
  initialClinics: Clinic[]
  userLocation?: { lat: number; lng: number } | null
}

export function ClinicMap({ initialClinics, userLocation }: ClinicMapProps) {
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Initialize map
  useEffect(() => {
    // Load Leaflet script dynamically
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    script.crossOrigin = ""
    script.async = true

    script.onload = () => {
      if (!map) {
        // Load CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)

        // Initialize map
        const initialLocation = userLocation || { lat: 48.8566, lng: 2.3522 } // Default to Paris if no user location
        const mapInstance = window.L.map("clinic-map").setView([initialLocation.lat, initialLocation.lng], 13)

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance)

        setMap(mapInstance)

        // Add user location marker if available
        if (userLocation) {
          const userIcon = window.L.divIcon({
            html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>`,
            className: "user-location-marker",
            iconSize: [20, 20],
          })

          window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(mapInstance)
            .bindTooltip("Votre position", { permanent: false })
        }

        setIsLoading(false)
      }
    }

    document.body.appendChild(script)

    return () => {
      if (map) {
        map.remove()
      }
      document.body.removeChild(script)
    }
  }, [])

  // Add clinic markers to map
  useEffect(() => {
    if (map && clinics.length > 0) {
      // Clear existing markers
      markers.forEach((marker) => marker.remove())
      const newMarkers: any[] = []

      // Add clinic markers
      clinics.forEach((clinic) => {
        if (clinic.latitude && clinic.longitude) {
          const clinicIcon = window.L.divIcon({
            html: `<div class="w-6 h-6 rounded-full bg-white border-2 border-primary shadow-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-primary">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>`,
            className: "clinic-marker",
            iconSize: [24, 24],
          })

          const marker = window.L.marker([clinic.latitude, clinic.longitude], { icon: clinicIcon })
            .addTo(map)
            .bindTooltip(clinic.name, { permanent: false })
            .on("click", () => {
              setSelectedClinic(clinic)
            })

          newMarkers.push(marker)
        }
      })

      setMarkers(newMarkers)

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        const group = window.L.featureGroup(newMarkers)
        map.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    }
  }, [map, clinics])

  // Filter clinics based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = initialClinics.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinic.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clinic.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setClinics(filtered)
    } else {
      setClinics(initialClinics)
    }
  }, [searchQuery, initialClinics])

  const handleViewClinic = (clinicId: string) => {
    router.push(`/clinics/${clinicId}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* Map */}
      <div className="md:col-span-2 relative">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <div id="clinic-map" className="h-full w-full rounded-md overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinic list */}
      <div className="h-full flex flex-col">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une clinique..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardContent className="flex-1 overflow-auto p-0">
            {clinics.length > 0 ? (
              <div className="divide-y">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedClinic?.id === clinic.id && "bg-muted",
                    )}
                    onClick={() => setSelectedClinic(clinic)}
                  >
                    <h3 className="font-medium">{clinic.name}</h3>
                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {clinic.address}, {clinic.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{clinic.phoneNumber}</span>
                      </div>
                      {clinic.openingHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{JSON.parse(clinic.openingHours).today || "Horaires non disponibles"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <Info className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium">Aucune clinique trouvée</h3>
                  <p className="text-sm text-muted-foreground">Essayez de modifier votre recherche</p>
                </div>
              </div>
            )}
          </CardContent>

          {selectedClinic && (
            <div className="p-4 border-t bg-muted/30">
              <h3 className="font-medium">{selectedClinic.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{selectedClinic.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`tel:${selectedClinic.phoneNumber}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
                <Button className="flex-1" onClick={() => handleViewClinic(selectedClinic.id)}>
                  Voir détails
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
