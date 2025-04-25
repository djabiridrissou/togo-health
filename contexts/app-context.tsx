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
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
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
  updatePatient: (id: number, patient: Partial<Patient>) => Promise<void>
  deletePatient: (id: number) => Promise<void>
  getUserAppointments: () => Appointment[]
  getUserMedications: () => Medication[]
  getUserMedicalRecords: () => MedicalRecord[]
  getUserBloodDonations: () => BloodDonation[]
  getUserBloodRequests: () => BloodRequest[]
  getDoctorPatients: () => Patient[]
  refreshData: () => Promise<void>
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
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [bloodDonations, setBloodDonations] = useState<BloodDonation[]>([])
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([])
  const [patients, setPatients] = useState<Patient[]>([])

  // Fonction pour charger toutes les données depuis la base de données
  const refreshData = async () => {
    try {
      const appointmentsData = await db.getAppointments()
      const medicationsData = await db.getMedications()
      const medicalRecordsData = await db.getMedicalRecords()
      const bloodDonationsData = await db.getBloodDonations()
      const bloodRequestsData = await db.getBloodRequests()
      const patientsData = await db.getPatients()

      setAppointments(appointmentsData)
      setMedications(medicationsData)
      setMedicalRecords(medicalRecordsData)
      setBloodDonations(bloodDonationsData)
      setBloodRequests(bloodRequestsData)
      setPatients(patientsData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    }
  }

  // Charger les données au démarrage
  useEffect(() => {
    refreshData()
  }, [])

  // Fonctions pour manipuler les rendez-vous
  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    await db.addAppointment(appointment)
    refreshData()
  }

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    await db.updateAppointment(id, appointment)
    refreshData()
  }

  const deleteAppointment = async (id: string) => {
    await db.deleteAppointment(id)
    refreshData()
  }

  // Fonctions pour manipuler les médicaments
  const addMedication = async (medication: Omit<Medication, "id">) => {
    await db.addMedication(medication)
    refreshData()
  }

  const updateMedication = async (id: string, medication: Partial<Medication>) => {
    await db.updateMedication(id, medication)
    refreshData()
  }

  const deleteMedication = async (id: string) => {
    await db.deleteMedication(id)
    refreshData()
  }

  // Fonctions pour manipuler les dossiers médicaux
  const addMedicalRecord = async (record: Omit<MedicalRecord, "id">) => {
    await db.addMedicalRecord(record)
    refreshData()
  }

  const updateMedicalRecord = async (id: string, record: Partial<MedicalRecord>) => {
    await db.updateMedicalRecord(id, record)
    refreshData()
  }

  const deleteMedicalRecord = async (id: string) => {
    await db.deleteMedicalRecord(id)
    refreshData()
  }

  // Fonctions pour manipuler les dons de sang
  const addBloodDonation = async (donation: Omit<BloodDonation, "id">) => {
    await db.addBloodDonation(donation)
    refreshData()
  }

  const updateBloodDonation = async (id: string, donation: Partial<BloodDonation>) => {
    await db.updateBloodDonation(id, donation)
    refreshData()
  }

  const deleteBloodDonation = async (id: string) => {
    await db.deleteBloodDonation(id)
    refreshData()
  }

  // Fonctions pour manipuler les demandes de sang
  const addBloodRequest = async (request: Omit<BloodRequest, "id">) => {
    await db.addBloodRequest(request)
    refreshData()
  }

  const updateBloodRequest = async (id: string, request: Partial<BloodRequest>) => {
    await db.updateBloodRequest(id, request)
    refreshData()
  }

  const deleteBloodRequest = async (id: string) => {
    await db.deleteBloodRequest(id)
    refreshData()
  }

  // Fonctions pour manipuler les patients
  const addPatient = async (patient: Omit<Patient, "id">) => {
    await db.addPatient(patient)
    refreshData()
  }

  const updatePatient = async (id: number, patient: Partial<Patient>) => {
    await db.updatePatient(id, patient)
    refreshData()
  }

  const deletePatient = async (id: number) => {
    await db.deletePatient(id)
    refreshData()
  }

  // Fonctions pour obtenir les données de l'utilisateur actuel
  const getUserAppointments = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return appointments.filter((appointment) => appointment.patientId === currentUser.id)
    } else if (currentUser.role === "doctor") {
      // Pour les médecins, retourner tous les rendez-vous avec leurs patients
      return appointments.filter((appointment) =>
        patients.some((patient) => patient.id === appointment.patientId && patient.doctorId === currentUser.id),
      )
    } else {
      // Pour les admins et secrétaires, retourner tous les rendez-vous
      return appointments
    }
  }

  const getUserMedications = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return medications.filter((medication) => medication.patientId === currentUser.id)
    } else if (currentUser.role === "doctor") {
      // Pour les médecins, retourner tous les médicaments de leurs patients
      return medications.filter((medication) =>
        patients.some((patient) => patient.id === medication.patientId && patient.doctorId === currentUser.id),
      )
    } else {
      // Pour les admins et secrétaires, retourner tous les médicaments
      return medications
    }
  }

  const getUserMedicalRecords = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return medicalRecords.filter((record) => record.patientId === currentUser.id)
    } else if (currentUser.role === "doctor" || currentUser.role === "secretary") {
      // Pour les médecins et secrétaires, retourner tous les dossiers médicaux de leurs patients
      if (currentUser.role === "doctor") {
        return medicalRecords.filter((record) =>
          patients.some((patient) => patient.id === record.patientId && patient.doctorId === currentUser.id),
        )
      } else {
        // Les secrétaires peuvent voir tous les dossiers médicaux
        return medicalRecords
      }
    } else {
      // Pour les admins, retourner tous les dossiers médicaux
      return medicalRecords
    }
  }

  const getUserBloodDonations = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return bloodDonations.filter((donation) => donation.donorId === currentUser.id)
    } else {
      // Pour les autres rôles, retourner tous les dons
      return bloodDonations
    }
  }

  const getUserBloodRequests = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return bloodRequests.filter((request) => request.requesterId === currentUser.id)
    } else {
      // Pour les autres rôles, retourner toutes les demandes
      return bloodRequests
    }
  }

  const getDoctorPatients = () => {
    const currentUser = getCurrentUser()
    if (!currentUser) return []

    if (currentUser.role === "doctor") {
      return patients.filter((patient) => patient.doctorId === currentUser.id)
    } else if (currentUser.role === "secretary" || currentUser.role === "admin") {
      // Les secrétaires et admins peuvent voir tous les patients
      return patients
    }

    return []
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
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
