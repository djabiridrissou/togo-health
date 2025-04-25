import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, FileText, Heart, Bell, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-bold text-xl">SantéTogo</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Fonctionnalités
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900">
              À propos
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Inscription</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Innovation Numérique au Service du Développement Inclusif au Togo
              </h1>
              <p className="text-xl">
                Améliorez votre accès aux soins de santé grâce à notre plateforme numérique innovante. Gérez vos
                dossiers médicaux, prenez rendez-vous avec des professionnels et suivez vos traitements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Découvrir les fonctionnalités
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Illustration de la plateforme de santé"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Fonctionnalités Clés</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Notre plateforme offre des outils innovants pour améliorer votre expérience de soins de santé.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 p-3 rounded-full w-fit mb-6">
                  <FileText className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dossier Médical Numérique</h3>
                <p className="text-gray-600">
                  Stockage sécurisé de vos informations médicales accessibles à tout moment.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-6">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Prise de Rendez-vous & Téléconsultation</h3>
                <p className="text-gray-600">Réservez des consultations avec des médecins disponibles en ligne.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-amber-100 p-3 rounded-full w-fit mb-6">
                  <Bell className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Rappels de Médicaments</h3>
                <p className="text-gray-600">
                  Notifications intelligentes pour vous aider à respecter votre traitement.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-rose-100 p-3 rounded-full w-fit mb-6">
                  <Heart className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestion des Dons de Sang</h3>
                <p className="text-gray-600">
                  Plateforme interactive pour relier les hôpitaux et les donneurs de sang.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-purple-100 p-3 rounded-full w-fit mb-6">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Confidentialité et Sécurité</h3>
                <p className="text-gray-600">
                  Protection des données personnelles avec chiffrement et authentification des utilisateurs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à améliorer votre expérience de soins de santé?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Rejoignez notre plateforme aujourd'hui et découvrez comment la technologie peut transformer votre accès
              aux soins de santé au Togo.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Créer un compte gratuitement
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-rose-500" />
                <span className="font-bold text-xl">SantéTogo</span>
              </div>
              <p className="text-gray-400">Innovation numérique au service du développement inclusif au Togo.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-gray-400 hover:text-white">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Légal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@santetogo.com</li>
                <li>Téléphone: +228 12 34 56 78</li>
                <li>Adresse: Lomé, Togo</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SantéTogo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
