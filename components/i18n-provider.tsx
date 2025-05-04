"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type Locale = "fr" | "en"

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

// Dictionnaires de traduction simplifiés
const translations: Record<Locale, Record<string, string>> = {
  fr: {
    "app.title": "HealthLink - Accès aux soins simplifié",
    "app.description": "Plateforme médicale sécurisée pour patients, médecins et cliniques",
    "nav.home": "Accueil",
    "nav.dashboard": "Tableau de bord",
    "nav.login": "Connexion",
    "nav.register": "Inscription",
    // Ajoutez d'autres traductions selon vos besoins
  },
  en: {
    "app.title": "HealthLink - Simplified Healthcare Access",
    "app.description": "Secure medical platform for patients, doctors and clinics",
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.login": "Login",
    "nav.register": "Register",
    // Ajoutez d'autres traductions selon vos besoins
  },
}

export function I18nProvider({ children, locale = "fr" }: { children: ReactNode; locale: string }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>((locale as Locale) || "fr")

  // Fonction pour changer la langue
  const setLocale = (newLocale: Locale) => {
    setCurrentLocale(newLocale)
    // Stocker la préférence de langue dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale)
    }
  }

  // Fonction de traduction
  const t = (key: string): string => {
    return translations[currentLocale]?.[key] || key
  }

  // Récupérer la préférence de langue depuis localStorage au chargement
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && ["fr", "en"].includes(savedLocale)) {
      setCurrentLocale(savedLocale)
    }
  }, [])

  return <I18nContext.Provider value={{ locale: currentLocale, setLocale, t }}>{children}</I18nContext.Provider>
}
