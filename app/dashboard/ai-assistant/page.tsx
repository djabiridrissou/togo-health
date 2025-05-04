import { MedicalAssistant } from "@/components/ai/medical-assistant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assistant Médical IA</CardTitle>
          <CardDescription>
            Posez vos questions médicales à notre assistant IA. Notez que cet assistant fournit uniquement des
            informations générales et ne remplace pas une consultation médicale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MedicalAssistant />
        </CardContent>
      </Card>
    </div>
  )
}
