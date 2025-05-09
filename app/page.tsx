import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, FileText, Heart, Bell, Shield, Search, MapPin, Users, HeartPulse, BookOpen, ChevronRight } from "lucide-react"
import HealthAssistant from "./HealthAssistant"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header avec nouvelle palette */}
      <header className="bg-indigo-900 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-orange-400" />
            <span className="font-bold text-xl">SantéTogo</span>
          </div>
          
          {/* Barre de recherche ajoutée */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Rechercher un service ou un médecin..." 
                className="w-full px-4 py-2 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Search className="absolute right-3 top-2 h-5 w-5 text-gray-500" />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#services" className="text-gray-200 hover:text-white">
              Services
            </Link>
            <Link href="#apropos" className="text-gray-200 hover:text-white">
              À propos
            </Link>
            <Link href="#contact" className="text-gray-200 hover:text-white">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-indigo-800">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Inscription</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section avec design asymétrique */}
        <section className="bg-indigo-900 text-white py-16 relative overflow-hidden">
          {/* Formes décoratives */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-800 rounded-bl-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-tr-full opacity-30"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-7 space-y-6">
                <div className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Nouveau: Téléconsultation disponible
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Santé Numérique <span className="text-orange-400">Accessible</span> Pour Tous au Togo
                </h1>
                <p className="text-xl text-gray-200">
                  Notre plateforme connecte patients, médecins et établissements de santé pour un système de soins plus efficace, transparent et inclusif.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                      Créer mon dossier santé
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Voir la démonstration
                    </Button>
                  </Link>
                </div>
                
                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 pt-8 mt-4 border-t border-indigo-800">
                  <div>
                    <div className="text-3xl font-bold text-orange-400">15+</div>
                    <div className="text-gray-300">Hôpitaux partenaires</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400">200+</div>
                    <div className="text-gray-300">Professionnels de santé</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400">5000+</div>
                    <div className="text-gray-300">Patients servis</div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-5">
                <div className="bg-white p-1 rounded-lg shadow-xl rotate-3 transform hover:rotate-0 transition-transform duration-300">
                  <img
                    src="/images/logominis.jpg"
                    alt="Application SantéTogo"
                    className="rounded-lg w-full"
                  />
                </div>
                
                {/* Badges de confiance */}
                <div className="flex justify-center gap-4 mt-8">
                  <div className="bg-indigo-800 px-4 py-2 rounded-lg flex items-center">
                    <Shield className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm">Données Sécurisées</span>
                  </div>
                  <div className="bg-indigo-800 px-4 py-2 rounded-lg flex items-center">
                    <BookOpen className="h-5 w-5 text-orange-400 mr-2" />
                    <span className="text-sm">Certifié</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Comment ça marche (Nouvelle section) */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-indigo-900">Comment ça marche</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                En quelques étapes simples, prenez le contrôle de votre santé
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Étape 1 */}
              <div className="relative">
                <div className="bg-white rounded-xl shadow-md p-8 h-full border-t-4 border-orange-500 z-10 relative">
                  <div className="absolute -top-5 -left-5 bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">1</div>
                  <h3 className="text-xl font-bold mb-4 text-indigo-900">Créez votre profil</h3>
                  <p className="text-gray-600">Inscrivez-vous et complétez votre dossier médical personnel en toute sécurité.</p>
                </div>
                <div className="hidden md:block absolute top-1/2 left-full w-16 h-0.5 bg-orange-200 z-0">
                  <ChevronRight className="absolute -right-1 -top-2 text-orange-400" />
                </div>
              </div>

              {/* Étape 2 */}
              <div className="relative">
                <div className="bg-white rounded-xl shadow-md p-8 h-full border-t-4 border-orange-500 z-10 relative">
                  <div className="absolute -top-5 -left-5 bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">2</div>
                  <h3 className="text-xl font-bold mb-4 text-indigo-900">Trouvez un spécialiste</h3>
                  <p className="text-gray-600">Recherchez et contactez des professionnels de santé selon vos besoins.</p>
                </div>
                <div className="hidden md:block absolute top-1/2 left-full w-16 h-0.5 bg-orange-200 z-0">
                  <ChevronRight className="absolute -right-1 -top-2 text-orange-400" />
                </div>
              </div>

              {/* Étape 3 */}
              <div className="relative">
                <div className="bg-white rounded-xl shadow-md p-8 h-full border-t-4 border-orange-500 z-10 relative">
                  <div className="absolute -top-5 -left-5 bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">3</div>
                  <h3 className="text-xl font-bold mb-4 text-indigo-900">Prenez rendez-vous</h3>
                  <p className="text-gray-600">Choisissez entre consultation physique ou téléconsultation selon votre préférence.</p>
                </div>
                <div className="hidden md:block absolute top-1/2 left-full w-16 h-0.5 bg-orange-200 z-0">
                  <ChevronRight className="absolute -right-1 -top-2 text-orange-400" />
                </div>
              </div>

              {/* Étape 4 */}
              <div>
                <div className="bg-white rounded-xl shadow-md p-8 h-full border-t-4 border-orange-500 relative">
                  <div className="absolute -top-5 -left-5 bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">4</div>
                  <h3 className="text-xl font-bold mb-4 text-indigo-900">Suivez votre santé</h3>
                  <p className="text-gray-600">Accédez à votre historique médical et recevez des rappels pour vos traitements.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section (Ancien Features renommé) */}
        <section id="services" className="py-20 bg-gradient-to-br from-indigo-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">NOS SERVICES</span>
              <h2 className="text-3xl font-bold mb-4 text-indigo-900">Solutions Numériques pour la Santé</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Des outils innovants pour répondre aux besoins spécifiques du système de santé togolais.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y--1 group">
                <div className="bg-indigo-100 p-3 rounded-full w-fit mb-6 group-hover:bg-indigo-200 transition-colors">
                  <FileText className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">Dossier Médical Numérique</h3>
                <p className="text-gray-600 mb-4">
                  Stockage sécurisé de vos informations médicales accessibles à tout moment et partagées avec vos médecins.
                </p>
                <Link href="#" className="text-orange-500 hover:text-orange-600 flex items-center">
                  En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Service 2 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-1 group">
                <div className="bg-orange-100 p-3 rounded-full w-fit mb-6 group-hover:bg-orange-200 transition-colors">
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">Téléconsultation & Rendez-vous</h3>
                <p className="text-gray-600 mb-4">
                  Consultez un médecin à distance ou réservez des rendez-vous physiques selon vos disponibilités.
                </p>
                <Link href="#" className="text-orange-500 hover:text-orange-600 flex items-center">
                  En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Service 3 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-1 group">
                <div className="bg-purple-100 p-3 rounded-full w-fit mb-6 group-hover:bg-purple-200 transition-colors">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">Suivi de Traitement</h3>
                <p className="text-gray-600 mb-4">
                  Rappels personnalisés pour vos médicaments et notifications pour vos rendez-vous médicaux.
                </p>
                <Link href="#" className="text-orange-500 hover:text-orange-600 flex items-center">
                  En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Service 4 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-1 group">
                <div className="bg-red-100 p-3 rounded-full w-fit mb-6 group-hover:bg-red-200 transition-colors">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">Réseau de Donneurs de Sang</h3>
                <p className="text-gray-600 mb-4">
                  Plateforme interactive connectant hôpitaux et donneurs pour des dons de sang efficaces et urgents.
                </p>
                <Link href="#" className="text-orange-500 hover:text-orange-600 flex items-center">
                  En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Service 5 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-1 group">
                <div className="bg-green-100 p-3 rounded-full w-fit mb-6 group-hover:bg-green-200 transition-colors">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">Cartographie des Services</h3>
                <p className="text-gray-600 mb-4">
                  Localisez facilement les centres de santé, pharmacies et spécialistes les plus proches de vous.
                </p>
                <Link href="#" className="text-orange-500 hover:text-orange-600 flex items-center">
                  En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {/* Service 6 */}
              <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-1 group">
                <div className="bg-blue-100 p-3 rounded-full w-fit mb-6 group-hover:bg-blue-200 transition-colors">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">Communauté Santé</h3>
                <p className="text-gray-600 mb-4">
                  Échangez avec d'autres patients et professionnels dans des forums thématiques modérés.
                </p>
                <Link href="#" className="text-orange-500 hover:text-orange-600 flex items-center">
                  En savoir plus <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages Section (Nouvelle) */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-4">TÉMOIGNAGES</span>
              <h2 className="text-3xl font-bold mb-4 text-indigo-900">Ce que disent nos utilisateurs</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez comment SantéTogo transforme l'expérience des soins de santé au quotidien
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Témoignage 1 */}
              <div className="bg-indigo-50 p-8 rounded-xl relative">
                <div className="text-5xl font-serif text-indigo-200 absolute top-4 left-4">"</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 italic">
                    "Grâce à SantéTogo, je peux maintenant suivre tous mes rendez-vous médicaux et recevoir des rappels pour mes médicaments. Ça a vraiment changé ma façon de gérer ma santé."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-indigo-600">KA</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Kokou Amegan</h4>
                      <p className="text-sm text-gray-600">Patient, Lomé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Témoignage 2 */}
              <div className="bg-orange-50 p-8 rounded-xl relative">
                <div className="text-5xl font-serif text-orange-200 absolute top-4 left-4">"</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 italic">
                    "En tant que médecin, cette plateforme me permet de mieux suivre mes patients et d'avoir accès à leur historique médical complet. C'est un gain de temps considérable."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-orange-600">AD</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Dr. Ama Dogbe</h4>
                      <p className="text-sm text-gray-600">Médecin généraliste, Kpalimé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Témoignage 3 */}
              <div className="bg-purple-50 p-8 rounded-xl relative">
                <div className="text-5xl font-serif text-purple-200 absolute top-4 left-4">"</div>
                <div className="relative z-10">
                  <p className="text-gray-700 mb-6 italic">
                    "Le système de don de sang nous a permis de répondre plus rapidement aux urgences. La mise en relation avec les donneurs est beaucoup plus efficace."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-purple-600">FK</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Foli Kodjo</h4>
                      <p className="text-sm text-gray-600">Directeur, Centre Hospitalier de Sokodé</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-900 text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">Rejoignez la révolution de la santé numérique au Togo</h2>
                <p className="text-xl text-indigo-100">
                  Créez votre compte et commencez à profiter d'un accès simplifié aux soins de santé.
                </p>
              </div>
              <div className="md:w-1/3 flex justify-center md:justify-end">
                <Link href="/register">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-indigo-950 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <HeartPulse className="h-6 w-6 text-orange-400" />
                <span className="font-bold text-xl">SantéTogo</span>
              </div>
              <p className="text-indigo-200 mb-6">Innovation numérique au service du développement inclusif au Togo.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-orange-500 flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  {/* Icône Facebook */}
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-orange-500 flex items-center justify-center transition-colors">
                  <span className="sr-only">Twitter</span>
                  {/* Icône Twitter */}
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-orange-500 flex items-center justify-center transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  {/* Icône LinkedIn */}
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Liens Rapides</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="#apropos" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Légal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-indigo-200 hover:text-orange-400 transition-colors">
                    Protection des données
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Contact</h3>
              <ul className="space-y-3 text-indigo-200">
                <li className="flex items-center">
                  <div className="bg-indigo-800 p-2 rounded-full mr-3">
                    {/* Icône email */}
                  </div>
                  contact@santetogo.com
                </li>
                <li className="flex items-center">
                  <div className="bg-indigo-800 p-2 rounded-full mr-3">
                    {/* Icône téléphone */}
                  </div>
                  +228 12 34 56 78
                </li>
                <li className="flex items-center">
                  <div className="bg-indigo-800 p-2 rounded-full mr-3">
                    {/* Icône adresse */}
                  </div>
                  Lomé, Togo
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-indigo-800 mt-12 pt-8 text-center text-indigo-300">
            <p>&copy; {new Date().getFullYear()} SantéTogo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
      
      {/* Assistant IA */}
      [<HealthAssistant />]
    </div>
  )
}