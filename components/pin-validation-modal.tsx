"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { verifyPatientPin } from "@/lib/actions/patient-actions"

interface PinValidationModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  onSuccess: () => void
  title?: string
  description?: string
}

export function PinValidationModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
  title = "Vérification d'identité",
  description = "Veuillez entrer votre code PIN pour accéder à votre dossier médical",
}: PinValidationModalProps) {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await verifyPatientPin(patientId, pin)

      if (result.success) {
        toast({
          title: "Vérification réussie",
          description: "Accès au dossier médical autorisé",
        })
        onSuccess()
      } else {
        setError("Code PIN incorrect. Veuillez réessayer.")
      }
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="pin"
              type="password"
              placeholder="Entrez votre code PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || pin.length < 4}>
              {isLoading ? "Vérification..." : "Valider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
