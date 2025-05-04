"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getCurrentUser } from "@/lib/auth"
import * as db from "@/lib/db"

// Types pour les différentes entités
export type Appointment = {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  type: string
  location: string
  mode: "in-person" | "virtual"
  notes?: string
  status: "scheduled" | "completed" | "cancelled"
  patientId: number
}

export type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  withFood: boolean
  notes: string
  status: "active" | "completed"
  adherence: number
  patientId: number
}

export type MedicalRecord = {
  id: string
  type: string
  date: string
  doctor: string
  specialty: string
  diagnosis: string
  notes: string
  documentUrl?: string
  patientId: number
}

export type BloodDonation = {
  id: string
  date: string
  location: string
  bloodType: string
  status: "scheduled" | "completed" | "cancelled"
  donorId: number
}

export type BloodRequest = {
  id: string
  bloodType: string
  hospital: string
  urgency: "high" | "medium" | "low"
  date: string
  quantity: string
  patientType: string
  reason: string
  status: "active" | "fulfilled" | "cancelled"
  contactPerson: string
  contactPhone: string
  requesterId: number
}

export type Patient = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role?: string
  bloodType?: string
  height?: string
  weight?: string
  allergies?: string[]
  chronicConditions?: string[]
  doctorId?: number
}

// Type pour le contexte
type AppContextType = {
  appointments: Appointment[]
  medications: Medication[]
  medicalRecords: MedicalRecord[]
  bloodDonations: BloodDonation[]
  bloodRequests: BloodRequest[]
  patients: Patient[]
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  addMedication: (medication: Omit<Medication, "id">) => Promise<void>
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>
  deleteMedication: (id: string) => Promise<void>
  addMedicalRecord: (record: Omit<MedicalRecord, "id">) => Promise<void>
  updateMedicalRecord: (id: string, record: Partial<MedicalRecord>) => Promise<void>
  deleteMedicalRecord: (id: string) => Promise<void>
  addBloodDonation: (donation: Omit<BloodDonation, "id">) => Promise<void>
  updateBloodDonation: (id: string, donation: Partial<BloodDonation>) => Promise<void>
  deleteBloodDonation: (id: string) => Promise<void>
  addBloodRequest: (request: Omit<BloodRequest, "id">) => Promise<void>
  updateBloodRequest: (id: string, request: Partial<BloodRequest>) => Promise<void>
  deleteBloodRequest: (id: string) => Promise<void>
  addPatient: (patient: Omit<Patient, "id">) => Promise<void>
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  getUserAppointments: () => Appointment[]
  getUserMedications: () => Medication[]
  getUserMedicalRecords: () => MedicalRecord[]
  getUserBloodDonations: () => BloodDonation[]
  getUserBloodRequests: () => BloodRequest[]
  getDoctorPatients: () => Patient[]
  getUserById: (id: string) => Patient | undefined
  updateUser: (id: string, userData: Partial<Patient>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
  refreshData: () => Promise<void>
  isLoading: boolean
}

// Données de démonstration pour garantir que l'interface fonctionne même sans base de données
const demoData = {
  appointments: [
    {
      id: "demo1",
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      type: "Consultation générale",
      location: "Centre Médical de Lomé",
      mode: "in-person" as const,
      status: "scheduled" as const,
      patientId: 1,
    },
    {
      id: "demo2",
      doctor: "Dr. Ama Diallo",
      specialty: "Cardiologie",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "14:30",
      type: "Suivi cardiologique",
      location: "Hôpital Universitaire de Lomé",
      mode: "in-person" as const,
      status: "scheduled" as const,
      patientId: 1,
    },
    {
      id: "demo3",
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "09:15",
      type: "Consultation générale",
      location: "Centre Médical de Lomé",
      mode: "in-person" as const,
      notes: "Prescription d'antibiotiques pour une infection respiratoire.",
      status: "completed" as const,
      patientId: 1,
    },
  ],
  medications: [
    {
      id: "demo1",
      name: "Paracétamol",
      dosage: "500mg",
      frequency: "3 fois par jour",
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      withFood: true,
      notes: "Prendre après les repas",
      status: "active" as const,
      adherence: 90,
      patientId: 1,
    },
    {
      id: "demo2",
      name: "Amoxicilline",
      dosage: "250mg",
      frequency: "2 fois par jour",
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      withFood: false,
      notes: "Prendre à jeun",
      status: "active" as const,
      adherence: 100,
      patientId: 1,
    },
  ],
  bloodRequests: [
    {
      id: "demo1",
      bloodType: "A+",
      hospital: "Hôpital Universitaire de Lomé",
      urgency: "high" as const,
      date: new Date().toISOString().split("T")[0],
      quantity: "3 unités",
      patientType: "Adulte",
      reason: "Intervention chirurgicale",
      status: "active" as const,
      contactPerson: "Dr. Kofi Mensah",
      contactPhone: "+228 90123456",
      requesterId: 2,
    },
    {
      id: "demo2",
      bloodType: "O-",
      hospital: "Centre Médical de Kara",
      urgency: "medium" as const,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      quantity: "2 unités",
      patientType: "Enfant",
      reason: "Anémie sévère",
      status: "active" as const,
      contactPerson: "Dr. Ama Diallo",
      contactPhone: "+228 91234567",
      requesterId: 2,
    },
  ],
  bloodDonations: [
    {
      id: "demo1",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      location: "Centre de Transfusion Sanguine de Lomé",
      bloodType: "A+",
      status: "completed" as const,
      donorId: 1,
    },
    {
      id: "demo2",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      location: "Hôpital Universitaire de Lomé",
      bloodType: "A+",
      status: "scheduled" as const,
      donorId: 1,
    },
  ],
  medicalRecords: [
    {
      id: "demo1",
      type: "consultation",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      diagnosis: "Infection respiratoire",
      notes: "Prescription d'antibiotiques pour 7 jours. Repos recommandé.",
      patientId: 1,
    },
    {
      id: "demo2",
      type: "test",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      diagnosis: "Analyse de sang",
      notes: "Légère anémie. Supplémentation en fer recommandée.",
      documentUrl: "#",
      patientId: 1,
    },
  ],
  patients: [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "patient@example.com",
      phoneNumber: "+228 90123456",
      role: "patient",
      bloodType: "A+",
      height: "175 cm",
      weight: "70 kg",
      allergies: ["Pénicilline", "Arachides"],
      chronicConditions: ["Asthme"],
      doctorId: 2,
    },
    {
      id: "2",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie@example.com",
      phoneNumber: "+228 94567890",
      role: "patient",
      bloodType: "B+",
      height: "165 cm",
      weight: "60 kg",
      allergies: ["Lactose"],
      chronicConditions: [],
      doctorId: 2,
    },
    {
      id: "3",
      firstName: "Dr. Kofi",
      lastName: "Mensah",
      email: "medecin@example.com",
      phoneNumber: "+228 91234567",
      role: "doctor",
    },
    {
      id: "4",
      firstName: "Admin",
      lastName: "Système",
      email: "admin@example.com",
      phoneNumber: "+228 92345678",
      role: "admin",
    },
  ],
}

// Création du contexte
const AppContext = createContext<AppContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

// Fournisseur du contexte
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // États pour chaque type de données
  const [appointments, setAppointments] = useState<Appointment[]>(demoData.appointments)
  const [medications, setMedications] = useState<Medication[]>(demoData.medications)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(demoData.medicalRecords)
  const [bloodDonations, setBloodDonations] = useState<BloodDonation[]>(demoData.bloodDonations)
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(demoData.bloodRequests)
  const [patients, setPatients] = useState<Patient[]>(demoData.patients)
  const [isLoading, setIsLoading] = useState(true)

  // Fonction pour charger toutes les données depuis la base de données
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const appointmentsData = await db.getAppointments()
      const medicationsData = await db.getMedications()
      const medicalRecordsData = await db.getMedicalRecords()
      const bloodDonationsData = await db.getBloodDonations()
      const bloodRequestsData = await db.getBloodRequests()
      const patientsData = await db.getPatients()

      // Utiliser les données de la base de données si elles existent, sinon utiliser les données de démonstration
      setAppointments(appointmentsData.length > 0 ? appointmentsData : demoData.appointments)
      setMedications(medicationsData.length > 0 ? medicationsData : demoData.medications)
      setMedicalRecords(medicalRecordsData.length > 0 ? medicalRecordsData : demoData.medicalRecords)
      setBloodDonations(bloodDonationsData.length > 0 ? bloodDonationsData : demoData.bloodDonations)
      setBloodRequests(bloodRequestsData.length > 0 ? bloodRequestsData : demoData.bloodRequests)
      setPatients(patientsData.length > 0 ? patientsData : demoData.patients)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      // En cas d'erreur, utiliser les données de démonstration
      setAppointments(demoData.appointments)
      setMedications(demoData.medications)
      setMedicalRecords(demoData.medicalRecords)
      setBloodDonations(demoData.bloodDonations)
      setBloodRequests(demoData.bloodRequests)
      setPatients(demoData.patients)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au démarrage
  useEffect(() => {
    refreshData()
  }, [])

  // Fonctions pour manipuler les rendez-vous
  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    try {
      // Importer la fonction de journalisation
      const { logActivity } = await import("@/lib/activity-log")

      // Ajouter le rendez-vous dans la base de données
      const id = await db.addAppointment(appointment)

      // Journaliser l'action
      await logActivity(
        "CREATE",
        "APPOINTMENT",
        id,
        `Création d'un rendez-vous avec ${appointment.doctor} le ${appointment.date}`,
        true
      )

      refreshData()
    } catch (error) {
      console.error("Erreur lors de l'ajout du rendez-vous:", error)

      // Journaliser l'erreur
      try {
        const { logActivity } = await import("@/lib/activity-log")
        await logActivity(
          "CREATE",
          "APPOINTMENT",
          undefined,
          `Erreur lors de la création d'un rendez-vous`,
          false,
          error instanceof Error ? error.message : "Erreur inconnue"
        )
      } catch (logError) {
        console.error("Erreur lors de la journalisation:", logError)
      }

      // Ajouter localement en cas d'erreur
      const newAppointment = {
        ...appointment,
        id: `local-${Date.now()}`,
      }
      setAppointments((prev) => [...prev, newAppointment as Appointment])
    }
  }

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    try {
      // Importer la fonction de journalisation
      const { logActivity } = await import("@/lib/activity-log")

      // Mettre à jour le rendez-vous dans la base de données
      await db.updateAppointment(id, appointment)

      // Journaliser l'action
      await logActivity(
        "UPDATE",
        "APPOINTMENT",
        id,
        `Mise à jour d'un rendez-vous${appointment.status ? ` (statut: ${appointment.status})` : ''}`,
        true
      )

      refreshData()
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous:", error)

      // Journaliser l'erreur
      try {
        const { logActivity } = await import("@/lib/activity-log")
        await logActivity(
          "UPDATE",
          "APPOINTMENT",
          id,
          `Erreur lors de la mise à jour d'un rendez-vous`,
          false,
          error instanceof Error ? error.message : "Erreur inconnue"
        )
      } catch (logError) {
        console.error("Erreur lors de la journalisation:", logError)
      }

      // Mettre à jour localement en cas d'erreur
      setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, ...appointment } : item)))
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      // Importer la fonction de journalisation
      const { logActivity } = await import("@/lib/activity-log")

      // Récupérer les informations du rendez-vous avant de le supprimer
      const appointment = appointments.find(a => a.id === id)

      // Supprimer le rendez-vous de la base de données
      await db.deleteAppointment(id)

      // Journaliser l'action
      await logActivity(
        "DELETE",
        "APPOINTMENT",
        id,
        `Suppression d'un rendez-vous${appointment ? ` avec ${appointment.doctor} le ${appointment.date}` : ''}`,
        true
      )

      refreshData()
    } catch (error) {
      console.error("Erreur lors de la suppression du rendez-vous:", error)

      // Journaliser l'erreur
      try {
        const { logActivity } = await import("@/lib/activity-log")
        await logActivity(
          "DELETE",
          "APPOINTMENT",
          id,
          `Erreur lors de la suppression d'un rendez-vous`,
          false,
          error instanceof Error ? error.message : "Erreur inconnue"
        )
      } catch (logError) {
        console.error("Erreur lors de la journalisation:", logError)
      }

      // Supprimer localement en cas d'erreur
      setAppointments((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // Fonctions pour manipuler les médicaments
  const addMedication = async (medication: Omit<Medication, "id">) => {
    try {
      await db.addMedication(medication)
    } catch (error) {
      console.error("Erreur lors de l'ajout du médicament:", error)
      // Ajouter localement en cas d'erreur
      const newMedication = {
        ...medication,
        id: `local-${Date.now()}`,
      }
      setMedications((prev) => [...prev, newMedication as Medication])
      return
    }
    refreshData()
  }

  const updateMedication = async (id: string, medication: Partial<Medication>) => {
    try {
      await db.updateMedication(id, medication)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du médicament:", error)
      // Mettre à jour localement en cas d'erreur
      setMedications((prev) => prev.map((item) => (item.id === id ? { ...item, ...medication } : item)))
      return
    }
    refreshData()
  }

  const deleteMedication = async (id: string) => {
    try {
      await db.deleteMedication(id)
    } catch (error) {
      console.error("Erreur lors de la suppression du médicament:", error)
      // Supprimer localement en cas d'erreur
      setMedications((prev) => prev.filter((item) => item.id !== id))
      return
    }
    refreshData()
  }

  // Fonctions pour manipuler les dossiers médicaux
  const addMedicalRecord = async (record: Omit<MedicalRecord, "id">) => {
    try {
      await db.addMedicalRecord(record)
    } catch (error) {
      console.error("Erreur lors de l'ajout du dossier médical:", error)
      // Ajouter localement en cas d'erreur
      const newRecord = {
        ...record,
        id: `local-${Date.now()}`,
      }
      setMedicalRecords((prev) => [...prev, newRecord as MedicalRecord])
      return
    }
    refreshData()
  }

  const updateMedicalRecord = async (id: string, record: Partial<MedicalRecord>) => {
    try {
      await db.updateMedicalRecord(id, record)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du dossier médical:", error)
      // Mettre à jour localement en cas d'erreur
      setMedicalRecords((prev) => prev.map((item) => (item.id === id ? { ...item, ...record } : item)))
      return
    }
    refreshData()
  }

  const deleteMedicalRecord = async (id: string) => {
    try {
      await db.deleteMedicalRecord(id)
    } catch (error) {
      console.error("Erreur lors de la suppression du dossier médical:", error)
      // Supprimer localement en cas d'erreur
      setMedicalRecords((prev) => prev.filter((item) => item.id !== id))
      return
    }
    refreshData()
  }

  // Fonctions pour manipuler les dons de sang
  const addBloodDonation = async (donation: Omit<BloodDonation, "id">) => {
    try {
      await db.addBloodDonation(donation)
    } catch (error) {
      console.error("Erreur lors de l'ajout du don de sang:", error)
      // Ajouter localement en cas d'erreur
      const newDonation = {
        ...donation,
        id: `local-${Date.now()}`,
      }
      setBloodDonations((prev) => [...prev, newDonation as BloodDonation])
      return
    }
    refreshData()
  }

  const updateBloodDonation = async (id: string, donation: Partial<BloodDonation>) => {
    try {
      await db.updateBloodDonation(id, donation)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du don de sang:", error)
      // Mettre à jour localement en cas d'erreur
      setBloodDonations((prev) => prev.map((item) => (item.id === id ? { ...item, ...donation } : item)))
      return
    }
    refreshData()
  }

  const deleteBloodDonation = async (id: string) => {
    try {
      await db.deleteBloodDonation(id)
    } catch (error) {
      console.error("Erreur lors de la suppression du don de sang:", error)
      // Supprimer localement en cas d'erreur
      setBloodDonations((prev) => prev.filter((item) => item.id !== id))
      return
    }
    refreshData()
  }

  // Fonctions pour manipuler les demandes de sang
  const addBloodRequest = async (request: Omit<BloodRequest, "id">) => {
    try {
      await db.addBloodRequest(request)
    } catch (error) {
      console.error("Erreur lors de l'ajout de la demande de sang:", error)
      // Ajouter localement en cas d'erreur
      const newRequest = {
        ...request,
        id: `local-${Date.now()}`,
      }
      setBloodRequests((prev) => [...prev, newRequest as BloodRequest])
      return
    }
    refreshData()
  }

  const updateBloodRequest = async (id: string, request: Partial<BloodRequest>) => {
    try {
      await db.updateBloodRequest(id, request)
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la demande de sang:", error)
      // Mettre à jour localement en cas d'erreur
      setBloodRequests((prev) => prev.map((item) => (item.id === id ? { ...item, ...request } : item)))
      return
    }
    refreshData()
  }

  const deleteBloodRequest = async (id: string) => {
    try {
      await db.deleteBloodRequest(id)
    } catch (error) {
      console.error("Erreur lors de la suppression de la demande de sang:", error)
      // Supprimer localement en cas d'erreur
      setBloodRequests((prev) => prev.filter((item) => item.id !== id))
      return
    }
    refreshData()
  }

  // Fonctions pour manipuler les patients
  const addPatient = async (patient: Omit<Patient, "id">) => {
    try {
      await db.addPatient(patient)
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient:", error)
      // Ajouter localement en cas d'erreur
      const newPatient = {
        ...patient,
        id: `local-${Date.now()}`,
      }
      setPatients((prev) => [...prev, newPatient as Patient])
      return
    }
    refreshData()
  }

  const updatePatient = async (id: string, patient: Partial<Patient>) => {
    try {
      await db.updatePatient(id, patient)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du patient:", error)
      // Mettre à jour localement en cas d'erreur
      setPatients((prev) => prev.map((item) => (item.id === id ? { ...item, ...patient } : item)))
      return
    }
    refreshData()
  }

  const deletePatient = async (id: string) => {
    try {
      await db.deletePatient(id)
    } catch (error) {
      console.error("Erreur lors de la suppression du patient:", error)
      // Supprimer localement en cas d'erreur
      setPatients((prev) => prev.filter((item) => item.id !== id))
      return
    }
    refreshData()
  }

  // Fonctions pour la gestion des utilisateurs
  const getUserById = (id: string) => {
    return patients.find((patient) => patient.id === id)
  }

  const updateUser = async (id: string, userData: Partial<Patient>): Promise<boolean> => {
    try {
      await db.updateUser(id, userData)
      refreshData()
      return true
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
      // Mettre à jour localement en cas d'erreur
      setPatients((prev) => prev.map((item) => (item.id === id ? { ...item, ...userData } : item)))
      return true // Pour la démo, on retourne true même en cas d'erreur
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await db.deleteUser(id)
      refreshData()
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      // Supprimer localement en cas d'erreur
      setPatients((prev) => prev.filter((item) => item.id !== id))
      return true // Pour la démo, on retourne true même en cas d'erreur
    }
  }

  // Fonctions pour obtenir les données de l'utilisateur actuel
  const getUserAppointments = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    // Pour les besoins de démonstration, retourner tous les rendez-vous
    // Cela garantit que l'interface est toujours fonctionnelle
    return appointments
  }

  const getUserMedications = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    // Pour les besoins de démonstration, retourner tous les médicaments
    return medications
  }

  const getUserMedicalRecords = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    // Pour les besoins de démonstration, retourner tous les dossiers médicaux
    return medicalRecords
  }

  const getUserBloodDonations = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    // Pour les besoins de démonstration, retourner tous les dons de sang
    return bloodDonations
  }

  const getUserBloodRequests = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    // Pour les besoins de démonstration, retourner toutes les demandes de sang
    return bloodRequests
  }

  const getDoctorPatients = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    // Pour les besoins de démonstration, retourner tous les patients
    return patients
  }

  return (
    <AppContext.Provider
      value={{
        appointments,
        medications,
        medicalRecords,
        bloodDonations,
        bloodRequests,
        patients,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addMedication,
        updateMedication,
        deleteMedication,
        addMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        addBloodDonation,
        updateBloodDonation,
        deleteBloodDonation,
        addBloodRequest,
        updateBloodRequest,
        deleteBloodRequest,
        addPatient,
        updatePatient,
        deletePatient,
        getUserAppointments,
        getUserMedications,
        getUserMedicalRecords,
        getUserBloodDonations,
        getUserBloodRequests,
        getDoctorPatients,
        getUserById,
        updateUser,
        deleteUser,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
