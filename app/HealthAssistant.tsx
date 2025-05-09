"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ChevronDown, Mic, PlusCircle, HeartPulse } from 'lucide-react';

// Réponses prédéfinies pour simuler l'IA sans backend
const aiResponses: any = {
  greetings: [
    "Bonjour ! Je suis l'assistant santé de SantéTogo. Comment puis-je vous aider aujourd'hui ?",
    "Bienvenue sur SantéTogo ! Je suis là pour répondre à vos questions sur la santé. Que puis-je faire pour vous ?",
    "Bonjour et bienvenue ! Je suis votre assistant santé virtuel. Comment puis-je vous aider ?",
    "Salutations ! Je suis votre assistant médical numérique. Dites-moi ce qui vous préoccupe.",
    "Bonjour cher utilisateur ! SantéTogo à votre service. Par où commençons-nous ?"
  ],
  
  farewells: [
    "Au revoir ! Prenez soin de vous et n'hésitez pas à revenir si vous avez d'autres questions.",
    "Bonne journée ! N'oubliez pas que votre santé est importante.",
    "À bientôt sur SantéTogo ! Portez-vous bien.",
    "Merci d'avoir utilisé nos services. Prenez soin de votre santé !",
    "Au revoir ! N'hésitez pas à consulter un professionnel si vos symptômes persistent."
  ],
  
  gratitude: [
    "Je vous en prie ! C'est un plaisir de vous aider. Autre chose ?",
    "De rien ! Votre santé est notre priorité. Dites-moi si vous avez d'autres questions.",
    "C'est tout naturel ! N'hésitez pas si vous avez besoin d'autres informations.",
    "Merci à vous ! Je reste disponible si besoin.",
    "Avec plaisir ! Votre bien-être est important pour nous."
  ],
  
  keywords: {
    "rendez-vous": {
      responses: [
        "Pour prendre un rendez-vous, vous pouvez utiliser notre système de réservation en ligne. Allez dans la section 'Services' puis 'Prendre RDV'. Vous pouvez filtrer par spécialité et localisation pour trouver le professionnel qui vous convient.",
        "La prise de rendez-vous est simple : connectez-vous à votre compte, sélectionnez 'Prendre RDV', choisissez la spécialité et le praticien. Vous verrez les créaux disponibles en temps réel.",
        "Vous souhaitez un rendez-vous ? Notre plateforme vous montre les disponibilités des médecins près de chez vous. Vous pouvez même recevoir un rappel SMS la veille."
      ],
      followUp: "Avez-vous besoin d'aide pour trouver un spécialiste particulier ou pour une urgence ?"
    },
    
    "dossier médical": {
      responses: [
        "Votre dossier médical est accessible dans la section 'Mon Profil' > 'Dossier Médical'. Vous pouvez y consulter votre historique, vos ordonnances et vos résultats d'analyses.",
        "Accédez à votre dossier complet sous 'Mon Profil'. Tous vos documents médicaux sont stockés de manière sécurisée et accessible 24h/24.",
        "Vos informations médicales sont centralisées dans votre espace personnel. Vous pouvez aussi autoriser un médecin à y accéder temporairement."
      ],
      followUp: "Souhaitez-vous savoir comment partager votre dossier avec un professionnel de santé ?"
    },
    
    "médicament": {
      responses: [
        "Pour le suivi de vos médicaments, utilisez notre fonctionnalité 'Suivi de Traitement'. Vous recevrez des rappels personnalisés selon votre prescription.",
        "Consultez la section 'Médicaments' pour des informations détaillées sur vos traitements, y compris les posologies et effets secondaires.",
        "Nous pouvons vous aider à gérer votre pharmacie personnelle et vous alerter quand il est temps de renouveler une ordonnance."
      ],
      followUp: "Avez-vous besoin d'informations sur un médicament spécifique ou sur des interactions possibles ?"
    },
    
    "don de sang": {
      responses: [
        "Notre système de don de sang vous permet de vous inscrire comme donneur ou de rechercher des donneurs compatibles en cas d'urgence. Consultez la section 'Réseau de Donneurs de Sang' pour plus d'informations.",
        "Vous souhaitez donner votre sang ? Merci pour ce geste solidaire ! Nous pouvons vous indiquer les centres de collecte les plus proches et leurs horaires.",
        "En cas de besoin urgent de sang, notre réseau peut aider à trouver des donneurs compatibles rapidement."
      ],
      followUp: "Voulez-vous connaître les critères pour donner du sang ou trouver un centre de don ?"
    },
    
    "symptôme": {
      responses: [
        "Je peux vous aider à comprendre certains symptômes, mais rappelez-vous que je ne remplace pas un avis médical professionnel. Pourriez-vous me décrire plus précisément ce que vous ressentez ?",
        "Pour mieux vous orienter, veuillez préciser : depuis combien de temps avez-vous ces symptômes ? Quelle est leur intensité ? Avez-vous d'autres manifestations ?",
        "Vos symptômes pourraient nécessiter une consultation. Je peux vous suggérer des spécialistes adaptés à votre situation."
      ],
      followUp: "Souhaitez-vous que je vous indique les médecins disponibles pour une consultation ?"
    },
    
    "téléconsultation": {
      responses: [
        "Pour accéder à notre service de téléconsultation, rendez-vous dans la section 'Services' puis 'Téléconsultation'. Vous pourrez choisir un médecin disponible et démarrer une consultation vidéo.",
        "Les consultations à distance sont disponibles 7j/7 de 8h à 22h. Sélectionnez simplement un créneau et connectez-vous au moment du rendez-vous.",
        "Notre plateforme de télémedecine vous permet de consulter sans vous déplacer. Tous nos médecins sont habilités à pratiquer la téléconsultation."
      ],
      followUp: "Avez-vous besoin d'aide pour configurer votre première téléconsultation ?"
    },
    
    "urgence": {
      responses: [
        "En cas d'urgence médicale, appelez immédiatement le 112 (numéro d'urgence) ou rendez-vous aux urgences les plus proches. La santé d'abord !",
        "Pour une situation critique, composez le 112 sans tarder. Je peux aussi vous indiquer les services d'urgence les plus proches de votre position actuelle.",
        "Votre santé est primordiale. En cas de doute sur la gravité d'une situation, privilégiez toujours l'appel aux services d'urgence."
      ],
      followUp: "Voulez-vous que je vous localise les hôpitaux les plus proches ?"
    },
    
    "paiement": {
      responses: [
        "Les modes de paiement acceptés dépendent du professionnel de santé. La plupart acceptent les cartes bancaires et les paiements mobiles via notre plateforme sécurisée.",
        "Vous pouvez régler vos consultations directement sur notre plateforme. Nous acceptons les principales cartes de crédit et les transferts mobiles.",
        "Les remboursements par votre mutuelle sont automatiquement calculés lors du paiement. Vous n'aurez qu'à payer le ticket modérateur."
      ],
      followUp: "Avez-vous besoin d'informations sur les tarifs ou les modalités de remboursement ?"
    },
    
    "spécialiste": {
      responses: [
        "Nous avons un large réseau de spécialistes : cardiologues, dermatologues, gynécologues, etc. Dites-moi quelle spécialité vous intéresse et je vous orienterai.",
        "Pour trouver le bon spécialiste, précisez votre besoin et votre localisation. Je peux vous montrer les professionnels disponibles avec leurs créneaux.",
        "Chaque spécialiste sur notre plateforme est certifié et évalué par les patients. Vous pouvez filtrer par langue parlée, localisation et disponibilités."
      ],
      followUp: "Cherchez-vous un spécialiste particulier ou avez-vous des critères spécifiques ?"
    },
    
    "vaccination": {
      responses: [
        "Nous proposons un calendrier vaccinal personnalisé selon votre âge et votre état de santé. Consultez la section 'Vaccination' pour voir les recommandations.",
        "Les centres de vaccination partenaires sont listés sur notre carte interactive. Vous pouvez prendre rendez-vous directement depuis notre plateforme.",
        "Pour les voyages, nous fournissons les recommandations vaccinales par pays et pouvons vous orienter vers des centres de vaccination internationale."
      ],
      followUp: "Avez-vous besoin du calendrier vaccinal standard ou d'informations sur des vaccins spécifiques ?"
    },
    
    "bilan de santé": {
      responses: [
        "Les bilans de santé complets peuvent être programmés dans nos centres partenaires. Nous proposons des packages adaptés à chaque tranche d'âge.",
        "Un bilan de santé préventif est recommandé annuellement. Je peux vous aider à choisir le package le plus adapté à votre situation.",
        "Nos bilans incluent des analyses sanguines, un examen clinique et selon les packages, des examens plus spécialisés comme un électrocardiogramme."
      ],
      followUp: "Souhaitez-vous connaître les différents types de bilans disponibles ou prendre rendez-vous ?"
    },
    
    "nutrition": {
      responses: [
        "Nos nutritionnistes peuvent vous aider à établir un plan alimentaire personnalisé. Prenez rendez-vous dans la section 'Nutrition et Diététique'.",
        "Nous proposons des outils de suivi nutritionnel et des recettes santé adaptées à différentes conditions (diabète, hypertension, etc.).",
        "Pour une évaluation nutritionnelle complète, nos spécialistes utilisent des méthodes scientifiques pour établir un programme sur mesure."
      ],
      followUp: "Cherchez-vous des conseils généraux ou une consultation avec un nutritionniste ?"
    },
    
    "santé mentale": {
      responses: [
        "Votre santé psychologique est importante. Nous avons un réseau de psychologues et psychiatres disponibles pour des consultations en présentiel ou en ligne.",
        "Nos professionnels en santé mentale peuvent vous aider face au stress, à l'anxiété ou à d'autres difficultés. La première consultation est souvent dédiée à une évaluation.",
        "Certaines consultations en psychologie peuvent être partiellement remboursées. Je peux vous orienter vers les praticiens conventionnés."
      ],
      followUp: "Souhaitez-vous des informations sur nos services de soutien psychologique ou prendre rendez-vous ?"
    }
  },
  
  default: [
    "Je ne suis pas sûr de comprendre votre demande. Pouvez-vous préciser comment je peux vous aider concernant votre santé ?",
    "Pourriez-vous reformuler votre question ? Je suis spécialisé dans les informations sur la santé et les services de SantéTogo.",
    "Je n'ai pas toutes les informations sur ce sujet spécifique. Souhaitez-vous être mis en relation avec un professionnel de santé ?",
    "Pouvez-vous développer votre demande ? Je pourrai ainsi vous orienter au mieux vers les services adaptés.",
    "Je suis désolé, je n'ai pas saisi votre demande. Voici quelques sujets sur lesquels je peux vous aider : rendez-vous médicaux, symptômes, médicaments, urgences..."
  ],
  
  escalation: [
    "Je vais vous mettre en relation avec un conseiller santé qui pourra mieux vous aider. Un instant s'il vous plaît...",
    "Pour une réponse plus précise, je vous transfère à un de nos opérateurs. Merci de patienter quelques instants.",
    "Votre question nécessite l'intervention d'un professionnel. Je vous connecte immédiatement à notre service client.",
    "Je pense qu'un conseiller pourra mieux répondre à votre demande. Transfert en cours...",
    "Un expert va prendre le relais pour vous apporter une réponse complète. Veuillez patienter un moment."
  ]
};

// Fonction pour générer une réponse de l'IA basée sur le message de l'utilisateur
const generateAiResponse = (message: any) => {
  // Vérifier si le message est un salut/bonjour
  if (/bonjour|salut|hello|hi|bonsoir|coucou/i.test(message)) {
    return aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)];
  }
  
  // Vérifier pour "merci"
  if (/merci|thanks|thank you/i.test(message)) {
    return aiResponses.gratitude[Math.floor(Math.random() * aiResponses.gratitude.length)];
  }

  // Vérifier pour "au revoir"
  if (/au revoir|bye|adieu|à bientôt|a plus/i.test(message)) {
    return aiResponses.farewells[Math.floor(Math.random() * aiResponses.farewells.length)];
  }
  
  // Chercher des mots-clés dans le message
  for (const keyword in aiResponses.keywords) {
    if (message.toLowerCase().includes(keyword)) {
      // Au lieu de retourner l'objet entier, retournons juste une réponse aléatoire
      const responseObj = aiResponses.keywords[keyword];
      const randomResponse = responseObj.responses[Math.floor(Math.random() * responseObj.responses.length)];
      // Combiner la réponse principale et le suivi
      return `${randomResponse}\n\n${responseObj.followUp}`;
    }
  }
  
  // Réponse par défaut si aucun mot-clé n'est trouvé
  return aiResponses.default[Math.floor(Math.random() * aiResponses.default.length)];
};

export default function HealthAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Bonjour ! Je suis l'assistant santé de SantéTogo. Comment puis-je vous aider aujourd'hui ?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef: any = useRef(null);
  
  // Auto-scroll à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Gestion de l'envoi des messages
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    
    // Simuler la réponse de l'IA avec un délai pour l'effet de "typing"
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: generateAiResponse(newMessage),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Gérer la soumission avec la touche Entrée
  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!isOpen) {
    // Bouton de chat fermé
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
        aria-label="Ouvrir le chat avec l'assistant santé"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-96 flex flex-col bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 z-50">
      {/* Header du chat */}
      <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <HeartPulse className="h-5 w-5 text-orange-400 mr-2" />
          <h3 className="font-semibold">Assistant SantéTogo</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-indigo-700 rounded-full p-1 transition-colors"
            aria-label="Minimiser"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-indigo-700 rounded-full p-1 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Zone des messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 rounded-lg px-4 py-2 ${
                message.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
              <span className={`text-xs mt-1 block text-right ${
                message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
              }`}>
                {message.time}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Zone de saisie */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center gap-2">
          <button 
            className="text-gray-500 hover:text-indigo-600 transition-colors"
            aria-label="Ajouter un fichier"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
          
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question sur la santé..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={1}
          />
          
          <button 
            className="text-gray-500 hover:text-indigo-600 transition-colors"
            aria-label="Activer micro"
          >
            <Mic className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`${
              newMessage.trim() 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } rounded-full p-2 transition-colors`}
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}