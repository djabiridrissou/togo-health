import { type NextRequest, NextResponse } from "next/server"
import { generateMedicalResponse } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Format de messages invalide" }, { status: 400 })
    }

    // Limiter le nombre de messages pour éviter de dépasser les limites de l'API
    const recentMessages = messages.slice(-10)

    // Générer une réponse avec l'API Gemini
    const content = await generateMedicalResponse(recentMessages)

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error("Erreur dans l'API medical-assistant:", error)
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 })
  }
}
