# Documentation Backend - VITALIS Clinic Management System

## Vue d'ensemble

Cette documentation décrit l'architecture et la structure complète du backend pour le système de gestion de clinique VITALIS.

## Technologies utilisées

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Base de données**: PostgreSQL (recommandé) ou MySQL
- **Génération PDF**: Puppeteer
- **Authentification**: JWT (JSON Web Tokens)
- **Validation**: Joi ou express-validator

## Structure des fichiers

La documentation est organisée en plusieurs fichiers :

1. [Architecture générale](./01-architecture.md) - Structure du projet et organisation
2. [Modèles de données](./02-models.md) - Tous les modèles Sequelize
3. [Routes - Authentification](./03-routes-auth.md) - Routes d'authentification et utilisateurs
4. [Routes - Patients](./04-routes-patients.md) - Gestion des patients
5. [Routes - Consultations](./05-routes-consultations.md) - Consultations médicales
6. [Routes - Laboratoire](./06-routes-lab.md) - Examens de laboratoire
7. [Routes - Imagerie](./07-routes-imaging.md) - Examens d'imagerie
8. [Routes - Pharmacie](./08-routes-pharmacy.md) - Gestion de la pharmacie
9. [Routes - Paiements](./09-routes-payments.md) - Gestion des paiements
10. [Routes - Paiements](./10-routes-payments.md) - Gestion des paiements
11. [Routes - Statistiques](./11-routes-stats.md) - Statistiques et rapports
12. [Routes - Accueil/Réception](./07-routes-reception.md) - Routes spécifiques à la réception
13. [Routes - Examens d'Imagerie](./08-routes-imaging.md) - Gestion des examens d'imagerie
14. [Routes - Pharmacie](./09-routes-pharmacy.md) - Gestion de la pharmacie
15. [Routes Manquantes](./12-routes-missing.md) - Routes supplémentaires identifiées après analyse du frontend
16. [Génération PDF](./13-pdf-generation.md) - Génération de documents PDF avec Puppeteer
17. [Middleware et Utilitaires](./14-middleware-utils.md) - Middleware personnalisés et fonctions utilitaires
18. [Routes - Catégories Pharmacie](./15-routes-pharmacy-categories.md) - Gestion des catégories de produits de pharmacie
19. [Routes - Gestion des Lits](./16-routes-beds.md) - Gestion des lits classiques et VIP
20. [Routes - Dossiers Patients et Archivage](./17-routes-patient-dossiers.md) - Gestion des dossiers patients et archivage par médecin
21. [Routes - Prix de Consultation](./18-routes-consultation-price.md) - Gestion du prix unique de consultation
22. [Routes - Historique Laboratoire](./19-routes-lab-history.md) - Historique des demandes de laboratoire
23. [Routes - Historique Imagerie](./20-routes-imaging-history.md) - Historique des demandes d'imagerie
24. [Routes - Gestion des Consultations](./21-routes-consultation-management.md) - Création unique et mise à jour des consultations
25. [Routes - Items Personnalisés](./22-routes-custom-items.md) - Gestion des items personnalisés (onglet "Autre")

## Installation et configuration

### Prérequis

- Node.js (version 18 ou supérieure)
- PostgreSQL ou MySQL
- npm ou yarn

### Installation des dépendances

```bash
npm install express sequelize sequelize-cli pg puppeteer jsonwebtoken bcryptjs joi cors dotenv
npm install --save-dev nodemon
```

### Structure de dossiers recommandée

```
backend/
├── config/
│   └── database.js
├── models/
│   ├── index.js
│   └── [tous les modèles]
├── migrations/
├── seeders/
├── routes/
│   ├── index.js
│   └── [tous les fichiers de routes]
├── controllers/
│   └── [tous les contrôleurs]
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── services/
│   ├── pdfService.js
│   └── [autres services]
├── utils/
│   └── [fonctions utilitaires]
├── .env
├── .env.example
├── package.json
└── server.js
```

## Variables d'environnement

Créer un fichier `.env` avec les variables suivantes :

```
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitalis_clinic
DB_USER=postgres
DB_PASSWORD=password
DB_DIALECT=postgres

# JWT
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRES_IN=24h

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Démarrage

1. Configurer la base de données
2. Exécuter les migrations : `npx sequelize-cli db:migrate`
3. Exécuter les seeders (optionnel) : `npx sequelize-cli db:seed:all`
4. Démarrer le serveur : `npm run dev`

## Prochaines étapes

Consultez les fichiers de documentation suivants pour les détails de chaque partie du système.
