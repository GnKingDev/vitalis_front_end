# Routes Backend - Historique des Demandes de Laboratoire

## Vue d'ensemble

Ce document décrit les routes backend pour récupérer l'historique des demandes de laboratoire d'un patient. Ces routes sont utilisées dans la page de consultation du médecin pour afficher l'historique des demandes précédentes.

## Route principale

### `GET /api/v1/lab/requests`

Récupère la liste des demandes de laboratoire avec possibilité de filtrer par patient.

#### Paramètres de requête (Query Parameters)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `patientId` | string (UUID) | Non | ID du patient pour filtrer les demandes |
| `doctorId` | string (UUID) | Non | ID du médecin pour filtrer les demandes |
| `status` | string | Non | Statut de la demande (`pending`, `in_progress`, `completed`, `cancelled`) |
| `page` | number | Non | Numéro de page pour la pagination (défaut: 1) |
| `limit` | number | Non | Nombre d'éléments par page (défaut: 10, max: 100) |
| `date` | string (ISO 8601) | Non | Filtrer par date de création |
| `search` | string | Non | Recherche textuelle dans les examens |

#### Exemple de requête

```bash
GET /api/v1/lab/requests?patientId=123e4567-e89b-12d3-a456-426614174000&limit=50
```

#### Réponse succès (200 OK)

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "uuid-de-la-demande",
        "patientId": "uuid-du-patient",
        "doctorId": "uuid-du-medecin",
        "consultationId": "uuid-de-la-consultation",
        "status": "completed",
        "totalAmount": "50000.00",
        "notes": "Notes optionnelles du médecin",
        "createdAt": "2026-02-13T10:30:00.000Z",
        "updatedAt": "2026-02-13T12:00:00.000Z",
        "exams": [
          {
            "id": "uuid-de-l-examen",
            "name": "Hémogramme complet",
            "category": "Hématologie",
            "price": "25000.00"
          },
          {
            "id": "uuid-de-l-examen-2",
            "name": "Glycémie à jeun",
            "category": "Biochimie",
            "price": "25000.00"
          }
        ],
        "doctor": {
          "id": "uuid-du-medecin",
          "name": "Dr. Ibrahim Traoré",
          "email": "ibrahim.traore@vitalis-clinique.com"
        },
        "patient": {
          "id": "uuid-du-patient",
          "firstName": "Moussa",
          "lastName": "Diarra",
          "vitalisId": "VTL-2026-00001"
        },
        "resultId": "uuid-du-resultat-si-disponible"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 50
    }
  }
}
```

#### Réponse erreur (400 Bad Request)

```json
{
  "success": false,
  "message": "Paramètres de requête invalides",
  "errors": [
    {
      "field": "limit",
      "message": "La limite ne peut pas dépasser 100"
    }
  ]
}
```

#### Réponse erreur (401 Unauthorized)

```json
{
  "success": false,
  "message": "Non autorisé. Token manquant ou invalide"
}
```

#### Réponse erreur (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Erreur serveur lors de la récupération des demandes"
}
```

## Logique backend

### 1. Validation des paramètres

```javascript
// Validation des paramètres de pagination
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 10, 100);
const offset = (page - 1) * limit;

// Validation du patientId si fourni
if (req.query.patientId) {
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.query.patientId);
  if (!isValidUUID) {
    return res.status(400).json({
      success: false,
      message: "Format UUID invalide pour patientId"
    });
  }
}
```

### 2. Construction de la requête Sequelize

```javascript
const whereClause = {};

// Filtre par patient
if (req.query.patientId) {
  whereClause.patientId = req.query.patientId;
}

// Filtre par médecin
if (req.query.doctorId) {
  whereClause.doctorId = req.query.doctorId;
}

// Filtre par statut
if (req.query.status) {
  whereClause.status = req.query.status;
}

// Filtre par date
if (req.query.date) {
  const date = new Date(req.query.date);
  whereClause.createdAt = {
    [Op.gte]: new Date(date.setHours(0, 0, 0, 0)),
    [Op.lt]: new Date(date.setHours(23, 59, 59, 999))
  };
}

// Recherche textuelle dans les examens (via relation)
if (req.query.search) {
  whereClause[Op.or] = [
    { '$LabExam.name$': { [Op.iLike]: `%${req.query.search}%` } }
  ];
}
```

### 3. Récupération avec relations

```javascript
const requests = await LabRequest.findAndCountAll({
  where: whereClause,
  include: [
    {
      model: Patient,
      as: 'patient',
      attributes: ['id', 'firstName', 'lastName', 'vitalisId']
    },
    {
      model: User,
      as: 'doctor',
      attributes: ['id', 'name', 'email']
    },
    {
      model: LabExam,
      as: 'exams',
      through: {
        attributes: []
      },
      attributes: ['id', 'name', 'category', 'price']
    },
    {
      model: LabResult,
      as: 'result',
      attributes: ['id'],
      required: false
    }
  ],
  order: [['createdAt', 'DESC']],
  limit,
  offset
});
```

### 4. Calcul du montant total

```javascript
// Le montant total peut être calculé de deux façons:
// 1. Somme des prix des examens
const totalAmount = request.exams.reduce((sum, exam) => {
  return sum + parseFloat(exam.price || 0);
}, 0);

// 2. Ou stocké directement dans la demande (si calculé à la création)
// Dans ce cas, utiliser request.totalAmount
```

### 5. Formatage de la réponse

```javascript
const formattedRequests = requests.rows.map(request => ({
  id: request.id,
  patientId: request.patientId,
  doctorId: request.doctorId,
  consultationId: request.consultationId,
  status: request.status,
  totalAmount: request.totalAmount || calculateTotal(request.exams),
  notes: request.notes,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
  exams: request.exams.map(exam => ({
    id: exam.id,
    name: exam.name,
    category: exam.category,
    price: exam.price
  })),
  doctor: request.doctor ? {
    id: request.doctor.id,
    name: request.doctor.name,
    email: request.doctor.email
  } : null,
  patient: request.patient ? {
    id: request.patient.id,
    firstName: request.patient.firstName,
    lastName: request.patient.lastName,
    vitalisId: request.patient.vitalisId
  } : null,
  resultId: request.result ? request.result.id : null
}));

return res.json({
  success: true,
  data: {
    requests: formattedRequests,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(requests.count / limit),
      totalItems: requests.count,
      itemsPerPage: limit
    }
  }
});
```

## Permissions

### Rôles autorisés

- **Doctor** : Peut voir toutes les demandes qu'il a créées, ainsi que les demandes de ses patients assignés
- **Lab** : Peut voir toutes les demandes (pour traitement)
- **Reception** : Peut voir toutes les demandes (pour gestion des paiements)
- **Admin** : Peut voir toutes les demandes

### Vérification des permissions

```javascript
// Middleware de vérification des permissions
const checkLabRequestAccess = async (req, res, next) => {
  const user = req.user; // Utilisateur authentifié
  
  // Admin et Lab voient tout
  if (user.role === 'admin' || user.role === 'lab') {
    return next();
  }
  
  // Doctor ne voit que ses propres demandes ou celles de ses patients
  if (user.role === 'doctor') {
    if (req.query.doctorId && req.query.doctorId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez voir que vos propres demandes"
      });
    }
    // Si patientId est fourni, vérifier que le patient est assigné au médecin
    if (req.query.patientId) {
      const assignment = await DoctorAssignment.findOne({
        where: {
          patientId: req.query.patientId,
          doctorId: user.id,
          status: { [Op.in]: ['assigned', 'in_consultation'] }
        }
      });
      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "Patient non assigné à ce médecin"
        });
      }
    }
  }
  
  // Reception peut voir toutes les demandes
  if (user.role === 'reception') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: "Accès non autorisé"
  });
};
```

## Cas d'usage frontend

### 1. Affichage de l'historique dans un modal

Le frontend utilise cette route pour afficher l'historique des demandes dans un modal lorsque l'utilisateur clique sur le bouton "Voir l'historique" dans l'onglet Labo de la page de consultation.

```typescript
// Exemple d'utilisation dans ConsultationPage.tsx
const loadLabHistory = async () => {
  if (!selectedPatient?.id) return;
  
  try {
    setIsLoadingHistory(true);
    const response = await getLabRequests({
      patientId: selectedPatient.id,
      limit: 50,
    });
    
    if (response.success && response.data) {
      const requests = Array.isArray(response.data.requests) 
        ? response.data.requests 
        : response.data.requests || response.data || [];
      setLabRequestsHistory(requests);
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
  } finally {
    setIsLoadingHistory(false);
  }
};
```

### 2. Rechargement après création d'une demande

Après la création d'une nouvelle demande de laboratoire, l'historique est automatiquement rechargé pour afficher la nouvelle demande.

```typescript
// Après création d'une demande
if (response.success) {
  toast.success('Demande d\'examens envoyée à l\'accueil');
  setSelectedExams([]);
  
  // Recharger l'historique
  await loadLabHistory();
}
```

## Modèles de données

### LabRequest

```javascript
{
  id: UUID (PK),
  patientId: UUID (FK -> Patient),
  doctorId: UUID (FK -> User),
  consultationId: UUID (FK -> Consultation, nullable),
  status: ENUM('pending', 'in_progress', 'completed', 'cancelled'),
  totalAmount: DECIMAL(10, 2),
  notes: TEXT (nullable),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Relations

- `LabRequest.belongsToMany(LabExam)` via `LabRequestExam`
- `LabRequest.belongsTo(Patient)`
- `LabRequest.belongsTo(User, { as: 'doctor' })`
- `LabRequest.belongsTo(Consultation)`
- `LabRequest.hasOne(LabResult)`

## Notes importantes

1. **Performance** : Pour les patients avec beaucoup de demandes, la pagination est essentielle. Limiter à 50 demandes par défaut.

2. **Sécurité** : Toujours vérifier les permissions avant de retourner les données. Un médecin ne doit pas voir les demandes d'autres médecins sauf si le patient lui est assigné.

3. **Format des dates** : Les dates sont retournées en format ISO 8601. Le frontend doit les formater pour l'affichage.

4. **Montant total** : Le montant total peut être calculé à la volée (somme des prix des examens) ou stocké dans la demande lors de la création pour de meilleures performances.

5. **Statuts** : Les statuts possibles sont :
   - `pending` : En attente de paiement
   - `in_progress` : En cours de traitement au laboratoire
   - `completed` : Résultats disponibles
   - `cancelled` : Demande annulée

## Exemple de route Express.js

```javascript
router.get('/lab/requests', authenticateToken, checkLabRequestAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (req.query.patientId) {
      whereClause.patientId = req.query.patientId;
    }
    
    if (req.query.doctorId) {
      whereClause.doctorId = req.query.doctorId;
    }
    
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    
    const { count, rows: requests } = await LabRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'vitalisId']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email']
        },
        {
          model: LabExam,
          as: 'exams',
          through: { attributes: [] },
          attributes: ['id', 'name', 'category', 'price']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    const formattedRequests = requests.map(request => ({
      id: request.id,
      patientId: request.patientId,
      doctorId: request.doctorId,
      consultationId: request.consultationId,
      status: request.status,
      totalAmount: request.totalAmount || request.exams.reduce((sum, exam) => 
        sum + parseFloat(exam.price || 0), 0
      ),
      notes: request.notes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      exams: request.exams.map(exam => ({
        id: exam.id,
        name: exam.name,
        category: exam.category,
        price: exam.price
      })),
      doctor: request.doctor ? {
        id: request.doctor.id,
        name: request.doctor.name,
        email: request.doctor.email
      } : null,
      patient: request.patient ? {
        id: request.patient.id,
        firstName: request.patient.firstName,
        lastName: request.patient.lastName,
        vitalisId: request.patient.vitalisId
      } : null
    }));
    
    res.json({
      success: true,
      data: {
        requests: formattedRequests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des demandes'
    });
  }
});
```
