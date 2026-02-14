# Routes - Gestion des Lits

## Base URL
`/api/v1/beds`

## Vue d'ensemble

Les routes de gestion des lits permettent de gérer les lits de la clinique (classiques et VIP). Les lits peuvent être occupés par des patients ou disponibles. Les lits VIP ont des frais supplémentaires, tandis que les lits classiques sont gratuits.

## Modèle de données

### Bed

**Table**: `beds`

**Champs**:
- `id` (UUID, Primary Key)
- `number` (STRING, NOT NULL, UNIQUE) - Numéro du lit (ex: "101", "A1", "VIP-1")
- `type` (ENUM('classic', 'vip'), NOT NULL) - Type de lit
- `additionalFee` (DECIMAL(10, 2), NOT NULL, DEFAULT 0) - Frais supplémentaire en GNF (0 pour classique, > 0 pour VIP)
- `isOccupied` (BOOLEAN, NOT NULL, DEFAULT false) - Indique si le lit est occupé
- `patientId` (UUID, Foreign Key → patients.id, NULLABLE) - ID du patient occupant le lit (si occupé)
- `createdAt` (DATE, NOT NULL)
- `updatedAt` (DATE, NOT NULL)
- `createdBy` (UUID, Foreign Key → users.id, NULLABLE) - Utilisateur qui a créé le lit
- `updatedBy` (UUID, Foreign Key → users.id, NULLABLE) - Utilisateur qui a modifié le lit

**Relations**:
- `belongsTo` Patient (via patientId, optionnel)
- `belongsTo` User (createdBy, updatedBy)

**Indexes**:
- Index unique sur `number`
- Index sur `type`
- Index sur `isOccupied`
- Index sur `patientId`

**Contraintes**:
- Le numéro du lit doit être unique
- Le numéro ne peut pas être vide
- Si `type = 'classic'`, `additionalFee` doit être 0
- Si `type = 'vip'`, `additionalFee` doit être > 0
- Si `isOccupied = true`, `patientId` ne peut pas être NULL
- Si `isOccupied = false`, `patientId` doit être NULL

**Validations**:
- `number`: Requis, unique, longueur min 1, max 50
- `type`: Requis, doit être 'classic' ou 'vip'
- `additionalFee`: Requis, >= 0, si type='classic' alors = 0, si type='vip' alors > 0

## Routes

### GET `/api/v1/beds`

**Description**: Liste tous les lits avec pagination et filtres

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (number, optional, default: 1) - Numéro de la page
- `limit` (number, optional, default: 10) - Nombre d'éléments par page
- `type` (string, optional) - Filtrer par type: 'classic', 'vip', ou 'all' (défaut)
- `status` (string, optional) - Filtrer par statut: 'occupied', 'available', ou 'all' (défaut)

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "beds": [
      {
        "id": "uuid",
        "number": "101",
        "type": "classic",
        "additionalFee": 0,
        "isOccupied": false,
        "patientId": null,
        "createdAt": "2026-01-15T10:00:00Z",
        "updatedAt": "2026-01-15T10:00:00Z"
      },
      {
        "id": "uuid",
        "number": "VIP-1",
        "type": "vip",
        "additionalFee": 15000,
        "isOccupied": true,
        "patientId": "patient-uuid",
        "patient": {
          "id": "patient-uuid",
          "vitalisId": "VTL-2026-00001",
          "firstName": "Moussa",
          "lastName": "Diarra"
        },
        "createdAt": "2026-01-15T10:00:00Z",
        "updatedAt": "2026-01-20T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

**Logique**:
- Appliquer les filtres `type` et `status` si fournis
- Trier par numéro de lit (ordre alphabétique/numérique)
- Inclure les informations du patient si le lit est occupé
- Retourner les métadonnées de pagination
- Par défaut, retourner tous les lits (pas de filtre)

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès en lecture seule

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant

---

### GET `/api/v1/beds/:id`

**Description**: Récupère les détails d'un lit spécifique

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du lit

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "number": "VIP-1",
    "type": "vip",
    "additionalFee": 15000,
    "isOccupied": true,
    "patientId": "patient-uuid",
    "patient": {
      "id": "patient-uuid",
      "vitalisId": "VTL-2026-00001",
      "firstName": "Moussa",
      "lastName": "Diarra",
      "phone": "+224 612 345 678"
    },
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-20T14:30:00Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "Admin User"
    }
  }
}
```

**Logique**:
- Récupérer le lit par ID
- Inclure les informations du patient si occupé
- Inclure les informations de l'utilisateur créateur

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Lit non trouvé

---

### POST `/api/v1/beds`

**Description**: Crée un nouveau lit

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "number": "102",
  "type": "classic",
  "additionalFee": 0
}
```

ou pour un lit VIP:
```json
{
  "number": "VIP-2",
  "type": "vip",
  "additionalFee": 15000
}
```

**Validation**:
- `number` (string, required, min: 1, max: 50, unique) - Numéro du lit
- `type` (enum, required) - 'classic' ou 'vip'
- `additionalFee` (number, optional) - Si type='vip', par défaut 15000. Si type='classic', doit être 0 ou omis

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Lit créé avec succès",
  "data": {
    "id": "uuid",
    "number": "102",
    "type": "classic",
    "additionalFee": 0,
    "isOccupied": false,
    "patientId": null,
    "createdAt": "2026-01-28T10:00:00Z",
    "updatedAt": "2026-01-28T10:00:00Z"
  }
}
```

**Logique**:
- Valider que le numéro est unique
- Si `type = 'classic'`, forcer `additionalFee = 0`
- Si `type = 'vip'` et `additionalFee` non fourni, utiliser 15000 par défaut
- Si `type = 'vip'` et `additionalFee <= 0`, retourner une erreur
- Initialiser `isOccupied = false` et `patientId = null`
- Enregistrer l'utilisateur créateur dans `createdBy`

**Permissions**:
- `admin`: Accès complet

**Erreurs**:
- `400 Bad Request` - Données invalides (numéro déjà existant, frais invalide pour VIP, etc.)
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant (admin requis)

---

### PUT `/api/v1/beds/:id`

**Description**: Met à jour un lit existant

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du lit

**Body**:
```json
{
  "number": "VIP-2",
  "type": "vip",
  "additionalFee": 20000
}
```

**Validation**:
- `number` (string, optional, min: 1, max: 50, unique) - Numéro du lit (doit être unique si modifié)
- `type` (enum, optional) - 'classic' ou 'vip'
- `additionalFee` (number, optional) - Doit respecter les règles selon le type

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Lit modifié avec succès",
  "data": {
    "id": "uuid",
    "number": "VIP-2",
    "type": "vip",
    "additionalFee": 20000,
    "isOccupied": false,
    "patientId": null,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-28T15:00:00Z"
  }
}
```

**Logique**:
- Vérifier que le lit existe
- Si le lit est occupé, ne pas permettre la modification du type (ou libérer d'abord)
- Valider l'unicité du numéro si modifié
- Si `type` change vers 'classic', forcer `additionalFee = 0`
- Si `type` change vers 'vip' et `additionalFee` non fourni, utiliser 15000
- Enregistrer l'utilisateur modificateur dans `updatedBy`

**Permissions**:
- `admin`: Accès complet

**Erreurs**:
- `400 Bad Request` - Données invalides (lit occupé, numéro déjà existant, etc.)
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Lit non trouvé

---

### DELETE `/api/v1/beds/:id`

**Description**: Supprime un lit

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du lit

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Lit supprimé avec succès"
}
```

**Logique**:
- Vérifier que le lit existe
- Ne pas permettre la suppression si le lit est occupé (retourner une erreur)
- Supprimer le lit de la base de données

**Permissions**:
- `admin`: Accès complet

**Erreurs**:
- `400 Bad Request` - Lit occupé, impossible de supprimer
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Lit non trouvé

---

### PATCH `/api/v1/beds/:id/free`

**Description**: Libère un lit occupé (marque comme disponible)

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du lit

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Lit libéré avec succès",
  "data": {
    "id": "uuid",
    "number": "VIP-1",
    "type": "vip",
    "additionalFee": 15000,
    "isOccupied": false,
    "patientId": null,
    "updatedAt": "2026-01-28T16:00:00Z"
  }
}
```

**Logique**:
- Vérifier que le lit existe
- Vérifier que le lit est occupé (sinon retourner une erreur)
- Mettre `isOccupied = false`
- Mettre `patientId = null`
- Enregistrer l'utilisateur modificateur dans `updatedBy`

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès autorisé (pour libérer les lits)

**Erreurs**:
- `400 Bad Request` - Lit déjà disponible
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Lit non trouvé

---

### PATCH `/api/v1/beds/:id/occupy`

**Description**: Occupe un lit avec un patient

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID du lit

**Body**:
```json
{
  "patientId": "patient-uuid"
}
```

**Validation**:
- `patientId` (UUID, required) - ID du patient

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Lit occupé avec succès",
  "data": {
    "id": "uuid",
    "number": "VIP-1",
    "type": "vip",
    "additionalFee": 15000,
    "isOccupied": true,
    "patientId": "patient-uuid",
    "patient": {
      "id": "patient-uuid",
      "vitalisId": "VTL-2026-00001",
      "firstName": "Moussa",
      "lastName": "Diarra"
    },
    "updatedAt": "2026-01-28T16:00:00Z"
  }
}
```

**Logique**:
- Vérifier que le lit existe
- Vérifier que le lit est disponible (sinon retourner une erreur)
- Vérifier que le patient existe
- Mettre `isOccupied = true`
- Mettre `patientId = patientId`
- Enregistrer l'utilisateur modificateur dans `updatedBy`

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès autorisé (pour occuper les lits lors de l'enregistrement)

**Erreurs**:
- `400 Bad Request` - Lit déjà occupé, patient non trouvé
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Lit ou patient non trouvé

---

## Routes supplémentaires (Réception)

### GET `/api/v1/reception/beds`

**Description**: Liste les lits disponibles pour la réception (avec filtres)

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `available` (boolean, optional, default: true) - Filtrer uniquement les lits disponibles
- `type` (string, optional) - Filtrer par type: 'classic' ou 'vip'

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "beds": [
      {
        "id": "uuid",
        "number": "101",
        "type": "classic",
        "additionalFee": 0,
        "isOccupied": false
      },
      {
        "id": "uuid",
        "number": "VIP-1",
        "type": "vip",
        "additionalFee": 15000,
        "isOccupied": false
      }
    ]
  }
}
```

**Logique**:
- Par défaut, retourner uniquement les lits disponibles
- Si `available = false`, retourner tous les lits
- Filtrer par type si fourni
- Trier par numéro

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès autorisé

---

### GET `/api/v1/reception/beds/available`

**Description**: Liste uniquement les lits disponibles (raccourci)

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "beds": [
      {
        "id": "uuid",
        "number": "101",
        "type": "classic",
        "additionalFee": 0
      },
      {
        "id": "uuid",
        "number": "102",
        "type": "classic",
        "additionalFee": 0
      },
      {
        "id": "uuid",
        "number": "VIP-1",
        "type": "vip",
        "additionalFee": 15000
      }
    ]
  }
}
```

**Logique**:
- Retourner uniquement les lits avec `isOccupied = false`
- Trier par numéro
- Inclure le type et les frais supplémentaires

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès autorisé

---

## Logique métier

### Règles de gestion

1. **Création de lit**:
   - Les lits classiques ont toujours `additionalFee = 0`
   - Les lits VIP doivent avoir `additionalFee > 0` (par défaut 15000 GNF)
   - Le numéro du lit doit être unique dans toute la clinique

2. **Occupation de lit**:
   - Un lit ne peut être occupé que s'il est disponible
   - Un patient ne peut occuper qu'un seul lit à la fois
   - Lors de l'occupation, le `patientId` est enregistré et `isOccupied = true`

3. **Libération de lit**:
   - Un lit ne peut être libéré que s'il est occupé
   - Lors de la libération, `patientId = null` et `isOccupied = false`

4. **Modification de lit**:
   - Un lit occupé ne peut pas changer de type (classique ↔ VIP)
   - Le numéro peut être modifié si unique
   - Les frais supplémentaires peuvent être modifiés selon le type

5. **Suppression de lit**:
   - Un lit occupé ne peut pas être supprimé
   - Il faut d'abord libérer le lit avant de le supprimer

### Hooks Sequelize

**Before Create**:
- Si `type = 'classic'`, forcer `additionalFee = 0`
- Si `type = 'vip'` et `additionalFee` non fourni, utiliser 15000

**Before Update**:
- Si `type` change vers 'classic', forcer `additionalFee = 0`
- Si `type` change vers 'vip' et `additionalFee = 0`, utiliser 15000

**Before Destroy**:
- Vérifier que `isOccupied = false`, sinon empêcher la suppression

## Intégration Frontend-Backend

### Exemple d'utilisation dans le frontend

```typescript
// Charger les lits avec pagination et filtres
const loadBeds = async () => {
  const response = await getBeds({
    page: currentPage,
    limit: itemsPerPage,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  
  if (response.success && response.data) {
    setBeds(response.data.beds || []);
    setTotalPages(response.data.pagination?.totalPages || 1);
    setTotalItems(response.data.pagination?.totalItems || 0);
  }
};

// Créer un lit
const createBed = async (bedData: { number: string; type: 'classic' | 'vip'; additionalFee?: number }) => {
  const response = await createBed(bedData);
  if (response.success) {
    toast.success('Lit créé avec succès');
    loadBeds();
  }
};

// Libérer un lit
const freeBed = async (bedId: string) => {
  const response = await freeBed(bedId);
  if (response.success) {
    toast.success('Lit libéré avec succès');
    loadBeds();
  }
};
```

## Statistiques

Les statistiques des lits peuvent être récupérées via la route de statistiques :

- `GET /api/v1/stats/beds` - Statistiques sur les lits (total, disponibles, occupés, par type)

Voir [Routes - Statistiques](./11-routes-stats.md) pour plus de détails.
