import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { seedDatabase } from "./seed"
import { setupAutomaticBackups } from "./backup"

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

    // Activer le mode WAL pour de meilleures performances et une meilleure fiabilité
    db.pragma("journal_mode = WAL")

    // Activer la vérification d'intégrité automatique
    db.pragma("auto_vacuum = FULL")

    // Créer les tables si elles n'existent pas
    createTables(db)

    // Configurer les sauvegardes automatiques
    setupAutomaticBackups()
  }
  return db
}

// Fonction pour créer les tables
function createTables(db: Database.Database) {
  // Tables existantes...

  // Nouvelles tables pour l'audit et le versionnement
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      oldData TEXT,
      newData TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS medical_records_history (
      id TEXT PRIMARY KEY,
      recordId TEXT NOT NULL,
      version INTEGER NOT NULL,
      data TEXT NOT NULL,
      modifiedBy INTEGER NOT NULL,
      modifiedAt TEXT NOT NULL,
      reason TEXT,
      FOREIGN KEY (recordId) REFERENCES medical_records(id),
      FOREIGN KEY (modifiedBy) REFERENCES users(id)
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS patients_history (
      id TEXT PRIMARY KEY,
      patientId INTEGER NOT NULL,
      version INTEGER NOT NULL,
      data TEXT NOT NULL,
      modifiedBy INTEGER NOT NULL,
      modifiedAt TEXT NOT NULL,
      reason TEXT,
      FOREIGN KEY (patientId) REFERENCES patients(id),
      FOREIGN KEY (modifiedBy) REFERENCES users(id)
    )
  `)

  // Ajouter le champ version aux tables existantes s'il n'existe pas déjà
  try {
    // Vérifier si la colonne version existe dans la table patients
    const patientColumns = db.prepare("PRAGMA table_info(patients)").all() as any[]
    if (!patientColumns.some((col) => col.name === "version")) {
      db.exec("ALTER TABLE patients ADD COLUMN version INTEGER NOT NULL DEFAULT 1")
    }

    // Vérifier si la colonne version existe dans la table medical_records
    const recordColumns = db.prepare("PRAGMA table_info(medical_records)").all() as any[]
    if (!recordColumns.some((col) => col.name === "version")) {
      db.exec("ALTER TABLE medical_records ADD COLUMN version INTEGER NOT NULL DEFAULT 1")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du schéma:", error)
  }
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
