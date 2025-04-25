"use client"

import { useTransition } from "react"
import { useAppContext } from "@/contexts/app-context"

export function useTransitionRefresh() {
  const [isPending, startTransition] = useTransition()
  const { refreshData } = useAppContext()

  const refresh = () => {
    startTransition(() => {
      refreshData()
    })
  }

  return {
    isPending,
    refresh,
  }
}
