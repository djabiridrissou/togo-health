"use client"

import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type {
  Appointment,
  Medication,
  MedicalRecord,
  BloodDonation,
  BloodRequest,
  Patient,
} from "@/contexts/app-context"

interface SanteTogoDBSchema extends DBSchema {
  users: {
    key: number
    value: {
      id: number
      firstName: string
      lastName: string
      email: string
      password: string
      role: string
      phoneNumber: string
    }
    indexes: { "by-email": string }
  }
  appointments: {
    key: string
    value: Appointment
    indexes: { "by-patient": number }
  }
  medications: {
    key: string
    value: Medication
    indexes: { "by-patient": number }
  }
  medicalRecords: {
    key: string
    value: MedicalRecord
    indexes: { "by-patient": number }
  }
  bloodDonations: {
    key: string
    value: BloodDonation
    indexes: { "by-donor": number }
  }
  bloodRequests: {
    key: string
    value: BloodRequest
    indexes: { "by-requester": number }
  }
  patients: {
    key: number
    value: Patient
    indexes: { "by-doctor": number }
  }
}

let db: IDBPDatabase<SanteTogoDBSchema> | null = null

// Function to seed initial data using the transaction provided by the upgrade callback
function seedInitialData(db: IDBPDatabase<SanteTogoDBSchema>, transaction: IDBTransaction) {
  // Seed users
  const users = [
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
  const patients = [
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
  const appointments = [
    {
      id: "1",
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      date: "2023-06-15",
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
      specialty: "Cardiologie",
      date: "2023-06-20",
      time: "14:30",
      type: "Suivi cardiologique",
      location: "Hôpital Universitaire de Lomé",
      mode: "in-person",
      status: "scheduled",
      patientId: 1,
    },
    {
      id: "3",
      doctor: "Dr. Kofi Mensah",
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
  const medications = [
    {
      id: "1",
      name: "Paracétamol",
      dosage: "500mg",
      frequency: "3 fois par jour",
      startDate: "2023-06-01",
      endDate: "2023-06-15",
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
      startDate: "2023-06-05",
      endDate: "2023-06-12",
      withFood: false,
      notes: "Prendre à jeun",
      status: "active",
      adherence: 100,
      patientId: 1,
    },
  ]

  // Seed medical records
  const medicalRecords = [
    {
      id: "1",
      type: "consultation",
      date: "2023-05-15",
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      diagnosis: "Infection respiratoire",
      notes: "Prescription d'antibiotiques pour 7 jours. Repos recommandé.",
      patientId: 1,
    },
    {
      id: "2",
      type: "test",
      date: "2023-05-16",
      doctor: "Dr. Kofi Mensah",
      specialty: "Médecine générale",
      diagnosis: "Analyse de sang",
      notes: "Légère anémie. Supplémentation en fer recommandée.",
      documentUrl: "#",
      patientId: 1,
    },
  ]

  // Seed blood donations
  const bloodDonations = [
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
      date: "2023-06-20",
      location: "Hôpital Universitaire de Lomé",
      bloodType: "A+",
      status: "scheduled",
      donorId: 1,
    },
  ]

  // Seed blood requests
  const bloodRequests = [
    {
      id: "1",
      bloodType: "A+",
      hospital: "Hôpital Universitaire de Lomé",
      urgency: "high",
      date: "2023-06-14",
      quantity: "3 unités",
      patientType: "Adulte",
      reason: "Intervention chirurgicale",
      status: "active",
      contactPerson: "Dr. Kofi Mensah",
      contactPhone: "+228 90123456",
      requesterId: 2,
    },
    {
      id: "2",
      bloodType: "O-",
      hospital: "Centre Médical de Kara",
      urgency: "medium",
      date: "2023-06-18",
      quantity: "2 unités",
      patientType: "Enfant",
      reason: "Anémie sévère",
      status: "active",
      contactPerson: "Dr. Ama Diallo",
      contactPhone: "+228 91234567",
      requesterId: 2,
    },
  ]

  // Add all data using the transaction from the upgrade callback
  const userStore = transaction.objectStore("users")
  const patientStore = transaction.objectStore("patients")
  const appointmentStore = transaction.objectStore("appointments")
  const medicationStore = transaction.objectStore("medications")
  const medicalRecordStore = transaction.objectStore("medicalRecords")
  const bloodDonationStore = transaction.objectStore("bloodDonations")
  const bloodRequestStore = transaction.objectStore("bloodRequests")

  for (const user of users) {
    userStore.add(user)
  }

  for (const patient of patients) {
    patientStore.add(patient)
  }

  for (const appointment of appointments) {
    appointmentStore.add(appointment)
  }

  for (const medication of medications) {
    medicationStore.add(medication)
  }

  for (const record of medicalRecords) {
    medicalRecordStore.add(record)
  }

  for (const donation of bloodDonations) {
    bloodDonationStore.add(donation)
  }

  for (const request of bloodRequests) {
    bloodRequestStore.add(request)
  }
}

// Modified initDB function to handle errors better
export async function initDB() {
  if (db) return db

  try {
    db = await openDB<SanteTogoDBSchema>("santeTogo", 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Users store
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" })
          userStore.createIndex("by-email", "email", { unique: true })
        }

        // Appointments store
        if (!db.objectStoreNames.contains("appointments")) {
          const appointmentStore = db.createObjectStore("appointments", { keyPath: "id" })
          appointmentStore.createIndex("by-patient", "patientId", { unique: false })
        }

        // Medications store
        if (!db.objectStoreNames.contains("medications")) {
          const medicationStore = db.createObjectStore("medications", { keyPath: "id" })
          medicationStore.createIndex("by-patient", "patientId", { unique: false })
        }

        // Medical records store
        if (!db.objectStoreNames.contains("medicalRecords")) {
          const medicalRecordStore = db.createObjectStore("medicalRecords", { keyPath: "id" })
          medicalRecordStore.createIndex("by-patient", "patientId", { unique: false })
        }

        // Blood donations store
        if (!db.objectStoreNames.contains("bloodDonations")) {
          const bloodDonationStore = db.createObjectStore("bloodDonations", { keyPath: "id" })
          bloodDonationStore.createIndex("by-donor", "donorId", { unique: false })
        }

        // Blood requests store
        if (!db.objectStoreNames.contains("bloodRequests")) {
          const bloodRequestStore = db.createObjectStore("bloodRequests", { keyPath: "id" })
          bloodRequestStore.createIndex("by-requester", "requesterId", { unique: false })
        }

        // Patients store
        if (!db.objectStoreNames.contains("patients")) {
          const patientStore = db.createObjectStore("patients", { keyPath: "id" })
          patientStore.createIndex("by-doctor", "doctorId", { unique: false })
        }

        // Seed initial data using the transaction provided by the upgrade callback
        seedInitialData(db, transaction)
      },
      blocked() {
        console.warn("Database opening blocked. Another tab might be using it.")
      },
      blocking() {
        console.warn("This tab is blocking a database upgrade.")
      },
      terminated() {
        console.error("Database connection was terminated unexpectedly.")
        db = null
      },
    })

    return db
  } catch (error) {
    console.error("Error initializing database:", error)

    // Provide a more detailed error message
    if (error instanceof DOMException && error.name === "InvalidStateError") {
      console.error(
        "InvalidStateError: This usually happens when trying to create a new transaction while a version change transaction is running.",
      )
    }

    throw error
  }
}

// CRUD operations for users
export async function getUsers() {
  const db = await initDB()
  return db.getAll("users")
}

export async function getUserByEmail(email: string) {
  const db = await initDB()
  return db.getFromIndex("users", "by-email", email)
}

export async function getUserById(id: number) {
  const db = await initDB()
  return db.get("users", id)
}

export async function addUser(user: Omit<SanteTogoDBSchema["users"]["value"], "id">) {
  const db = await initDB()
  const id = Date.now()
  return db.add("users", { ...user, id })
}

export async function updateUser(id: number, user: Partial<SanteTogoDBSchema["users"]["value"]>) {
  const db = await initDB()
  const existingUser = await db.get("users", id)
  if (!existingUser) return false
  return db.put("users", { ...existingUser, ...user })
}

export async function deleteUser(id: number) {
  const db = await initDB()
  return db.delete("users", id)
}

// CRUD operations for appointments
export async function getAppointments() {
  const db = await initDB()
  return db.getAll("appointments")
}

export async function getAppointmentsByPatient(patientId: number) {
  const db = await initDB()
  return db.getAllFromIndex("appointments", "by-patient", patientId)
}

export async function getAppointmentById(id: string) {
  const db = await initDB()
  return db.get("appointments", id)
}

export async function addAppointment(appointment: Omit<Appointment, "id">) {
  const db = await initDB()
  const id = Date.now().toString()
  return db.add("appointments", { ...appointment, id })
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>) {
  const db = await initDB()
  const existingAppointment = await db.get("appointments", id)
  if (!existingAppointment) return false
  return db.put("appointments", { ...existingAppointment, ...appointment })
}

export async function deleteAppointment(id: string) {
  const db = await initDB()
  return db.delete("appointments", id)
}

// CRUD operations for medications
export async function getMedications() {
  const db = await initDB()
  return db.getAll("medications")
}

export async function getMedicationsByPatient(patientId: number) {
  const db = await initDB()
  return db.getAllFromIndex("medications", "by-patient", patientId)
}

export async function getMedicationById(id: string) {
  const db = await initDB()
  return db.get("medications", id)
}

export async function addMedication(medication: Omit<Medication, "id">) {
  const db = await initDB()
  const id = Date.now().toString()
  return db.add("medications", { ...medication, id })
}

export async function updateMedication(id: string, medication: Partial<Medication>) {
  const db = await initDB()
  const existingMedication = await db.get("medications", id)
  if (!existingMedication) return false
  return db.put("medications", { ...existingMedication, ...medication })
}

export async function deleteMedication(id: string) {
  const db = await initDB()
  return db.delete("medications", id)
}

// CRUD operations for medical records
export async function getMedicalRecords() {
  const db = await initDB()
  return db.getAll("medicalRecords")
}

export async function getMedicalRecordsByPatient(patientId: number) {
  const db = await initDB()
  return db.getAllFromIndex("medicalRecords", "by-patient", patientId)
}

export async function getMedicalRecordById(id: string) {
  const db = await initDB()
  return db.get("medicalRecords", id)
}

export async function addMedicalRecord(record: Omit<MedicalRecord, "id">) {
  const db = await initDB()
  const id = Date.now().toString()
  return db.add("medicalRecords", { ...record, id })
}

export async function updateMedicalRecord(id: string, record: Partial<MedicalRecord>) {
  const db = await initDB()
  const existingRecord = await db.get("medicalRecords", id)
  if (!existingRecord) return false
  return db.put("medicalRecords", { ...existingRecord, ...record })
}

export async function deleteMedicalRecord(id: string) {
  const db = await initDB()
  return db.delete("medicalRecords", id)
}

// CRUD operations for blood donations
export async function getBloodDonations() {
  const db = await initDB()
  return db.getAll("bloodDonations")
}

export async function getBloodDonationsByDonor(donorId: number) {
  const db = await initDB()
  return db.getAllFromIndex("bloodDonations", "by-donor", donorId)
}

export async function getBloodDonationById(id: string) {
  const db = await initDB()
  return db.get("bloodDonations", id)
}

export async function addBloodDonation(donation: Omit<BloodDonation, "id">) {
  const db = await initDB()
  const id = Date.now().toString()
  return db.add("bloodDonations", { ...donation, id })
}

export async function updateBloodDonation(id: string, donation: Partial<BloodDonation>) {
  const db = await initDB()
  const existingDonation = await db.get("bloodDonations", id)
  if (!existingDonation) return false
  return db.put("bloodDonations", { ...existingDonation, ...donation })
}

export async function deleteBloodDonation(id: string) {
  const db = await initDB()
  return db.delete("bloodDonations", id)
}

// CRUD operations for blood requests
export async function getBloodRequests() {
  const db = await initDB()
  return db.getAll("bloodRequests")
}

export async function getBloodRequestsByRequester(requesterId: number) {
  const db = await initDB()
  return db.getAllFromIndex("bloodRequests", "by-requester", requesterId)
}

export async function getBloodRequestById(id: string) {
  const db = await initDB()
  return db.get("bloodRequests", id)
}

export async function addBloodRequest(request: Omit<BloodRequest, "id">) {
  const db = await initDB()
  const id = Date.now().toString()
  return db.add("bloodRequests", { ...request, id })
}

export async function updateBloodRequest(id: string, request: Partial<BloodRequest>) {
  const db = await initDB()
  const existingRequest = await db.get("bloodRequests", id)
  if (!existingRequest) return false
  return db.put("bloodRequests", { ...existingRequest, ...request })
}

export async function deleteBloodRequest(id: string) {
  const db = await initDB()
  return db.delete("bloodRequests", id)
}

// CRUD operations for patients
export async function getPatients() {
  const db = await initDB()
  return db.getAll("patients")
}

export async function getPatientsByDoctor(doctorId: number) {
  const db = await initDB()
  return db.getAllFromIndex("patients", "by-doctor", doctorId)
}

export async function getPatientById(id: number) {
  const db = await initDB()
  return db.get("patients", id)
}

export async function addPatient(patient: Omit<Patient, "id">) {
  const db = await initDB()
  const id = Date.now()
  return db.add("patients", { ...patient, id })
}

export async function updatePatient(id: number, patient: Partial<Patient>) {
  const db = await initDB()
  const existingPatient = await db.get("patients", id)
  if (!existingPatient) return false
  return db.put("patients", { ...existingPatient, ...patient })
}

export async function deletePatient(id: number) {
  const db = await initDB()
  return db.delete("patients", id)
}
