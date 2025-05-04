// Client pour l'API Gemini

// Récupération sécurisée de la clé API depuis les variables d'environnement
const apiKey = process.env.GEMINI_API_KEY

interface Message {
  role: "user" | "assistant"
  content: string
}

// Fonction pour interagir avec l'API Gemini
export async function generateMedicalResponse(messages: Message[]) {
  if (!apiKey) {
    throw new Error("La clé API Gemini n'est pas configurée")
  }

  // Construire le contexte de la conversation
  const conversationHistory = messages
    .map((msg) => `${msg.role === "user" ? "Patient" : "Assistant"}: ${msg.content}`)
    .join("\n\n")

  // Ajouter des instructions spécifiques pour l'assistant médical
  const systemPrompt = `
    Tu es un assistant médical professionnel qui fournit des informations médicales générales en français.
    Tu ne poses pas de diagnostic et tu recommandes toujours de consulter un professionnel de santé.
    Tu réponds de manière claire, concise et factuelle.
    Tu cites des sources médicales fiables lorsque c'est pertinent.
    Tu ne donnes jamais de conseils qui pourraient être dangereux.
    
    Voici l'historique de la conversation:
    ${conversationHistory}
    
    Assistant:
  `

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Gemini:", error)
    throw error
  }
}
