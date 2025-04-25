"use client"

import { createContext, useContext, useState, useEffect, useTransition, type ReactNode } from "react"
import { getCurrentUser } from "@/lib/auth"
import * as dataStore from "@/lib/in-memory-store"
import type { User, Document } from "@/types"

// Define types for data used in the app
export interface Appointment {
  id: string
  doctor: string
  doctorId: number
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

export interface Medication {
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

export interface MedicalRecord {
  id: string
  type: string
  date: string
  doctor: string
  doctorId: number
  specialty: string
  diagnosis: string
  notes: string
  documentUrl?: string
  patientId: number
}

export interface BloodDonation {
  id: string
  date: string
  location: string
  bloodType: string
  status: "scheduled" | "completed" | "cancelled"
  donorId: number
}

export interface BloodRequest {
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

export interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  bloodType?: string
  height?: string
  weight?: string
  allergies: string[]
  chronicConditions: string[]
  doctorId?: number
}

export interface DocumentAccess {
  id: string
  documentId: string
  userId: number
  grantedBy: number
  grantedAt: string
  expiresAt?: string
  status: "pending" | "approved" | "denied" | "revoked"
}

export interface Notification {
  id: string
  userId: number
  title: string
  message: string
  date: string
  isRead: boolean
  type: "appointment" | "medication" | "document" | "blood_donation" | "other"
  relatedId?: string
}

// Type for the context
type AppContextType = {
  currentUser: User | null
  appointments: Appointment[]
  medications: Medication[]
  medicalRecords: MedicalRecord[]
  bloodDonations: BloodDonation[]
  bloodRequests: BloodRequest[]
  patients: Patient[]
  documents: Document[]
  documentAccesses: DocumentAccess[]
  notifications: Notification[]
  isPending: boolean

  // Appointment operations
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  getUserAppointments: () => Appointment[]

  // Medication operations
  addMedication: (medication: Omit<Medication, "id">) => Promise<void>
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>
  deleteMedication: (id: string) => Promise<void>
  getUserMedications: () => Medication[]

  // Medical record operations
  addMedicalRecord: (record: Omit<MedicalRecord, "id">) => Promise<void>
  updateMedicalRecord: (id: string, record: Partial<MedicalRecord>) => Promise<void>
  deleteMedicalRecord: (id: string) => Promise<void>
  getUserMedicalRecords: () => MedicalRecord[]

  // Blood donation operations
  addBloodDonation: (donation: Omit<BloodDonation, "id">) => Promise<void>
  updateBloodDonation: (id: string, donation: Partial<BloodDonation>) => Promise<void>
  deleteBloodDonation: (id: string) => Promise<void>
  getUserBloodDonations: () => BloodDonation[]

  // Blood request operations
  addBloodRequest: (request: Omit<BloodRequest, "id">) => Promise<void>
  updateBloodRequest: (id: string, request: Partial<BloodRequest>) => Promise<void>
  deleteBloodRequest: (id: string) => Promise<void>
  getUserBloodRequests: () => BloodRequest[]

  // Patient operations
  addPatient: (patient: Omit<Patient, "id">) => Promise<void>
  updatePatient: (id: number, patient: Partial<Patient>) => Promise<void>
  deletePatient: (id: number) => Promise<void>
  getDoctorPatients: () => Patient[]

  // Document operations
  addDocument: (document: Omit<Document, "id">) => Promise<void>
  updateDocument: (id: string, document: Partial<Document>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  getUserDocuments: () => Document[]
  getAccessibleDocuments: () => Document[]
  userHasDocumentAccess: (documentId: string) => boolean

  // Document access operations
  requestDocumentAccess: (documentId: string, userId: number) => Promise<void>
  approveDocumentAccess: (accessId: string) => Promise<void>
  denyDocumentAccess: (accessId: string) => Promise<void>
  revokeDocumentAccess: (accessId: string) => Promise<void>
  getUserDocumentAccesses: () => DocumentAccess[]

  // Notification operations
  getUserNotifications: () => Notification[]
  markNotificationAsRead: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>

  // General operations
  refreshData: () => Promise<void>

  getAllUsers: () => User[]
  getUserById: (id: number) => User | undefined
  updateUserProfile: (id: number, userData: Partial<User>) => Promise<boolean>
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // State for user and data
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [bloodDonations, setBloodDonations] = useState<BloodDonation[]>([])
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentAccesses, setDocumentAccesses] = useState<DocumentAccess[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState<User[]>(dataStore.getAllUsers())

  // Function to refresh all data
  const refreshData = async () => {
    try {
      const user = getCurrentUser()

      startTransition(() => {
        setCurrentUser(user)
        setAppointments(dataStore.getAllAppointments())
        setMedications(dataStore.getAllMedications())
        setMedicalRecords(dataStore.getAllMedicalRecords())
        setBloodDonations(dataStore.getAllBloodDonations())
        setBloodRequests(dataStore.getAllBloodRequests())
        setPatients(dataStore.getAllPatients())
        setDocuments(dataStore.getAllDocuments())
        setDocumentAccesses(dataStore.getAllDocumentAccesses())
        setNotifications(dataStore.getAllNotifications())
        setUsers(dataStore.getAllUsers())
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  // Load data on mount and set up a refresh interval
  useEffect(() => {
    refreshData()

    // Refresh data every 30 seconds
    const intervalId = setInterval(refreshData, 30000)
    return () => clearInterval(intervalId)
  }, [])

  // Appointment operations
  const addAppointment = async (appointment: Omit<Appointment, "id">) => {
    dataStore.addAppointment(appointment)
    await refreshData()
  }

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    dataStore.updateAppointment(id, appointment)
    await refreshData()
  }

  const deleteAppointment = async (id: string) => {
    dataStore.deleteAppointment(id)
    await refreshData()
  }

  const getUserAppointments = () => {
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return appointments.filter((appointment) => appointment.patientId === currentUser.id)
    } else if (currentUser.role === "doctor") {
      return appointments.filter((appointment) => appointment.doctorId === currentUser.id)
    } else {
      // Admin and secretary see all appointments
      return appointments
    }
  }

  // Medication operations
  const addMedication = async (medication: Omit<Medication, "id">) => {
    dataStore.addMedication(medication)
    await refreshData()
  }

  const updateMedication = async (id: string, medication: Partial<Medication>) => {
    dataStore.updateMedication(id, medication)
    await refreshData()
  }

  const deleteMedication = async (id: string) => {
    dataStore.deleteMedication(id)
    await refreshData()
  }

  const getUserMedications = () => {
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return medications.filter((medication) => medication.patientId === currentUser.id)
    } else if (currentUser.role === "doctor") {
      // For doctors, return medications for their patients
      const doctorPatients = patients.filter((patient) => patient.doctorId === currentUser.id)
      const patientIds = doctorPatients.map((patient) => patient.id)
      return medications.filter((medication) => patientIds.includes(medication.patientId))
    } else {
      // Admin and secretary see all medications
      return medications
    }
  }

  // Medical record operations
  const addMedicalRecord = async (record: Omit<MedicalRecord, "id">) => {
    dataStore.addMedicalRecord(record)
    await refreshData()
  }

  const updateMedicalRecord = async (id: string, record: Partial<MedicalRecord>) => {
    dataStore.updateMedicalRecord(id, record)
    await refreshData()
  }

  const deleteMedicalRecord = async (id: string) => {
    dataStore.deleteMedicalRecord(id)
    await refreshData()
  }

  const getUserMedicalRecords = () => {
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return medicalRecords.filter((record) => record.patientId === currentUser.id)
    } else if (currentUser.role === "doctor") {
      // For doctors, show records for their patients
      const doctorPatients = patients.filter((patient) => patient.doctorId === currentUser.id)
      const patientIds = doctorPatients.map((patient) => patient.id)
      return medicalRecords.filter((record) => patientIds.includes(record.patientId))
    } else {
      // Admin and secretary see all records
      return medicalRecords
    }
  }

  // Blood donation operations
  const addBloodDonation = async (donation: Omit<BloodDonation, "id">) => {
    dataStore.addBloodDonation(donation)
    await refreshData()
  }

  const updateBloodDonation = async (id: string, donation: Partial<BloodDonation>) => {
    dataStore.updateBloodDonation(id, donation)
    await refreshData()
  }

  const deleteBloodDonation = async (id: string) => {
    dataStore.deleteBloodDonation(id)
    await refreshData()
  }

  const getUserBloodDonations = () => {
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return bloodDonations.filter((donation) => donation.donorId === currentUser.id)
    } else {
      // Other roles see all donations
      return bloodDonations
    }
  }

  // Blood request operations
  const addBloodRequest = async (request: Omit<BloodRequest, "id">) => {
    dataStore.addBloodRequest(request)
    await refreshData()
  }

  const updateBloodRequest = async (id: string, request: Partial<BloodRequest>) => {
    dataStore.updateBloodRequest(id, request)
    await refreshData()
  }

  const deleteBloodRequest = async (id: string) => {
    dataStore.deleteBloodRequest(id)
    await refreshData()
  }

  const getUserBloodRequests = () => {
    if (!currentUser) return []

    if (currentUser.role === "patient") {
      return bloodRequests.filter((request) => request.requesterId === currentUser.id)
    } else {
      // Other roles see all requests
      return bloodRequests
    }
  }

  // Patient operations
  const addPatient = async (patient: Omit<Patient, "id">) => {
    dataStore.addPatient(patient)
    await refreshData()
  }

  const updatePatient = async (id: number, patient: Partial<Patient>) => {
    dataStore.updatePatient(id, patient)
    await refreshData()
  }

  const deletePatient = async (id: number) => {
    dataStore.deletePatient(id)
    await refreshData()
  }

  const getDoctorPatients = () => {
    if (!currentUser) return []

    if (currentUser.role === "doctor") {
      return patients.filter((patient) => patient.doctorId === currentUser.id)
    } else if (currentUser.role === "secretary" || currentUser.role === "admin") {
      // Secretary and admin see all patients
      return patients
    }

    return []
  }

  // Document operations
  const addDocument = async (document: Omit<Document, "id">) => {
    dataStore.addDocument(document)
    await refreshData()
  }

  const updateDocument = async (id: string, document: Partial<Document>) => {
    dataStore.updateDocument(id, document)
    await refreshData()
  }

  const deleteDocument = async (id: string) => {
    dataStore.deleteDocument(id)
    await refreshData()
  }

  const getUserDocuments = () => {
    if (!currentUser) return []

    // Documents owned by the user
    return documents.filter((doc) => doc.ownerId === currentUser.id)
  }

  const getAccessibleDocuments = () => {
    if (!currentUser) return []

    return dataStore.getAccessibleDocumentsForUser(currentUser.id)
  }

  const userHasDocumentAccess = (documentId: string) => {
    if (!currentUser) return false

    return dataStore.userHasDocumentAccess(currentUser.id, documentId)
  }

  // Document access operations
  const requestDocumentAccess = async (documentId: string, userId: number) => {
    if (!currentUser) return

    const accessData: Omit<DocumentAccess, "id"> = {
      documentId,
      userId,
      grantedBy: currentUser.id,
      grantedAt: new Date().toISOString(),
      status: "pending",
    }

    dataStore.addDocumentAccess(accessData)
    await refreshData()
  }

  const approveDocumentAccess = async (accessId: string) => {
    dataStore.updateDocumentAccess(accessId, {
      status: "approved",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    })
    await refreshData()
  }

  const denyDocumentAccess = async (accessId: string) => {
    dataStore.updateDocumentAccess(accessId, { status: "denied" })
    await refreshData()
  }

  const revokeDocumentAccess = async (accessId: string) => {
    dataStore.updateDocumentAccess(accessId, { status: "revoked" })
    await refreshData()
  }

  const getUserDocumentAccesses = () => {
    if (!currentUser) return []

    // For patients: access requests received or granted
    if (currentUser.role === "patient") {
      const ownedDocIds = documents.filter((doc) => doc.ownerId === currentUser.id).map((doc) => doc.id)

      return documentAccesses.filter(
        (access) => ownedDocIds.includes(access.documentId) || access.userId === currentUser.id,
      )
    }

    // For doctors: access to patient documents
    if (currentUser.role === "doctor") {
      return documentAccesses.filter((access) => access.userId === currentUser.id)
    }

    // Admin and secretary see all
    return documentAccesses
  }

  // Notification operations
  const getUserNotifications = () => {
    if (!currentUser) return []

    return notifications.filter((notification) => notification.userId === currentUser.id)
  }

  const markNotificationAsRead = async (id: string) => {
    dataStore.markNotificationAsRead(id)
    await refreshData()
  }

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return

    dataStore.markAllNotificationsAsRead(currentUser.id)
    await refreshData()
  }

  const getAllUsers = () => {
    return users
  }

  const getUserById = (id: number) => {
    return users.find((user) => user.id === id)
  }

  const updateUserProfile = async (id: number, userData: Partial<User>) => {
    try {
      // Mettre à jour l'utilisateur
      dataStore.updateUser(id, userData)

      // Mettre à jour le patient correspondant si nécessaire
      const user = dataStore.getUserById(id)
      if (user && user.role === "patient") {
        const patient = dataStore.getPatientById(id)
        if (patient) {
          const patientData: Partial<Patient> = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
          }
          dataStore.updatePatient(id, patientData)
        }
      }

      await refreshData()
      return true
    } catch (error) {
      console.error("Error updating user profile:", error)
      return false
    }
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        appointments,
        medications,
        medicalRecords,
        bloodDonations,
        bloodRequests,
        patients,
        documents,
        documentAccesses,
        notifications,
        isPending,

        // Appointment operations
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getUserAppointments,

        // Medication operations
        addMedication,
        updateMedication,
        deleteMedication,
        getUserMedications,

        // Medical record operations
        addMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        getUserMedicalRecords,

        // Blood donation operations
        addBloodDonation,
        updateBloodDonation,
        deleteBloodDonation,
        getUserBloodDonations,

        // Blood request operations
        addBloodRequest,
        updateBloodRequest,
        deleteBloodRequest,
        getUserBloodRequests,

        // Patient operations
        addPatient,
        updatePatient,
        deletePatient,
        getDoctorPatients,

        // Document operations
        addDocument,
        updateDocument,
        deleteDocument,
        getUserDocuments,
        getAccessibleDocuments,
        userHasDocumentAccess,

        // Document access operations
        requestDocumentAccess,
        approveDocumentAccess,
        denyDocumentAccess,
        revokeDocumentAccess,
        getUserDocumentAccesses,

        // Notification operations
        getUserNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        // General operations
        refreshData,
        getAllUsers,
        getUserById,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
