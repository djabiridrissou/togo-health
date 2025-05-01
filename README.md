# HealthLink : Application Médicale Intelligente

HealthLink est une application web médicale conçue pour améliorer l'accès aux soins en mettant en relation patients, médecins et cliniques de manière sécurisée et efficace. Cette application vise à offrir une expérience utilisateur moderne, intuitive et conforme aux exigences de sécurité les plus strictes dans le domaine médical.

## Objectifs

*   **Améliorer l'accès aux soins :** Faciliter la communication et l'échange d'informations entre les patients et les professionnels de santé.
*   **Sécurité des données :** Assurer la confidentialité et l'intégrité des informations médicales des patients.
*   **Expérience utilisateur :** Offrir une interface utilisateur simple, professionnelle et accessible.
*   **Scalabilité et modularité :** Concevoir une application capable d'évoluer et de s'adapter aux besoins futurs.

## Fonctionnalités Principales

### Patients

*   **Dossier médical sécurisé :** Création et consultation du dossier médical protégé par un code PIN personnel.
*   **Gestion du consentement :** Contrôle total sur la modification et l'accès au dossier médical.
*   **Prise de rendez-vous :** Facilité de prise de rendez-vous avec les médecins.
*   **Affiliation à une clinique :** Possibilité d'être rattaché à une clinique pour un suivi local.
*   **Notifications et rappels :** Réception de rappels de traitement et de notifications importantes.
*   **Messagerie sécurisée :** Chat en temps réel avec le médecin.

### Médecins

*   **Gestion des patients :** Accès aux dossiers des patients après autorisation via PIN.
*   **Prescription d'ordonnances :** Proposition d'ordonnances avec validation du patient.
*   **Communication :** Chat avec les patients et suivi de l'historique.
*   **Base de données médicale :** Accès à une base de données sur les maladies (flux actualisé).

### Cliniques

*   **Gestion des utilisateurs :** Gestion des patients affiliés et des médecins employés.
*   **Tableau de bord :** Accès à un tableau de bord de gestion.
*   **Gestion des rôles et permissions :** Configuration des droits d'accès.
*   **Campagnes de santé :** Possibilité de lancer des campagnes de santé et de dons de sang.
*   **Statistiques anonymisées :** Accès à des données statistiques pour l'amélioration des services.

### Fonctionnalités avancées

*   **Géolocalisation :** Localisation des cliniques proches et des médecins disponibles.
*   **Messagerie en temps réel :** Chat médecin-patient sécurisé.
*   **Intégration IA :** Chatbot médical pour l'explication des symptômes et accès à un fil d'actualités médicales.
*   **Gestion multi-rôle et multi-clinique :** Affiliation flexible des médecins et des patients.

## Technologies Utilisées

*   **Framework :** Next.js 14 (App Router, SSR, API routes, PWA support)
*   **UI :** Tailwind CSS + shadcn/ui
*   **Authentification :** NextAuth.js (avec rôles)
*   **Base de données :** PostgreSQL via Prisma (relationnelle et robuste)
*   **Sécurité :** Données cryptées (PIN en hash Bcrypt), protection par middleware
*   **Messagerie :** WebSocket/Firebase
*   **IA:** OpenAI
*   **Cartographie :** Google Maps ou Leaflet
*   **Multilingue :** i18n
*   **PWA:** Service Worker

## Installation Locale

1.  **Cloner le dépôt :**


