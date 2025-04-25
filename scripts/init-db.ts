import { seedDatabase } from "../lib/db/index"

async function main() {
  try {
    await seedDatabase()
    console.log("Base de données initialisée avec succès")
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    process.exit(1)
  }
}

main()
