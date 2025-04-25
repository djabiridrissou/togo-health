import type Database from "better-sqlite3"
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

// Fonction pour initialiser la base de données avec des données de test
export async function seedDatabase(db: Database.Database) {
  // Utiliser des transactions pour assurer l'intégrité des données
  db.exec("BEGIN TRANSACTION")

  try {
    // Insérer les utilisateurs
    const users: Omit<User, "id">[] = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "patient@example.com",
        password: "password123",
        role: "patient",
        phoneNumber: "+228 90123456",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "doctor@example.com",
        password: "password123",
        role: "doctor",
        phoneNumber: "+228 91234567",
        specialty: "Médecine générale",
      },
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "secretary@example.com",
        password: "password123",
        role: "secretary",
        phoneNumber: "+228 92345678",
      },
      {
        firstName: "Bob",
        lastName: "Brown",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        phoneNumber: "+228 93456789",
      },
    ]

    const insertUser = db.prepare(`
      INSERT INTO users (firstName, lastName, email, password, role, phoneNumber, specialty)
      VALUES (@firstName, @lastName, @email, @password, @role, @phoneNumber, @specialty)
    `)

    for (const user of users) {
      insertUser.run(user)
    }

    // Insérer les patients
    const patients: (Omit<Patient, "id" | "allergies" | "chronicConditions"> & {
      allergies: string
      chronicConditions: string
    })[] = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "patient@example.com",
        phoneNumber: "+228 90123456",
        bloodType: "A+",
        height: "175 cm",
        weight: "70 kg",
        allergies: JSON.stringify(["Pénicilline", "Arachides"]),
        chronicConditions: JSON.stringify(["Asthme"]),
        doctorId: 2,
      },
      {
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie@example.com",
        phoneNumber: "+228 94567890",
        bloodType: "B+",
        height: "165 cm",
        weight: "60 kg",
        allergies: JSON.stringify(["Lactose"]),
        chronicConditions: JSON.stringify([]),
        doctorId: 2,
      },
    ]

    const insertPatient = db.prepare(`
      INSERT INTO patients (firstName, lastName, email, phoneNumber, bloodType, height, weight, allergies, chronicConditions, doctorId)
      VALUES (@firstName, @lastName, @email, @phoneNumber, @bloodType, @height, @weight, @allergies, @chronicConditions, @doctorId)
    `)

    for (const patient of patients) {
      insertPatient.run(patient)
    }

    // Insérer les rendez-vous
    const appointments: Appointment[] = [
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

    const insertAppointment = db.prepare(`
      INSERT INTO appointments (id, doctor, doctorId, specialty, date, time, type, location, mode, notes, status, patientId)
      VALUES (@id, @doctor, @doctorId, @specialty, @date, @time, @type, @location, @mode, @notes, @status, @patientId)
    `)

    for (const appointment of appointments) {
      insertAppointment.run(appointment)
    }

    // Insérer les médicaments
    const medications: (Omit<Medication, "withFood"> & { withFood: number })[] = [
      {
        id: "1",
        name: "Paracétamol",
        dosage: "500mg",
        frequency: "3 fois par jour",
        startDate: "2025-01-01",
        endDate: "2025-06-15",
        withFood: 1, // true
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
        withFood: 0, // false
        notes: "Prendre à jeun",
        status: "active",
        adherence: 100,
        patientId: 1,
      },
    ]

    const insertMedication = db.prepare(`
      INSERT INTO medications (id, name, dosage, frequency, startDate, endDate, withFood, notes, status, adherence, patientId)
      VALUES (@id, @name, @dosage, @frequency, @startDate, @endDate, @withFood, @notes, @status, @adherence, @patientId)
    `)

    for (const medication of medications) {
      insertMedication.run(medication)
    }

    // Insérer les dossiers médicaux
    const medicalRecords: MedicalRecord[] = [
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

    const insertMedicalRecord = db.prepare(`
      INSERT INTO medical_records (id, type, date, doctor, doctorId, specialty, diagnosis, notes, documentUrl, patientId)
      VALUES (@id, @type, @date, @doctor, @doctorId, @specialty, @diagnosis, @notes, @documentUrl, @patientId)
    `)

    for (const record of medicalRecords) {
      insertMedicalRecord.run(record)
    }

    // Insérer les dons de sang
    const bloodDonations: BloodDonation[] = [
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

    const insertBloodDonation = db.prepare(`
      INSERT INTO blood_donations (id, date, location, bloodType, status, donorId)
      VALUES (@id, @date, @location, @bloodType, @status, @donorId)
    `)

    for (const donation of bloodDonations) {
      insertBloodDonation.run(donation)
    }

    // Insérer les demandes de sang
    const bloodRequests: BloodRequest[] = [
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

    const insertBloodRequest = db.prepare(`
      INSERT INTO blood_requests (id, bloodType, hospital, urgency, date, quantity, patientType, reason, status, contactPerson, contactPhone, requesterId)
      VALUES (@id, @bloodType, @hospital, @urgency, @date, @quantity, @patientType, @reason, @status, @contactPerson, @contactPhone, @requesterId)
    `)

    for (const request of bloodRequests) {
      insertBloodRequest.run(request)
    }

    // Insérer les documents
    const documents: (Omit<Document, "isPrivate"> & { isPrivate: number })[] = [
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
        isPrivate: 0, // false
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
        isPrivate: 1, // true
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
        isPrivate: 0, // false
      },
    ]

    const insertDocument = db.prepare(`
      INSERT INTO documents (id, name, type, date, fileType, fileSize, url, uploaderId, ownerId, isPrivate)
      VALUES (@id, @name, @type, @date, @fileType, @fileSize, @url, @uploaderId, @ownerId, @isPrivate)
    `)

    for (const document of documents) {
      insertDocument.run(document)
    }

    // Insérer les accès aux documents
    const documentAccesses: DocumentAccess[] = [
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

    const insertDocumentAccess = db.prepare(`
      INSERT INTO document_accesses (id, documentId, userId, grantedBy, grantedAt, expiresAt, status)
      VALUES (@id, @documentId, @userId, @grantedBy, @grantedAt, @expiresAt, @status)
    `)

    for (const access of documentAccesses) {
      insertDocumentAccess.run(access)
    }

    // Insérer les notifications
    const notifications: (Omit<Notification, "isRead"> & { isRead: number })[] = [
      {
        id: "1",
        userId: 1,
        title: "Nouveau document disponible",
        message: "Vos résultats d'analyse de sang sont disponibles",
        date: "2023-05-16",
        isRead: 0, // false
        type: "document",
        relatedId: "1",
      },
      {
        id: "2",
        userId: 1,
        title: "Rappel de rendez-vous",
        message: "Vous avez un rendez-vous demain à 10:00 avec Dr. Jane Smith",
        date: "2025-06-14",
        isRead: 1, // true
        type: "appointment",
        relatedId: "1",
      },
    ]

    const insertNotification = db.prepare(`
      INSERT INTO notifications (id, userId, title, message, date, isRead, type, relatedId)
      VALUES (@id, @userId, @title, @message, @date, @isRead, @type, @relatedId)
    `)

    for (const notification of notifications) {
      insertNotification.run(notification)
    }

    // Valider la transaction
    db.exec("COMMIT")
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    db.exec("ROLLBACK")
    console.error("Erreur lors de l'initialisation des données:", error)
    throw error
  }
}
