"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Ici, vous pouvez intégrer votre solution d'analytics
    // Par exemple, Google Analytics, Vercel Analytics, etc.
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    // Exemple d'envoi d'une vue de page
    console.log(`Page view: ${url}`)

    // Vous pourriez appeler votre service d'analytics ici
    // analytics.pageView(url)
  }, [pathname, searchParams])

  return null
}
