# Routes - Dossiers Patients et Archivage

## Base URL
`/api/v1/patients/:id/dossiers` et `/api/v1/consultations/dossiers/:id`

## Vue d'ensemble

Les dossiers patients représentent l'ensemble des consultations et actes médicaux d'un patient lors d'une visite ou d'un épisode de soins. Un dossier peut être dans différents états : `active`, `completed`, ou `archived`. L'archivage est une action critique qui ne peut être effectuée que par un médecin et qui rend le dossier en lecture seule.

## Modèle de données

### ConsultationDossier

**Table**: `consultation_dossiers`

**Champs**:
- `id` (UUID, Primary Key)
- `patientId` (UUID, Foreign Key → patients.id, NOT NULL)
- `doctorId` (UUID, Foreign Key → users.id, NOT NULL)
- `assignmentId` (UUID, Foreign Key → doctor_assignments.id, NULLABLE) - Lien vers l'assignation médecin
- `consultationId` (UUID, Foreign Key → consultations.id, NULLABLE) - Consultation principale
- `status` (ENUM('active', 'completed', 'archived'), NOT NULL, DEFAULT 'active')
- `createdAt` (DATE, NOT NULL)
- `updatedAt` (DATE, NOT NULL)  
- `completedAt` (DATE, NULLABLE) - Date de fin de consultation
- `archivedAt` (DATE, NULLABLE) - Date d'archivage
- `archivedBy` (UUID, Foreign Key → users.id, NULLABLE) - Médecin qui a archivé

**Relations**:
- `belongsTo` Patient
- `belongsTo` User (doctor)
- `belongsTo` Consultation (optionnel)
- `hasMany` LabRequest (via labRequestIds)
- `hasMany` Prescription (via prescriptionIds)

**Indexes**:
- Index sur `patientId`
- Index sur `doctorId`
- Index sur `status`
- Index sur `assignmentId`

**Contraintes**:
- Un dossier ne peut être archivé que s'il est `completed`
- Seul un médecin peut archiver un dossier
- Un dossier archivé ne peut plus être modifié

## Routes

### GET `/api/v1/patients/:id/dossiers` 

**Description**: Liste tous les dossiers d'un patient

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du patient

**Query Parameters**:
- `status` (string, optional) - Filtrer par statut: 'active', 'completed', 'archived', ou 'all' (défaut)
- `includeConsultation` (boolean, optional, default: true) - Inclure les détails de la consultation
- `includeLabRequests` (boolean, optional, default: true) - Inclure les demandes de laboratoire
- `includePrescriptions` (boolean, optional, default: true) - Inclure les ordonnances

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patientId": "patient-uuid",
      "doctorId": "doctor-uuid",
      "doctor": {
        "id": "doctor-uuid",
        "name": "Dr. Ibrahim Traoré",
        "email": "ibrahim.traore@vitalis.com"
      },
      "consultationId": "consultation-uuid",
      "consultation": {
        "id": "consultation-uuid",
        "symptoms": "Fièvre, maux de tête",
        "diagnosis": "Grippe",
        "notes": "Traitement symptomatique"
      },
      "status": "active",
      "labRequestIds": ["lab-request-1", "lab-request-2"],
      "prescriptionIds": ["prescription-1"],
      "createdAt": "2026-01-28T10:00:00Z",
      "updatedAt": "2026-01-28T10:00:00Z",
      "completedAt": null,
      "archivedAt": null,
      "archivedBy": null
    },
    {
      "id": "uuid",
      "status": "archived",
      "completedAt": "2026-01-20T15:30:00Z",
      "archivedAt": "2026-01-21T09:00:00Z",
      "archivedBy": {
        "id": "doctor-uuid",
        "name": "Dr. Ibrahim Traoré"
      }
    }
  ]
}
```

**Logique**:
- Retourner tous les dossiers du patient, triés par date de création (plus récent en premier)
- Filtrer par statut si fourni
- Inclure les informations du médecin
- Inclure les détails de la consultation si `includeConsultation = true`
- Inclure les IDs des demandes de laboratoire et ordonnances associées
- Pour les dossiers archivés, inclure les informations de l'utilisateur qui a archivé

**Permissions**:
- `admin`: Accès complet
- `doctor`: Accès aux dossiers de ses patients assignés
- `reception`: Accès refusé (redirection vers dashboard)

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant ou accès refusé
- `404 Not Found` - Patient non trouvé

---

### GET `/api/v1/patients/:id/dossiers/:dossierId`

**Description**: Récupère les détails complets d'un dossier spécifique

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du patient
- `dossierId` (UUID, required) - ID du dossier

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "patient-uuid",
    "patient": {
      "id": "patient-uuid",
      "vitalisId": "VTL-2026-00001",
      "firstName": "Moussa",
      "lastName": "Diarra"
    },
    "doctorId": "doctor-uuid",
    "doctor": {
      "id": "doctor-uuid",
      "name": "Dr. Ibrahim Traoré"
    },
    "consultationId": "consultation-uuid",
    "consultation": {
      "id": "consultation-uuid",
      "symptoms": "Fièvre, maux de tête",
      "diagnosis": "Grippe",
      "notes": "Traitement symptomatique",
      "vitals": {
        "temperature": 38.5,
        "bloodPressure": "120/80",
        "heartRate": 85
      }
    },
    "status": "active",
    "labRequests": [
      {
        "id": "lab-request-1",
        "exams": [
          {
            "id": "exam-1",
            "name": "Numération formule sanguine"
          }
        ],
        "status": "completed"
      }
    ],
    "prescriptions": [
      {
        "id": "prescription-1",
        "items": [
          {
            "medicationName": "Paracétamol",
            "dosage": "500mg",
            "frequency": "3 fois par jour"
          }
        ],
        "status": "pending"
      }
    ],
    "createdAt": "2026-01-28T10:00:00Z",
    "updatedAt": "2026-01-28T10:00:00Z",
    "completedAt": null,
    "archivedAt": null
  }
}
```

**Logique**:
- Récupérer le dossier avec toutes ses relations
- Inclure les informations du patient, du médecin, de la consultation
- Inclure les demandes de laboratoire et ordonnances associées
- Vérifier les permissions d'accès

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Accès refusé
- `404 Not Found` - Dossier ou patient non trouvé

---

### POST `/api/v1/consultations/dossiers/:id/archive`

**Description**: Archive un dossier de consultation (action critique, uniquement par médecin)

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du dossier

**Body**:
```json
{
  "reason": "Consultation terminée, patient guéri" // Optionnel
}
```

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Dossier archivé avec succès",
  "data": {
    "id": "uuid",
    "status": "archived",
    "archivedAt": "2026-01-28T16:00:00Z",
    "archivedBy": {
      "id": "doctor-uuid",
      "name": "Dr. Ibrahim Traoré"
    }
  }
}
```

**Logique**:
1. **Vérifications préalables**:
   - Vérifier que l'utilisateur est authentifié
   - Vérifier que l'utilisateur a le rôle `doctor`
   - Vérifier que le dossier existe
   - Vérifier que le dossier est `completed` (ne peut pas archiver un dossier `active`)
   - Vérifier que le dossier n'est pas déjà archivé
   - Vérifier que le médecin est le propriétaire du dossier ou a les permissions d'archivage

2. **Archivage**:
   - Mettre à jour `status = 'archived'`
   - Mettre à jour `archivedAt = NOW()`
   - Mettre à jour `archivedBy = currentUserId`
   - Enregistrer la raison d'archivage si fournie (dans un champ `archiveReason` ou table séparée)

3. **Conséquences**:
   - Le dossier devient en lecture seule
   - Aucune modification n'est plus possible (consultation, lab requests, prescriptions)
   - Le dossier reste visible dans l'historique du patient
   - Le dossier peut être consulté mais pas modifié

**Permissions**:
- `doctor`: Uniquement pour ses propres dossiers ou dossiers assignés
- `admin`: Accès refusé (seul le médecin peut archiver)
- `reception`: Accès refusé

**Erreurs**:
- `400 Bad Request` - Dossier non terminé (`status !== 'completed'`), dossier déjà archivé, ou données invalides
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant (pas médecin) ou pas propriétaire du dossier
- `404 Not Found` - Dossier non trouvé

**Exemple de validation**:
```javascript
// Vérifier le statut
if (dossier.status !== 'completed') {
  return res.status(400).json({
    success: false,
    message: 'Le dossier doit être terminé avant d\'être archivé'
  });
}

// Vérifier le rôle
if (user.role !== 'doctor') {
  return res.status(403).json({
    success: false,
    message: 'Seul un médecin peut archiver un dossier'
  });
}

// Vérifier la propriété
if (dossier.doctorId !== user.id && !user.isAdmin) {
  return res.status(403).json({
    success: false,
    message: 'Vous n\'êtes pas autorisé à archiver ce dossier'
  });
}
```

---

### GET `/api/v1/patients/:id/history`

**Description**: Récupère l'historique complet d'un patient (dossiers, consultations, lab, prescriptions)

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du patient

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient-uuid",
      "vitalisId": "VTL-2026-00001",
      "firstName": "Moussa",
      "lastName": "Diarra"
    },
    "dossiers": [...],
    "consultations": [...],
    "labRequests": [...],
    "imagingRequests": [...],
    "prescriptions": [...],
    "payments": [...]
  }
}
```

**Logique**:
- Récupérer toutes les données liées au patient
- Trier par date (plus récent en premier)
- Filtrer selon le rôle de l'utilisateur (réception ne voit pas les résultats de laboratoire)

---

### GET `/api/v1/patients/:id/timeline`

**Description**: Récupère la timeline (chronologie) des événements d'un patient

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du patient

**Query Parameters**:
- `includeLabResults` (boolean, optional, default: true) - Inclure les résultats de laboratoire

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "type": "consultation",
      "title": "Consultation",
      "description": "Consultation avec Dr. Ibrahim Traoré",
      "date": "2026-01-28T10:00:00Z",
      "doctor": {
        "name": "Dr. Ibrahim Traoré"
      }
    },
    {
      "id": "event-2",
      "type": "lab_request",
      "title": "Demande de laboratoire",
      "description": "Numération formule sanguine",
      "date": "2026-01-28T10:30:00Z"
    },
    {
      "id": "event-3",
      "type": "lab_results",
      "title": "Résultats de laboratoire",
      "description": "Résultats disponibles",
      "date": "2026-01-28T14:00:00Z"
    },
    {
      "id": "event-4",
      "type": "prescription",
      "title": "Ordonnance",
      "description": "Paracétamol 500mg",
      "date": "2026-01-28T11:00:00Z"
    }
  ]
}
```

**Logique**:
- Récupérer tous les événements du patient (consultations, lab requests, prescriptions, paiements)
- Trier par date (plus récent en premier)
- Filtrer les résultats de laboratoire si `includeLabResults = false` (pour la réception)
- Formater les événements pour l'affichage dans une timeline

---

## Workflow d'archivage

### 1. Création du dossier
- Un dossier est créé automatiquement lorsqu'un patient est assigné à un médecin
- Statut initial : `active`

### 2. Consultation en cours
- Le médecin peut ajouter des notes, diagnostics, prescriptions, demandes de laboratoire
- Le dossier reste `active`

### 3. Fin de consultation
- Le médecin termine la consultation (bouton "Terminer la consultation")
- Le statut passe à `completed`
- `completedAt` est enregistré

### 4. Archivage
- **Uniquement par le médecin** (bouton "Archiver le dossier" dans la page de consultation)
- Le dossier doit être `completed` avant d'être archivé
- Confirmation requise (AlertDialog)
- Le statut passe à `archived`
- `archivedAt` et `archivedBy` sont enregistrés
- Le dossier devient en lecture seule

### 5. Consultation d'un dossier archivé
- Le dossier reste visible dans l'historique du patient
- Toutes les informations sont consultables
- Aucune modification n'est possible

## Intégration Frontend-Backend

### Exemple d'utilisation dans le frontend

```typescript
// Charger les dossiers d'un patient
const loadDossiers = async (patientId: string) => {
  const response = await getPatientDossiers(patientId);
  if (response.success && response.data) {
    setDossiers(response.data);
  }
};

// Archiver un dossier
const handleArchiveDossier = async (dossierId: string) => {
  try {
    const response = await archiveDossier(dossierId);
    if (response.success) {
      toast.success('Dossier archivé avec succès');
      // Recharger les dossiers
      loadDossiers(patientId);
    }
  } catch (error) {
    console.error('Error archiving dossier:', error);
    toast.error('Erreur lors de l\'archivage');
  }
};
```

### Page de consultation (médecin)

Dans la page de consultation (`/doctor/consultation`), le bouton "Archiver le dossier" doit :
1. Vérifier que le dossier est `completed`
2. Afficher une confirmation (AlertDialog)
3. Appeler `POST /api/v1/consultations/dossiers/:id/archive`
4. Afficher un message de succès
5. Rediriger ou recharger les données

### Page des dossiers patients

Dans la page des dossiers patients (`/patients`), les dossiers archivés doivent :
- Afficher un badge "Archivé" avec un style différent
- Afficher la date d'archivage et le médecin qui a archivé
- Être en lecture seule (pas de boutons de modification)

## Sécurité et Permissions

### Règles d'accès

1. **Lecture des dossiers**:
   - `admin`: Accès à tous les dossiers
   - `doctor`: Accès uniquement aux dossiers de ses patients assignés
   - `reception`: Accès refusé (redirection vers dashboard)

2. **Archivage**:
   - `doctor`: Uniquement pour ses propres dossiers
   - `admin`: Accès refusé (même l'admin ne peut pas archiver)
   - `reception`: Accès refusé

3. **Modification**:
   - Un dossier `archived` ne peut plus être modifié par personne
   - Un dossier `active` peut être modifié par le médecin propriétaire
   - Un dossier `completed` peut être modifié par le médecin propriétaire jusqu'à l'archivage

## Statistiques

Les statistiques sur les dossiers peuvent être récupérées via :
- `GET /api/v1/stats/dossiers` - Statistiques sur les dossiers (total, actifs, terminés, archivés)

Voir [Routes - Statistiques](./11-routes-stats.md) pour plus de détails.
