"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FeedbackButtonProps {
  messageId: string
}

export function FeedbackButton({ messageId }: FeedbackButtonProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const { toast } = useToast()

  const handleFeedback = async (type: "positive" | "negative") => {
    if (feedback === type) return

    setFeedback(type)

    try {
      // Ici, vous pourriez envoyer le feedback à votre backend
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          feedback: type,
        }),
      })

      toast({
        title: "Merci pour votre feedback",
        description: "Votre avis nous aide à améliorer notre assistant IA.",
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error)
      setFeedback(null)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 rounded-full ${feedback === "positive" ? "bg-green-100 text-green-700" : ""}`}
        onClick={() => handleFeedback("positive")}
        title="Réponse utile"
      >
        <ThumbsUp className="h-3 w-3" />
        <span className="sr-only">Réponse utile</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 rounded-full ${feedback === "negative" ? "bg-red-100 text-red-700" : ""}`}
        onClick={() => handleFeedback("negative")}
        title="Réponse non utile"
      >
        <ThumbsDown className="h-3 w-3" />
        <span className="sr-only">Réponse non utile</span>
      </Button>
    </div>
  )
}
