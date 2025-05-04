import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { messageId, feedback } = await request.json()

    if (!messageId || !feedback) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
    }

    // Ici, vous pourriez stocker le feedback dans votre base de données
    // Par exemple avec Prisma :
    // await prisma.aiFeedback.create({
    //   data: {
    //     messageId,
    //     feedback,
    //     userId: session.user.id,
    //   },
    // })

    // Pour l'instant, nous allons simplement logger le feedback
    console.log(`Feedback reçu: ${feedback} pour le message ${messageId} de l'utilisateur ${session.user.email}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erreur dans l'API feedback:", error)
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 })
  }
}
