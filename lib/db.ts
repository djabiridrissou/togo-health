"use client"

// Rediriger vers les nouvelles opérations
import * as dbOperations from "./db/operations"

// Exporter les fonctions de la nouvelle implémentation
export const {
  getUsers,
  getUserByEmail,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getAppointments,
  getAppointmentsByPatient,
  getAppointmentById,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getMedications,
  getMedicationsByPatient,
  getMedicationById,
  addMedication,
  updateMedication,
  deleteMedication,
  getMedicalRecords,
  getMedicalRecordsByPatient,
  getMedicalRecordById,
  addMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getBloodDonations,
  getBloodDonationsByDonor,
  getBloodDonationById,
  addBloodDonation,
  updateBloodDonation,
  deleteBloodDonation,
  getBloodRequests,
  getBloodRequestsByRequester,
  getBloodRequestById,
  addBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  getPatients,
  getPatientsByDoctor,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
} = dbOperations

// Fonction fictive pour la compatibilité
export async function initDB() {
  console.warn("initDB est déprécié, utilisez getDb de lib/db/index.ts à la place")
  return null
}

// Fonction fictive pour la compatibilité
export async function seedDatabase() {
  console.warn("seedDatabase est déprécié, utilisez seedDatabase de lib/db/index.ts à la place")
  return await dbOperations.seedDatabase()
}
