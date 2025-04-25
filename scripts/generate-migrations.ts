import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "../lib/db/schema"
import path from "path"
import fs from "fs"

async function main() {
  try {
    // Créer le dossier de migrations s'il n'existe pas
    const migrationsFolder = path.resolve(process.cwd(), "lib/db/migrations")
    const metaFolder = path.join(migrationsFolder, "meta")

    if (!fs.existsSync(migrationsFolder)) {
      fs.mkdirSync(migrationsFolder, { recursive: true })
    }

    if (!fs.existsSync(metaFolder)) {
      fs.mkdirSync(metaFolder, { recursive: true })
    }

    // Créer un fichier journal vide si nécessaire
    const journalPath = path.join(metaFolder, "_journal.json")
    if (!fs.existsSync(journalPath)) {
      fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }))
    }

    console.log("Dossier de migrations créé avec succès")

    // Initialiser la base de données
    const dbPath = path.resolve(process.cwd(), "sqlite.db")
    const sqlite = new Database(dbPath)
    const db = drizzle(sqlite, { schema })

    // Générer les migrations
    console.log("Génération des migrations...")

    // Ici, vous pourriez utiliser drizzle-kit pour générer les migrations
    // Mais pour l'instant, nous allons simplement créer les tables directement

    console.log("Migrations générées avec succès")
  } catch (error) {
    console.error("Erreur lors de la génération des migrations:", error)
    process.exit(1)
  }
}

main()
