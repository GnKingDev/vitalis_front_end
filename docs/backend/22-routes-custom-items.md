# Routes Backend - Gestion des Items Personnalisés (Onglet "Autre")

## Vue d'ensemble

Ce document décrit la gestion des items personnalisés dans l'onglet "Autre" de la page de consultation. Ces items permettent au médecin de documenter des tests ou examens qui n'existent pas dans le catalogue standard (labo/imagerie). Un item personnalisé est créé **une seule fois** et peut être **mis à jour** par la suite.

## Principe fondamental

### Création unique

- Un item personnalisé est créé **une seule fois** pour une consultation.
- L'item est lié à une **consultation** et un **patient**.
- Une fois créé, l'item peut être **mis à jour** mais jamais recréé.

### Mise à jour

- Les données de l'item (name, description) peuvent être mises à jour à tout moment.
- La mise à jour se fait via la même route que la création, mais le backend doit détecter si un item existe déjà.

## Route principale

### `POST /api/v1/doctor/custom-items`

Crée un nouvel item personnalisé ou met à jour un item existant.

#### Corps de la requête

```json
{
  "consultationId": "uuid (optionnel)",
  "patientId": "uuid (requis)",
  "doctorId": "uuid (requis)",
  "name": "Nom du test/examen personnalisé",
  "description": "Description détaillée (optionnel)"
}
```

#### Logique backend

```javascript
// 1. Vérifier si un item existe déjà pour cette consultation et ce nom
const whereClause = {
  patientId: req.body.patientId,
  doctorId: req.body.doctorId,
  name: req.body.name.trim() // Nom exact (case-sensitive ou non selon besoin)
};

if (req.body.consultationId) {
  whereClause.consultationId = req.body.consultationId;
} else {
  // Si pas de consultationId, chercher dans la consultation active du patient
  const activeConsultation = await Consultation.findOne({
    where: {
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      status: 'in_progress'
    }
  });
  
  if (activeConsultation) {
    whereClause.consultationId = activeConsultation.id;
  }
}

const existingItem = await CustomItem.findOne({
  where: whereClause
});

if (existingItem) {
  // MISE À JOUR : Item existe déjà
  const updatedItem = await existingItem.update({
    name: req.body.name || existingItem.name,
    description: req.body.description !== undefined ? req.body.description : existingItem.description,
    updatedAt: new Date()
  });
  
  return res.json({
    success: true,
    message: "Item personnalisé mis à jour avec succès",
    data: {
      item: updatedItem,
      isUpdate: true
    }
  });
} else {
  // CRÉATION : Nouvel item
  const newItem = await CustomItem.create({
    consultationId: req.body.consultationId || activeConsultation?.id || null,
    patientId: req.body.patientId,
    doctorId: req.body.doctorId,
    name: req.body.name.trim(),
    description: req.body.description || null
  });
  
  return res.json({
    success: true,
    message: "Item personnalisé créé avec succès",
    data: {
      item: newItem,
      isUpdate: false
    }
  });
}
```

#### Réponse succès (200 OK) - Création

```json
{
  "success": true,
  "message": "Item personnalisé créé avec succès",
  "data": {
    "item": {
      "id": "uuid-de-l-item",
      "consultationId": "uuid-de-la-consultation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "name": "Test personnalisé XYZ",
      "description": "Description détaillée du test",
      "createdAt": "2026-02-13T14:30:00.000Z",
      "updatedAt": "2026-02-13T14:30:00.000Z"
    },
    "isUpdate": false
  }
}
```

#### Réponse succès (200 OK) - Mise à jour

```json
{
  "success": true,
  "message": "Item personnalisé mis à jour avec succès",
  "data": {
    "item": {
      "id": "uuid-de-l-item",
      "consultationId": "uuid-de-la-consultation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "name": "Test personnalisé XYZ (mis à jour)",
      "description": "Description mise à jour",
      "createdAt": "2026-02-13T14:30:00.000Z",
      "updatedAt": "2026-02-13T14:35:00.000Z"
    },
    "isUpdate": true
  }
}
```

## Route GET - Récupérer les items personnalisés

### `GET /api/v1/doctor/custom-items`

Récupère la liste des items personnalisés avec possibilité de filtrer.

#### Paramètres de requête (Query Parameters)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `patientId` | string (UUID) | Non | ID du patient pour filtrer les items |
| `consultationId` | string (UUID) | Non | ID de la consultation pour filtrer les items |
| `doctorId` | string (UUID) | Non | ID du médecin pour filtrer les items |
| `page` | number | Non | Numéro de page pour la pagination (défaut: 1) |
| `limit` | number | Non | Nombre d'éléments par page (défaut: 10, max: 100) |

#### Exemple de requête

```bash
GET /api/v1/doctor/custom-items?patientId=123e4567-e89b-12d3-a456-426614174000&consultationId=uuid-consultation
```

#### Réponse succès (200 OK)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-de-l-item",
        "consultationId": "uuid-de-la-consultation",
        "patientId": "uuid-du-patient",
        "doctorId": "uuid-du-medecin",
        "name": "Test personnalisé XYZ",
        "description": "Description détaillée",
        "createdAt": "2026-02-13T14:30:00.000Z",
        "updatedAt": "2026-02-13T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

## Route GET Dossier avec CustomItems inclus

### `GET /api/v1/doctor/dossiers/:id`

Récupère un dossier de consultation avec toutes ses relations, **y compris les items personnalisés**.

#### Réponse succès (200 OK) - Section customItems

```json
{
  "success": true,
  "data": {
    "id": "uuid-du-dossier",
    "patient": { ... },
    "assignment": { ... },
    "consultation": { ... },
    "labRequests": [ ... ],
    "imagingRequests": [ ... ],
    "prescriptions": [ ... ],
    "customItems": [
      {
        "id": "uuid-de-l-item",
        "consultationId": "uuid-de-la-consultation",
        "patientId": "uuid-du-patient",
        "doctorId": "uuid-du-medecin",
        "name": "Test personnalisé XYZ",
        "description": "Description détaillée",
        "createdAt": "2026-02-13T14:30:00.000Z",
        "updatedAt": "2026-02-13T14:30:00.000Z"
      }
    ],
    "status": "active",
    "createdAt": "2026-02-13T12:01:36.000Z"
  }
}
```

#### Points importants

1. **CustomItems inclus** : Les items personnalisés doivent être **toujours inclus** dans la réponse du dossier si la consultation existe, via la relation Sequelize.
2. **Pas besoin d'appel séparé** : Le frontend n'a pas besoin de faire un appel séparé à `GET /api/v1/doctor/custom-items` si les items sont déjà dans la réponse du dossier.
3. **CustomItems vide** : Si aucun item personnalisé n'existe, le champ `customItems` doit être un tableau vide `[]` (pas absent).

## Route PUT - Mettre à jour un item spécifique

### `PUT /api/v1/doctor/custom-items/:id`

Met à jour un item personnalisé spécifique par son ID.

#### Corps de la requête

```json
{
  "name": "Nom mis à jour",
  "description": "Description mise à jour"
}
```

#### Réponse succès (200 OK)

```json
{
  "success": true,
  "message": "Item personnalisé mis à jour avec succès",
  "data": {
    "item": {
      "id": "uuid-de-l-item",
      "consultationId": "uuid-de-la-consultation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "name": "Nom mis à jour",
      "description": "Description mise à jour",
      "createdAt": "2026-02-13T14:30:00.000Z",
      "updatedAt": "2026-02-13T14:35:00.000Z"
    }
  }
}
```

## Route DELETE - Supprimer un item

### `DELETE /api/v1/doctor/custom-items/:id`

Supprime un item personnalisé.

#### Réponse succès (200 OK)

```json
{
  "success": true,
  "message": "Item personnalisé supprimé avec succès"
}
```

## Implémentation Sequelize

### Modèle CustomItem

```javascript
const CustomItem = sequelize.define('CustomItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  consultationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Consultations',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'custom_items',
  timestamps: true
});
```

### Relations

```javascript
// CustomItem belongs to Consultation
CustomItem.belongsTo(Consultation, {
  foreignKey: 'consultationId',
  as: 'consultation',
  onDelete: 'SET NULL'
});

// CustomItem belongs to Patient
CustomItem.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
  onDelete: 'CASCADE'
});

// CustomItem belongs to User (Doctor)
CustomItem.belongsTo(User, {
  foreignKey: 'doctorId',
  as: 'doctor',
  onDelete: 'CASCADE'
});

// ConsultationDossier has many CustomItems (via consultation)
ConsultationDossier.hasMany(CustomItem, {
  foreignKey: 'consultationId',
  sourceKey: 'consultationId',
  as: 'customItems'
});
```

### Requête Sequelize pour GET /doctor/dossiers/:id

```javascript
const dossier = await ConsultationDossier.findByPk(dossierId, {
  include: [
    {
      model: Patient,
      as: 'patient'
    },
    {
      model: Consultation,
      as: 'consultation',
      required: false,
      include: [
        {
          model: CustomItem,
          as: 'customItems',
          required: false
        }
      ]
    },
    // OU directement via consultationId
    {
      model: CustomItem,
      as: 'customItems',
      where: {
        consultationId: { [Op.col]: 'ConsultationDossier.consultationId' }
      },
      required: false
    }
  ]
});
```

## Cas d'usage

### 1. Création d'un item personnalisé

**Scénario** : Le médecin veut documenter un test qui n'existe pas dans le catalogue.

1. Le médecin va dans l'onglet "Autre".
2. Il saisit le nom du test (ex: "Test spécifique ABC").
3. Il saisit une description optionnelle.
4. Le frontend envoie `POST /api/v1/doctor/custom-items` avec `patientId`, `doctorId`, `consultationId` (optionnel), `name`, `description`.
5. Le backend **crée** un nouvel item.
6. Le backend retourne l'item créé avec `isUpdate: false`.

### 2. Mise à jour d'un item existant

**Scénario** : Le médecin veut modifier un item personnalisé existant.

1. Le frontend charge le dossier via `GET /api/v1/doctor/dossiers/:id`.
2. Les items personnalisés sont inclus dans `customItems`.
3. Le frontend pré-remplit les champs avec les données existantes.
4. Le médecin modifie le nom ou la description.
5. Le frontend envoie `POST /api/v1/doctor/custom-items` avec les mêmes données (même `name` initial).
6. Le backend **détecte** qu'un item existe déjà (même `name`, même `patientId`, même `consultationId`) et le **met à jour**.
7. Le backend retourne l'item mis à jour avec `isUpdate: true`.

### 3. Chargement après rechargement de page

**Scénario** : Le médecin recharge la page de consultation.

1. Le frontend charge le dossier via `GET /api/v1/doctor/dossiers/:id`.
2. Les items personnalisés sont inclus dans `response.data.customItems`.
3. Le frontend utilise directement `response.data.customItems` pour pré-remplir le formulaire.
4. **Pas besoin** d'appel séparé à `GET /api/v1/doctor/custom-items`.

## Détection de mise à jour vs création

### Stratégie recommandée

Le backend doit détecter si un item existe déjà en se basant sur :
1. **patientId** : Même patient
2. **doctorId** : Même médecin
3. **consultationId** : Même consultation (ou consultation active si non fourni)
4. **name** : Même nom (comparaison exacte, case-sensitive ou non selon besoin)

### Exemple de logique

```javascript
// Normaliser le nom (trim, lowercase pour comparaison)
const normalizedName = req.body.name.trim().toLowerCase();

// Chercher un item existant
const existingItem = await CustomItem.findOne({
  where: {
    patientId: req.body.patientId,
    doctorId: req.body.doctorId,
    consultationId: consultationId || { [Op.is]: null },
    // Comparaison case-insensitive
    [Op.and]: [
      sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        normalizedName
      )
    ]
  }
});
```

## Validation et sécurité

### Vérifications à effectuer

1. **Patient existe** : Vérifier que le `patientId` existe et appartient à un patient valide.
2. **Consultation existe** : Si `consultationId` est fourni, vérifier qu'il existe.
3. **Médecin autorisé** : Vérifier que le médecin connecté est autorisé à consulter ce patient.
4. **Données valides** :
   - `name` : Requis, longueur max 255 caractères
   - `description` : Optionnel, longueur max 5000 caractères

### Exemple de validation

```javascript
const customItemSchema = Joi.object({
  consultationId: Joi.string().uuid().optional().allow(null),
  patientId: Joi.string().uuid().required(),
  doctorId: Joi.string().uuid().required(),
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().max(5000).optional().allow(null, '')
});

const { error, value } = customItemSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    success: false,
    message: "Données invalides",
    errors: error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    }))
  });
}
```

## Exemple de route Express.js complète

```javascript
router.post('/doctor/custom-items', authenticateToken, async (req, res) => {
  try {
    // Validation
    const { error, value } = customItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: error.details
      });
    }
    
    const { consultationId, patientId, doctorId, name, description } = value;
    
    // Vérifier que le patient existe
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient introuvable"
      });
    }
    
    // Vérifier que le médecin est autorisé
    if (doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez créer des items que pour vos propres consultations"
      });
    }
    
    // Trouver la consultation si consultationId n'est pas fourni
    let finalConsultationId = consultationId;
    if (!finalConsultationId) {
      const activeConsultation = await Consultation.findOne({
        where: {
          patientId,
          doctorId,
          status: 'in_progress'
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (activeConsultation) {
        finalConsultationId = activeConsultation.id;
      }
    }
    
    // Normaliser le nom pour la comparaison
    const normalizedName = name.trim().toLowerCase();
    
    // Chercher un item existant
    const whereClause = {
      patientId,
      doctorId,
      [Op.and]: [
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('name')),
          normalizedName
        )
      ]
    };
    
    if (finalConsultationId) {
      whereClause.consultationId = finalConsultationId;
    } else {
      whereClause.consultationId = { [Op.is]: null };
    }
    
    const existingItem = await CustomItem.findOne({
      where: whereClause
    });
    
    if (existingItem) {
      // MISE À JOUR
      await existingItem.update({
        name: name.trim(),
        description: description || null,
        updatedAt: new Date()
      });
      
      await existingItem.reload();
      
      return res.json({
        success: true,
        message: "Item personnalisé mis à jour avec succès",
        data: {
          item: existingItem,
          isUpdate: true
        }
      });
    } else {
      // CRÉATION
      const newItem = await CustomItem.create({
        consultationId: finalConsultationId || null,
        patientId,
        doctorId,
        name: name.trim(),
        description: description || null
      });
      
      return res.json({
        success: true,
        message: "Item personnalisé créé avec succès",
        data: {
          item: newItem,
          isUpdate: false
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'item:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la gestion de l'item personnalisé"
    });
  }
});
```

## Notes importantes

1. **Création unique** : Un item avec le même nom ne doit être créé qu'une seule fois par patient/consultation/médecin. Les appels suivants doivent mettre à jour l'item existant.

2. **Inclusion dans la réponse** : Les items personnalisés doivent **toujours** être inclus dans la réponse de `GET /api/v1/doctor/dossiers/:id` si la consultation existe, pour éviter les appels API supplémentaires.

3. **Nom unique** : Le nom de l'item doit être unique pour une combinaison patient/consultation/médecin. Si le même nom est utilisé, l'item existant est mis à jour.

4. **Consultation optionnelle** : Si `consultationId` n'est pas fourni, le backend doit chercher la consultation active du patient pour ce médecin.

5. **Imprimable** : Les items personnalisés doivent pouvoir être imprimés avec la consultation (via génération PDF).

## Frontend - Intégration

### Chargement des items depuis le dossier

```typescript
// Dans ConsultationPage.tsx
useEffect(() => {
  if (currentDossier?.customItems && currentDossier.customItems.length > 0) {
    // Pré-remplir le formulaire avec les items existants
    setOtherItems(
      currentDossier.customItems.map((item: any) => ({
        id: item.id, // Garder l'ID pour la mise à jour
        name: item.name || '',
        description: item.description || ''
      }))
    );
  } else {
    // Pas d'items, initialiser avec un item vide
    setOtherItems([{ name: '', description: '' }]);
  }
}, [currentDossier?.customItems]);
```

### Envoi des items

```typescript
const handleSaveOtherItem = async () => {
  const validItems = otherItems.filter((item) => item.name.trim());
  
  if (validItems.length === 0) {
    toast.error('Veuillez remplir au moins un item');
    return;
  }
  
  try {
    for (const item of validItems) {
      await createDoctorCustomItem({
        consultationId: consultation?.id,
        patientId: selectedPatient.id,
        doctorId: user.id,
        name: item.name.trim(),
        description: item.description?.trim() || undefined,
      });
    }
    
    toast.success('Items personnalisés enregistrés');
    // Recharger le dossier pour avoir les items à jour
    // ...
  } catch (error) {
    toast.error('Erreur lors de l\'enregistrement');
  }
};
```
