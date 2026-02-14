# Routes - Gestion des Patients

## Base URL
`/api/v1/patients`

## Vue d'ensemble

Les routes de patients gèrent toutes les opérations liées aux patients, y compris l'historique complet, les dossiers de consultation, et la timeline des événements.

## Page "Dossiers patients" (Frontend)

La page `/patients` affiche l'historique complet d'un patient avec plusieurs onglets :

1. **Dossiers** : Liste de tous les dossiers de consultation
2. **Parcours (Timeline)** : Chronologie de tous les événements
3. **Consultations** : Liste de toutes les consultations
4. **Labo** : Demandes et résultats de laboratoire (masqué pour réception)
5. **Ordonnances** : Toutes les ordonnances prescrites

**Permissions** :
- `reception` : Ne peut pas accéder à cette page (redirigé vers dashboard)
- `admin`, `doctor`, `lab` : Accès complet
- Les résultats de laboratoire sont filtrés pour le rôle `reception` dans la timeline

## Routes principales

### GET `/api/v1/patients`
**Description**: Liste tous les patients avec pagination et filtres

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional) - Recherche par nom, vitalisId, ou téléphone
- `date` (string, optional, format: YYYY-MM-DD) - Filtrer par date d'enregistrement

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "vitalisId": "VTL-2026-00001",
        "firstName": "string",
        "lastName": "string",
        "dateOfBirth": "date",
        "gender": "M|F",
        "phone": "string",
        "email": "string|null",
        "address": "string|null",
        "age": 40,
        "createdAt": "date"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

**Logique**:
- Appliquer les filtres de recherche
- Filtrer par date si fournie
- Paginer les résultats
- Calculer l'âge de chaque patient
- Retourner la liste paginée

### GET `/api/v1/patients/export`
**Description**: Exporter la liste des patients en Excel (admin uniquement)

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `search` (string, optional)
- `date` (string, optional)

**Réponse (200)**:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Fichier Excel en téléchargement

**Logique**:
- Récupérer tous les patients (sans pagination) selon les filtres
- Générer un fichier Excel avec les colonnes :
  - ID Vitalis
  - Nom complet
  - Date de naissance
  - Âge
  - Sexe
  - Téléphone
  - Email
  - Adresse
  - Date d'enregistrement
- Retourner le fichier en téléchargement

### GET `/api/v1/patients/stats`
**Description**: Statistiques sur les patients

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `date` (string, optional) - Filtrer par date

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "total": 1000,
    "today": 12,
    "thisMonth": 150,
    "byGender": {
      "M": 520,
      "F": 480
    }
  }
}
```

### GET `/api/v1/patients/:id`
**Description**: Récupérer les détails d'un patient spécifique

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "vitalisId": "VTL-2026-00001",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "M|F",
    "phone": "string",
    "email": "string|null",
    "address": "string|null",
    "emergencyContact": "string|null",
    "age": 40,
    "bed": {
      "id": "uuid",
      "number": "101",
      "type": "classic|vip"
    } | null,
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Logique**:
- Récupérer le patient avec ses relations (lit occupé)
- Calculer l'âge
- Retourner les informations complètes

### POST `/api/v1/patients`
**Description**: Créer un nouveau patient

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "dateOfBirth": "date (required, format: YYYY-MM-DD)",
  "gender": "M|F (required)",
  "phone": "string (required)",
  "email": "string (optional)",
  "address": "string (optional)",
  "emergencyContact": "string (optional)"
}
```

**Réponse succès (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "vitalisId": "VTL-2026-00001",
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "M|F",
    "phone": "string",
    "email": "string|null",
    "address": "string|null",
    "emergencyContact": "string|null",
    "createdAt": "date"
  }
}
```

**Logique**:
- Valider les données d'entrée
- Générer automatiquement le `vitalisId` (format: VTL-YYYY-XXXXX)
  - YYYY = année courante
  - XXXXX = numéro séquentiel (5 chiffres avec zéros à gauche)
- Créer le patient
- Retourner les informations créées

### PUT `/api/v1/patients/:id`
**Description**: Modifier un patient existant

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "dateOfBirth": "date (optional)",
  "gender": "M|F (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "address": "string (optional)",
  "emergencyContact": "string (optional)"
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "vitalisId": "VTL-2026-00001",
    "firstName": "string",
    "lastName": "string",
    "updatedAt": "date"
  }
}
```

**Logique**:
- Vérifier que le patient existe
- Valider les données
- Mettre à jour le patient
- Retourner les informations mises à jour

### GET `/api/v1/patients/:id/history`
**Description**: Récupérer l'historique complet d'un patient (toutes les données)

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "uuid",
      "vitalisId": "VTL-2026-00001",
      "firstName": "string",
      "lastName": "string",
      "dateOfBirth": "date",
      "gender": "M|F",
      "phone": "string",
      "email": "string|null",
      "address": "string|null",
      "age": 40
    },
    "consultations": [
      {
        "id": "uuid",
        "doctor": {...},
        "status": "string",
        "symptoms": "string|null",
        "diagnosis": "string|null",
        "createdAt": "date"
      }
    ],
    "labRequests": [
      {
        "id": "uuid",
        "status": "string",
        "exams": [...],
        "results": {...} | null,
        "createdAt": "date"
      }
    ],
    "imagingRequests": [
      {
        "id": "uuid",
        "status": "string",
        "exams": [...],
        "results": "string|null",
        "createdAt": "date"
      }
    ],
    "prescriptions": [
      {
        "id": "uuid",
        "doctor": {...},
        "status": "string",
        "items": [...],
        "createdAt": "date"
      }
    ],
    "payments": [
      {
        "id": "uuid",
        "amount": 15000.00,
        "type": "string",
        "status": "string",
        "createdAt": "date"
      }
    ],
    "dossiers": [
      {
        "id": "uuid",
        "doctor": {...},
        "status": "active|completed|archived",
        "consultation": {...} | null,
        "createdAt": "date",
        "completedAt": "date|null",
        "archivedAt": "date|null"
      }
    ]
  }
}
```

**Logique**:
- Récupérer le patient avec toutes ses informations
- Récupérer toutes les consultations avec les informations du médecin
- Récupérer toutes les demandes de laboratoire avec les examens et résultats
- Récupérer toutes les demandes d'imagerie avec les examens et résultats
- Récupérer toutes les ordonnances avec les items
- Récupérer tous les paiements
- Récupérer tous les dossiers de consultation avec leurs statuts
- Retourner l'historique complet structuré

**Note**: Pour le rôle `reception`, les résultats de laboratoire et d'imagerie ne doivent pas être inclus.

### GET `/api/v1/patients/:id/dossiers`
**Description**: Récupérer uniquement les dossiers de consultation d'un patient

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctor": {
        "id": "uuid",
        "name": "string",
        "department": "string|null"
      },
      "status": "active|completed|archived",
      "consultation": {
        "id": "uuid",
        "symptoms": "string|null",
        "diagnosis": "string|null",
        "notes": "string|null"
      } | null,
      "labRequestIds": ["uuid"],
      "prescriptionIds": ["uuid"],
      "createdAt": "date",
      "completedAt": "date|null",
      "archivedAt": "date|null"
    }
  ]
}
```

**Logique**:
- Récupérer tous les dossiers de consultation du patient
- Inclure les informations du médecin
- Inclure la consultation associée si elle existe
- Inclure les IDs des demandes labo et ordonnances liées
- Trier par date de création (plus récent en premier)
- Retourner la liste des dossiers

### GET `/api/v1/patients/:id/consultations`
**Description**: Récupérer toutes les consultations d'un patient

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctor": {
        "id": "uuid",
        "name": "string"
      },
      "status": "waiting|in_progress|completed",
      "symptoms": "string|null",
      "diagnosis": "string|null",
      "notes": "string|null",
      "vitals": {...} | null,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

**Logique**:
- Récupérer toutes les consultations du patient
- Inclure les informations du médecin
- Trier par date (plus récent en premier)
- Retourner la liste

### GET `/api/v1/patients/:id/prescriptions`
**Description**: Récupérer toutes les ordonnances d'un patient

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctor": {...},
      "status": "draft|sent_to_pharmacy|completed",
      "items": [
        {
          "medication": "string",
          "dosage": "string",
          "frequency": "string",
          "duration": "string",
          "quantity": "string"
        }
      ],
      "notes": "string|null",
      "createdAt": "date"
    }
  ]
}
```

### GET `/api/v1/patients/:id/timeline`
**Description**: Récupérer la timeline chronologique des événements d'un patient

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `includeLabResults` (boolean, default: true) - Inclure les résultats de laboratoire (filtré pour réception)

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "registration|consultation|lab_request|lab_result|imaging_request|imaging_result|prescription|payment",
      "title": "string",
      "description": "string",
      "date": "date",
      "createdBy": {
        "id": "uuid",
        "name": "string",
        "role": "string"
      },
      "metadata": {
        "consultationId": "uuid" | null,
        "labRequestId": "uuid" | null,
        "prescriptionId": "uuid" | null,
        "paymentId": "uuid" | null
      }
    }
  ]
}
```

**Logique**:
- Récupérer tous les événements liés au patient :
  - Enregistrement du patient
  - Consultations
  - Demandes de laboratoire
  - Résultats de laboratoire (si autorisé)
  - Demandes d'imagerie
  - Résultats d'imagerie
  - Ordonnances
  - Paiements
- Trier par date (plus récent en premier)
- Formater chaque événement avec un titre et une description appropriés
- Inclure les métadonnées pour permettre la navigation vers les détails
- Retourner la liste chronologique

**Types d'événements**:
- `registration`: Enregistrement du patient
- `consultation`: Consultation médicale
- `lab_request`: Demande d'examen de laboratoire
- `lab_result`: Résultat d'examen de laboratoire
- `imaging_request`: Demande d'examen d'imagerie
- `imaging_result`: Résultat d'examen d'imagerie
- `prescription`: Ordonnance médicale
- `payment`: Paiement

## Intégration Frontend-Backend pour l'Historique

### Flux de chargement de la page "Dossiers patients"

1. **Frontend charge** la page `/patients`
2. **Frontend affiche** la liste des patients avec recherche
3. **Utilisateur sélectionne** un patient
4. **Frontend envoie** plusieurs requêtes en parallèle :
   - `GET /api/v1/patients/:id` - Informations du patient
   - `GET /api/v1/patients/:id/dossiers` - Dossiers de consultation
   - `GET /api/v1/patients/:id/timeline` - Timeline des événements
   - `GET /api/v1/patients/:id/consultations` - Consultations
   - `GET /api/v1/patients/:id/prescriptions` - Ordonnances
   - `GET /api/v1/lab/requests?patientId=:id` - Demandes labo (si autorisé)
5. **Frontend affiche** les données dans les onglets correspondants

### Alternative : Route unique pour l'historique complet

Pour optimiser les performances, une route unique peut être utilisée :

**GET `/api/v1/patients/:id/history`** retourne toutes les données en une seule requête.

**Avantages** :
- Moins de requêtes réseau
- Données cohérentes (même timestamp)
- Meilleure performance

**Inconvénients** :
- Charge plus importante sur le serveur
- Moins de flexibilité (doit charger tout même si un seul onglet est ouvert)

**Recommandation** : Utiliser la route unique `/history` pour charger toutes les données initialement, puis utiliser les routes spécifiques pour les mises à jour ou le rafraîchissement d'un onglet particulier.

### Structure des Dossiers de Consultation

Chaque dossier de consultation contient :
- **Informations de base** : ID, patient, médecin, statut, dates
- **Consultation associée** : Si une consultation a été créée
- **Demandes de laboratoire** : IDs des demandes liées
- **Demandes d'imagerie** : IDs des demandes liées
- **Ordonnances** : IDs des ordonnances prescrites
- **Statuts** :
  - `active` : Dossier en cours, consultation en cours
  - `completed` : Consultation terminée, dossier prêt à être archivé
  - `archived` : Dossier archivé

### Filtrage selon le Rôle

**Pour le rôle `reception`** :
- Les résultats de laboratoire ne sont pas inclus dans la timeline
- La page `/patients` est inaccessible (redirection vers dashboard)
- Seules les informations de base du patient sont visibles

**Pour les autres rôles** (`admin`, `doctor`, `lab`) :
- Accès complet à toutes les informations
- Tous les onglets sont disponibles
- Résultats de laboratoire et d'imagerie visibles
