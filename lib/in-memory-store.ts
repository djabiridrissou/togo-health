// In-memory data storage for the application
// This will store all data until the server is shut down

import type {
  User,
  Patient,
  Appointment,
  Medication,
  MedicalRecord,
  BloodDonation,
  BloodRequest,
  Document,
  DocumentAccess,
  Notification,
} from "@/types"

// In-memory data stores
let users: User[] = []
let patients: Patient[] = []
let appointments: Appointment[] = []
let medications: Medication[] = []
let medicalRecords: MedicalRecord[] = []
let bloodDonations: BloodDonation[] = []
let bloodRequests: BloodRequest[] = []
let documents: Document[] = []
let documentAccesses: DocumentAccess[] = []
let notifications: Notification[] = []

// Seed initial data
const seedInitialData = () => {
  if (users.length > 0) return // Only seed once

  // Seed users
  users = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "patient@example.com",
      password: "password123",
      role: "patient",
      phoneNumber: "+228 90123456",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "doctor@example.com",
      password: "password123",
      role: "doctor",
      phoneNumber: "+228 91234567",
      specialty: "Médecine générale",
    },
    {
      id: 3,
      firstName: "Alice",
      lastName: "Johnson",
      email: "secretary@example.com",
      password: "password123",
      role: "secretary",
      phoneNumber: "+228 92345678",
    },
    {
      id: 4,
      firstName: "Bob",
      lastName: "Brown",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      phoneNumber: "+228 93456789",
    },
  ]

  // Seed patients
  patients = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "patient@example.com",
      phoneNumber: "+228 90123456",
      bloodType: "A+",
      height: "175 cm",
      weight: "70 kg",
      allergies: ["Pénicilline", "Arachides"],
      chronicConditions: ["Asthme"],
      doctorId: 2,
    },
    {
      id: 5,
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie@example.com",
      phoneNumber: "+228 94567890",
      bloodType: "B+",
      height: "165 cm",
      weight: "60 kg",
      allergies: ["Lactose"],
      chronicConditions: [],
      doctorId: 2,
    },
  ]

  // Seed appointments
  appointments = [
    {
      id: "1",
      doctor: "Dr. Jane Smith",
      doctorId: 2,
      specialty: "Médecine générale",
      date: "2025-06-15",
      time: "10:00",
      type: "Consultation générale",
      location: "Centre Médical de Lomé",
      mode: "in-person",
      status: "scheduled",
      patientId: 1,
    },
    {
      id: "2",
      doctor: "Dr. Ama Diallo",
      doctorId: 2,
      specialty: "Cardiologie",
      date: "2025-06-20",
      time: "14:30",
      type: "Suivi cardiologique",
      location: "Hôpital Universitaire de Lomé",
      mode: "in-person",
      status: "scheduled",
      patientId: 1,
    },
    {
      id: "3",
      doctor: "Dr. Jane Smith",
      doctorId: 2,
      specialty: "Médecine générale",
      date: "2023-05-10",
      time: "09:15",
      type: "Consultation générale",
      location: "Centre Médical de Lomé",
      mode: "in-person",
      notes: "Prescription d'antibiotiques pour une infection respiratoire.",
      status: "completed",
      patientId: 1,
    },
  ]

  // Seed medications
  medications = [
    {
      id: "1",
      name: "Paracétamol",
      dosage: "500mg",
      frequency: "3 fois par jour",
      startDate: "2025-01-01",
      endDate: "2025-06-15",
      withFood: true,
      notes: "Prendre après les repas",
      status: "active",
      adherence: 90,
      patientId: 1,
    },
    {
      id: "2",
      name: "Amoxicilline",
      dosage: "250mg",
      frequency: "2 fois par jour",
      startDate: "2025-01-05",
      endDate: "2025-06-12",
      withFood: false,
      notes: "Prendre à jeun",
      status: "active",
      adherence: 100,
      patientId: 1,
    },
  ]

  // Seed medical records
  medicalRecords = [
    {
      id: "1",
      type: "consultation",
      date: "2023-05-15",
      doctor: "Dr. Jane Smith",
      doctorId: 2,
      specialty: "Médecine générale",
      diagnosis: "Infection respiratoire",
      notes: "Prescription d'antibiotiques pour 7 jours. Repos recommandé.",
      patientId: 1,
    },
    {
      id: "2",
      type: "test",
      date: "2023-05-16",
      doctor: "Dr. Jane Smith",
      doctorId: 2,
      specialty: "Médecine générale",
      diagnosis: "Analyse de sang",
      notes: "Légère anémie. Supplémentation en fer recommandée.",
      documentUrl: "#",
      patientId: 1,
    },
  ]

  // Seed blood donations
  bloodDonations = [
    {
      id: "1",
      date: "2023-05-10",
      location: "Centre de Transfusion Sanguine de Lomé",
      bloodType: "A+",
      status: "completed",
      donorId: 1,
    },
    {
      id: "2",
      date: "2025-06-20",
      location: "Hôpital Universitaire de Lomé",
      bloodType: "A+",
      status: "scheduled",
      donorId: 1,
    },
  ]

  // Seed blood requests
  bloodRequests = [
    {
      id: "1",
      bloodType: "A+",
      hospital: "Hôpital Universitaire de Lomé",
      urgency: "high",
      date: "2025-06-14",
      quantity: "3 unités",
      patientType: "Adulte",
      reason: "Intervention chirurgicale",
      status: "active",
      contactPerson: "Dr. Jane Smith",
      contactPhone: "+228 90123456",
      requesterId: 2,
    },
    {
      id: "2",
      bloodType: "O-",
      hospital: "Centre Médical de Kara",
      urgency: "medium",
      date: "2025-06-18",
      quantity: "2 unités",
      patientType: "Enfant",
      reason: "Anémie sévère",
      status: "active",
      contactPerson: "Dr. Ama Diallo",
      contactPhone: "+228 91234567",
      requesterId: 2,
    },
  ]

  // Seed documents
  documents = [
    {
      id: "1",
      name: "Résultats d'analyse de sang",
      type: "medical_test",
      date: "2023-05-16",
      fileType: "PDF",
      fileSize: "1.2 MB",
      url: "#",
      uploaderId: 1,
      ownerId: 1,
      isPrivate: false,
    },
    {
      id: "2",
      name: "Prescription médicamenteuse",
      type: "prescription",
      date: "2023-05-15",
      fileType: "PDF",
      fileSize: "0.5 MB",
      url: "#",
      uploaderId: 2,
      ownerId: 1,
      isPrivate: true,
    },
    {
      id: "3",
      name: "Facture de consultation",
      type: "invoice",
      date: "2023-05-15",
      fileType: "PDF",
      fileSize: "0.3 MB",
      url: "#",
      uploaderId: 3,
      ownerId: 1,
      isPrivate: false,
    },
  ]

  // Seed document accesses
  documentAccesses = [
    {
      id: "1",
      documentId: "2",
      userId: 2,
      grantedBy: 1,
      grantedAt: "2023-05-16",
      expiresAt: "2025-05-30",
      status: "approved",
    },
  ]

  // Seed notifications
  notifications = [
    {
      id: "1",
      userId: 1,
      title: "Nouveau document disponible",
      message: "Vos résultats d'analyse de sang sont disponibles",
      date: "2023-05-16",
      isRead: false,
      type: "document",
      relatedId: "1",
    },
    {
      id: "2",
      userId: 1,
      title: "Rappel de rendez-vous",
      message: "Vous avez un rendez-vous demain à 10:00 avec Dr. Jane Smith",
      date: "2025-06-14",
      isRead: true,
      type: "appointment",
      relatedId: "1",
    },
  ]
}

// Call seed function
seedInitialData()

// Helper functions to generate IDs
const generateUserId = (): number => {
  const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0)
  return maxId + 1
}

const generateStringId = (): string => {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString()
}

// User operations
export const getAllUsers = () => [...users]
export const getUserById = (id: number) => users.find((user) => user.id === id)
export const getUserByEmail = (email: string) => users.find((user) => user.email === email)
export const addUser = (userData: Omit<User, "id">) => {
  const newUser = { ...userData, id: generateUserId() }
  users.push(newUser)
  return newUser
}
export const updateUser = (id: number, userData: Partial<User>) => {
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) return false
  users[index] = { ...users[index], ...userData }
  return true
}
export const deleteUser = (id: number) => {
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) return false
  users.splice(index, 1)
  return true
}

// Patient operations
export const getAllPatients = () => [...patients]
export const getPatientById = (id: number) => patients.find((patient) => patient.id === id)
export const getPatientsByDoctor = (doctorId: number) => patients.filter((patient) => patient.doctorId === doctorId)
export const addPatient = (patientData: Omit<Patient, "id">) => {
  const newPatient = { ...patientData, id: generateUserId() }
  patients.push(newPatient)
  return newPatient
}
export const updatePatient = (id: number, patientData: Partial<Patient>) => {
  const index = patients.findIndex((patient) => patient.id === id)
  if (index === -1) return false
  patients[index] = { ...patients[index], ...patientData }
  return true
}
export const deletePatient = (id: number) => {
  const index = patients.findIndex((patient) => patient.id === id)
  if (index === -1) return false
  patients.splice(index, 1)
  return true
}

// Appointment operations
export const getAllAppointments = () => [...appointments]
export const getAppointmentById = (id: string) => appointments.find((appointment) => appointment.id === id)
export const getAppointmentsByPatient = (patientId: number) =>
  appointments.filter((appointment) => appointment.patientId === patientId)
export const getAppointmentsByDoctor = (doctorId: number) =>
  appointments.filter((appointment) => appointment.doctorId === doctorId)
export const addAppointment = (appointmentData: Omit<Appointment, "id">) => {
  const newAppointment = { ...appointmentData, id: generateStringId() }
  appointments.push(newAppointment)
  return newAppointment
}
export const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
  const index = appointments.findIndex((appointment) => appointment.id === id)
  if (index === -1) return false
  appointments[index] = { ...appointments[index], ...appointmentData }
  return true
}
export const deleteAppointment = (id: string) => {
  const index = appointments.findIndex((appointment) => appointment.id === id)
  if (index === -1) return false
  appointments.splice(index, 1)
  return true
}

// Medication operations
export const getAllMedications = () => [...medications]
export const getMedicationById = (id: string) => medications.find((medication) => medication.id === id)
export const getMedicationsByPatient = (patientId: number) =>
  medications.filter((medication) => medication.patientId === patientId)
export const addMedication = (medicationData: Omit<Medication, "id">) => {
  const newMedication = { ...medicationData, id: generateStringId() }
  medications.push(newMedication)
  return newMedication
}
export const updateMedication = (id: string, medicationData: Partial<Medication>) => {
  const index = medications.findIndex((medication) => medication.id === id)
  if (index === -1) return false
  medications[index] = { ...medications[index], ...medicationData }
  return true
}
export const deleteMedication = (id: string) => {
  const index = medications.findIndex((medication) => medication.id === id)
  if (index === -1) return false
  medications.splice(index, 1)
  return true
}

// Medical record operations
export const getAllMedicalRecords = () => [...medicalRecords]
export const getMedicalRecordById = (id: string) => medicalRecords.find((record) => record.id === id)
export const getMedicalRecordsByPatient = (patientId: number) =>
  medicalRecords.filter((record) => record.patientId === patientId)
export const addMedicalRecord = (recordData: Omit<MedicalRecord, "id">) => {
  const newRecord = { ...recordData, id: generateStringId() }
  medicalRecords.push(newRecord)
  return newRecord
}
export const updateMedicalRecord = (id: string, recordData: Partial<MedicalRecord>) => {
  const index = medicalRecords.findIndex((record) => record.id === id)
  if (index === -1) return false
  medicalRecords[index] = { ...medicalRecords[index], ...recordData }
  return true
}
export const deleteMedicalRecord = (id: string) => {
  const index = medicalRecords.findIndex((record) => record.id === id)
  if (index === -1) return false
  medicalRecords.splice(index, 1)
  return true
}

// Blood donation operations
export const getAllBloodDonations = () => [...bloodDonations]
export const getBloodDonationById = (id: string) => bloodDonations.find((donation) => donation.id === id)
export const getBloodDonationsByDonor = (donorId: number) =>
  bloodDonations.filter((donation) => donation.donorId === donorId)
export const addBloodDonation = (donationData: Omit<BloodDonation, "id">) => {
  const newDonation = { ...donationData, id: generateStringId() }
  bloodDonations.push(newDonation)
  return newDonation
}
export const updateBloodDonation = (id: string, donationData: Partial<BloodDonation>) => {
  const index = bloodDonations.findIndex((donation) => donation.id === id)
  if (index === -1) return false
  bloodDonations[index] = { ...bloodDonations[index], ...donationData }
  return true
}
export const deleteBloodDonation = (id: string) => {
  const index = bloodDonations.findIndex((donation) => donation.id === id)
  if (index === -1) return false
  bloodDonations.splice(index, 1)
  return true
}

// Blood request operations
export const getAllBloodRequests = () => [...bloodRequests]
export const getBloodRequestById = (id: string) => bloodRequests.find((request) => request.id === id)
export const getBloodRequestsByRequester = (requesterId: number) =>
  bloodRequests.filter((request) => request.requesterId === requesterId)
export const addBloodRequest = (requestData: Omit<BloodRequest, "id">) => {
  const newRequest = { ...requestData, id: generateStringId() }
  bloodRequests.push(newRequest)
  return newRequest
}
export const updateBloodRequest = (id: string, requestData: Partial<BloodRequest>) => {
  const index = bloodRequests.findIndex((request) => request.id === id)
  if (index === -1) return false
  bloodRequests[index] = { ...bloodRequests[index], ...requestData }
  return true
}
export const deleteBloodRequest = (id: string) => {
  const index = bloodRequests.findIndex((request) => request.id === id)
  if (index === -1) return false
  bloodRequests.splice(index, 1)
  return true
}

// Document operations
export const getAllDocuments = () => [...documents]
export const getDocumentById = (id: string) => documents.find((document) => document.id === id)
export const getDocumentsByOwner = (ownerId: number) => documents.filter((document) => document.ownerId === ownerId)
export const getDocumentsByUploader = (uploaderId: number) =>
  documents.filter((document) => document.uploaderId === uploaderId)
export const addDocument = (documentData: Omit<Document, "id">) => {
  const newDocument = { ...documentData, id: generateStringId() }
  documents.push(newDocument)
  return newDocument
}
export const updateDocument = (id: string, documentData: Partial<Document>) => {
  const index = documents.findIndex((document) => document.id === id)
  if (index === -1) return false
  documents[index] = { ...documents[index], ...documentData }
  return true
}
export const deleteDocument = (id: string) => {
  const index = documents.findIndex((document) => document.id === id)
  if (index === -1) return false
  documents.splice(index, 1)
  // Also delete all access records for this document
  documentAccesses = documentAccesses.filter((access) => access.documentId !== id)
  return true
}

// Document access operations
export const getAllDocumentAccesses = () => [...documentAccesses]
export const getDocumentAccessById = (id: string) => documentAccesses.find((access) => access.id === id)
export const getDocumentAccessesByDocument = (documentId: string) =>
  documentAccesses.filter((access) => access.documentId === documentId)
export const getDocumentAccessesByUser = (userId: number) =>
  documentAccesses.filter((access) => access.userId === userId)
export const addDocumentAccess = (accessData: Omit<DocumentAccess, "id">) => {
  const newAccess = { ...accessData, id: generateStringId() }
  documentAccesses.push(newAccess)
  return newAccess
}
export const updateDocumentAccess = (id: string, accessData: Partial<DocumentAccess>) => {
  const index = documentAccesses.findIndex((access) => access.id === id)
  if (index === -1) return false
  documentAccesses[index] = { ...documentAccesses[index], ...accessData }
  return true
}
export const deleteDocumentAccess = (id: string) => {
  const index = documentAccesses.findIndex((access) => access.id === id)
  if (index === -1) return false
  documentAccesses.splice(index, 1)
  return true
}

// Notification operations
export const getAllNotifications = () => [...notifications]
export const getNotificationById = (id: string) => notifications.find((notification) => notification.id === id)
export const getNotificationsByUser = (userId: number) =>
  notifications.filter((notification) => notification.userId === userId)
export const getUnreadNotificationsByUser = (userId: number) =>
  notifications.filter((notification) => notification.userId === userId && !notification.isRead)
export const addNotification = (notificationData: Omit<Notification, "id">) => {
  const newNotification = { ...notificationData, id: generateStringId() }
  notifications.push(newNotification)
  return newNotification
}
export const updateNotification = (id: string, notificationData: Partial<Notification>) => {
  const index = notifications.findIndex((notification) => notification.id === id)
  if (index === -1) return false
  notifications[index] = { ...notifications[index], ...notificationData }
  return true
}
export const deleteNotification = (id: string) => {
  const index = notifications.findIndex((notification) => notification.id === id)
  if (index === -1) return false
  notifications.splice(index, 1)
  return true
}
export const markNotificationAsRead = (id: string) => {
  const index = notifications.findIndex((notification) => notification.id === id)
  if (index === -1) return false
  notifications[index].isRead = true
  return true
}
export const markAllNotificationsAsRead = (userId: number) => {
  notifications.forEach((notification, index) => {
    if (notification.userId === userId) {
      notifications[index].isRead = true
    }
  })
  return true
}

// Helper function to check if a user has access to a document
export const userHasDocumentAccess = (userId: number, documentId: string) => {
  const document = getDocumentById(documentId)
  if (!document) return false

  // Document owners always have access
  if (document.ownerId === userId) return true

  // Document uploaders always have access
  if (document.uploaderId === userId) return true

  // Check if the document is public
  if (!document.isPrivate) return true

  // Check if the user has been granted access
  const access = documentAccesses.find(
    (access) =>
      access.documentId === documentId &&
      access.userId === userId &&
      access.status === "approved" &&
      (access.expiresAt ? new Date(access.expiresAt) > new Date() : true),
  )

  return !!access
}

// Function to check if a user can modify a document
export const userCanModifyDocument = (userId: number, documentId: string) => {
  const document = getDocumentById(documentId)
  if (!document) return false

  // Only the document owner or uploader can modify it
  return document.ownerId === userId || document.uploaderId === userId
}

// Function to check if a doctor can access a patient's data
export const doctorCanAccessPatientData = (doctorId: number, patientId: number) => {
  const patient = getPatientById(patientId)
  if (!patient) return false

  // The assigned doctor can access the patient's data
  return patient.doctorId === doctorId
}

// Function to get accessible documents for a user
export const getAccessibleDocumentsForUser = (userId: number) => {
  return documents.filter((doc) => userHasDocumentAccess(userId, doc.id))
}
