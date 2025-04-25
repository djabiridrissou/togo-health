"use client"

import { useAppContext } from "@/contexts/app-context"

export function LoadingIndicator() {
  const { isPending } = useAppContext()

  if (!isPending) return null

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
        <span>Chargement des données...</span>
      </div>
    </div>
  )
}
