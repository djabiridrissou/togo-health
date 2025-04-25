import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { seedDatabase } from "./seed"

// Initialiser la base de données
let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    // Utiliser un chemin absolu pour la base de données
    const dbPath = path.resolve(process.cwd(), "sqlite.db")

    // Vérifier si le dossier existe, sinon le créer
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Créer la connexion à la base de données
    db = new Database(dbPath)

    // Activer les clés étrangères
    db.pragma("foreign_keys = ON")

    // Créer les tables si elles n'existent pas
    createTables(db)
  }
  return db
}

// Fonction pour créer les tables
function createTables(db: Database.Database) {
  // Table des utilisateurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      specialty TEXT
    )
  `)

  // Table des patients
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      bloodType TEXT,
      height TEXT,
      weight TEXT,
      allergies TEXT,
      chronicConditions TEXT,
      doctorId INTEGER,
      FOREIGN KEY (doctorId) REFERENCES users(id)
    )
  `)

  // Table des rendez-vous
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor TEXT NOT NULL,
      doctorId INTEGER NOT NULL,
      specialty TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      mode TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL,
      patientId INTEGER NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id),
      FOREIGN KEY (doctorId) REFERENCES users(id)
    )
  `)

  // Table des médicaments
  db.exec(`
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      withFood INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL,
      adherence INTEGER NOT NULL,
      patientId INTEGER NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id)
    )
  `)

  // Table des dossiers médicaux
  db.exec(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      doctor TEXT NOT NULL,
      doctorId INTEGER NOT NULL,
      specialty TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      notes TEXT NOT NULL,
      documentUrl TEXT,
      patientId INTEGER NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id),
      FOREIGN KEY (doctorId) REFERENCES users(id)
    )
  `)

  // Table des dons de sang
  db.exec(`
    CREATE TABLE IF NOT EXISTS blood_donations (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      bloodType TEXT NOT NULL,
      status TEXT NOT NULL,
      donorId INTEGER NOT NULL,
      FOREIGN KEY (donorId) REFERENCES patients(id)
    )
  `)

  // Table des demandes de sang
  db.exec(`
    CREATE TABLE IF NOT EXISTS blood_requests (
      id TEXT PRIMARY KEY,
      bloodType TEXT NOT NULL,
      hospital TEXT NOT NULL,
      urgency TEXT NOT NULL,
      date TEXT NOT NULL,
      quantity TEXT NOT NULL,
      patientType TEXT,
      reason TEXT,
      status TEXT NOT NULL,
      contactPerson TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      requesterId INTEGER NOT NULL,
      FOREIGN KEY (requesterId) REFERENCES users(id)
    )
  `)

  // Table des documents
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      fileType TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      url TEXT NOT NULL,
      uploaderId INTEGER NOT NULL,
      ownerId INTEGER NOT NULL,
      isPrivate INTEGER NOT NULL,
      FOREIGN KEY (uploaderId) REFERENCES users(id),
      FOREIGN KEY (ownerId) REFERENCES patients(id)
    )
  `)

  // Table des accès aux documents
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_accesses (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      userId INTEGER NOT NULL,
      grantedBy INTEGER NOT NULL,
      grantedAt TEXT NOT NULL,
      expiresAt TEXT,
      status TEXT NOT NULL,
      FOREIGN KEY (documentId) REFERENCES documents(id),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (grantedBy) REFERENCES users(id)
    )
  `)

  // Table des notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      date TEXT NOT NULL,
      isRead INTEGER NOT NULL,
      type TEXT NOT NULL,
      relatedId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)
}

// Fonction pour initialiser la base de données avec des données de test
export async function initDatabase() {
  const db = getDb()

  try {
    // Vérifier si la base de données est déjà initialisée
    const existingUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }

    if (existingUsers.count === 0) {
      // Initialiser avec des données de test
      await seedDatabase(db)
      console.log("Base de données initialisée avec succès")
    } else {
      console.log("La base de données est déjà initialisée")
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    throw error
  }
}

// Fonction pour fermer la connexion à la base de données
export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

// Initialiser la base de données au démarrage
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  initDatabase().catch(console.error)
}
