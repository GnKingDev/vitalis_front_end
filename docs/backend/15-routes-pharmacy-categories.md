# Routes - Catégories de Produits Pharmacie

## Base URL
`/api/v1/pharmacy/categories`

## Vue d'ensemble

Les routes de catégories permettent de gérer les catégories de produits de la pharmacie. Les catégories sont utilisées pour organiser et filtrer les produits. Chaque produit doit être associé à une catégorie.

## Modèle de données

### PharmacyCategory

**Table**: `pharmacy_categories`

**Champs**:
- `id` (UUID, Primary Key)
- `name` (STRING, NOT NULL, UNIQUE) - Nom de la catégorie (ex: "Antalgiques", "Antibiotiques")
- `description` (TEXT, NULLABLE) - Description optionnelle de la catégorie
- `isActive` (BOOLEAN, DEFAULT true) - Indique si la catégorie est active
- `createdAt` (DATE, NOT NULL)
- `updatedAt` (DATE, NOT NULL)
- `createdBy` (UUID, Foreign Key → users.id, NULLABLE) - Utilisateur qui a créé la catégorie
- `updatedBy` (UUID, Foreign Key → users.id, NULLABLE) - Utilisateur qui a modifié la catégorie

**Relations**:
- `hasMany` PharmacyProduct - Une catégorie peut avoir plusieurs produits

**Indexes**:
- Index unique sur `name`
- Index sur `isActive`

**Contraintes**:
- Le nom de la catégorie doit être unique
- Le nom ne peut pas être vide
- Le nom doit être en majuscules ou format standardisé (selon les règles métier)

## Routes

### GET `/api/v1/pharmacy/categories`

**Description**: Liste toutes les catégories de produits actives

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `includeInactive` (boolean, optional, default: false) - Inclure les catégories inactives
- `includeCount` (boolean, optional, default: false) - Inclure le nombre de produits par catégorie

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Antalgiques",
        "description": "Médicaments contre la douleur",
        "isActive": true,
        "productCount": 15,
        "createdAt": "2026-01-15T10:00:00Z",
        "updatedAt": "2026-01-15T10:00:00Z",
        "createdBy": {
          "id": "uuid",
          "name": "Admin User"
        }
      }
    ]
  }
}
```

**Logique**:
- Par défaut, retourner uniquement les catégories actives (`isActive = true`)
- Si `includeInactive = true`, retourner toutes les catégories
- Si `includeCount = true`, inclure le nombre de produits associés à chaque catégorie
- Trier par nom de catégorie (ordre alphabétique)
- Inclure les informations de l'utilisateur créateur si disponible

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant (admin ou pharmacy requis)

---

### GET `/api/v1/pharmacy/categories/:id`

**Description**: Récupère les détails d'une catégorie spécifique

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID de la catégorie

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Antalgiques",
    "description": "Médicaments contre la douleur",
    "isActive": true,
    "productCount": 15,
    "products": [
      {
        "id": "uuid",
        "name": "Paracétamol 500mg",
        "price": 1500.00,
        "stock": 50
      }
    ],
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "createdBy": {
      "id": "uuid",
      "name": "Admin User"
    }
  }
}
```

**Query Parameters** (optionnels):
- `includeProducts` (boolean, default: false) - Inclure la liste des produits de cette catégorie

**Logique**:
- Vérifier que la catégorie existe
- Si `includeProducts = true`, inclure la liste des produits actifs de cette catégorie
- Inclure le nombre total de produits

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Catégorie introuvable

---

### POST `/api/v1/pharmacy/categories`

**Description**: Crée une nouvelle catégorie de produits

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "name": "Antalgiques",
  "description": "Médicaments contre la douleur"
}
```

**Champs**:
- `name` (string, required) - Nom de la catégorie (unique, non vide, max 100 caractères)
- `description` (string, optional) - Description de la catégorie (max 500 caractères)

**Réponse (201)**:
```json
{
  "success": true,
  "message": "Catégorie créée avec succès",
  "data": {
    "id": "uuid",
    "name": "Antalgiques",
    "description": "Médicaments contre la douleur",
    "isActive": true,
    "productCount": 0,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z",
    "createdBy": {
      "id": "uuid",
      "name": "Admin User"
    }
  }
}
```

**Logique**:
- Vérifier que l'utilisateur a le rôle `admin` ou `pharmacy`
- Valider que le nom n'est pas vide
- Vérifier l'unicité du nom (insensible à la casse)
- Normaliser le nom (trim, première lettre en majuscule)
- Créer la catégorie avec `isActive = true` par défaut
- Enregistrer l'ID de l'utilisateur créateur dans `createdBy`
- Retourner la catégorie créée

**Erreurs**:
- `400 Bad Request` - Données invalides (nom vide, trop long, etc.)
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `409 Conflict` - Une catégorie avec ce nom existe déjà

**Validation**:
- `name`: requis, non vide, 1-100 caractères, unique
- `description`: optionnel, max 500 caractères

---

### PUT `/api/v1/pharmacy/categories/:id`

**Description**: Met à jour une catégorie existante

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Paramètres URL**:
- `id` (UUID, required) - ID de la catégorie

**Body**:
```json
{
  "name": "Antalgiques et Anti-inflammatoires",
  "description": "Médicaments contre la douleur et l'inflammation",
  "isActive": true
}
```

**Champs** (tous optionnels, mais au moins un doit être fourni):
- `name` (string, optional) - Nouveau nom de la catégorie
- `description` (string, optional) - Nouvelle description
- `isActive` (boolean, optional) - Statut actif/inactif

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Catégorie modifiée avec succès",
  "data": {
    "id": "uuid",
    "name": "Antalgiques et Anti-inflammatoires",
    "description": "Médicaments contre la douleur et l'inflammation",
    "isActive": true,
    "productCount": 15,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-20T14:30:00Z",
    "createdBy": {
      "id": "uuid",
      "name": "Admin User"
    },
    "updatedBy": {
      "id": "uuid",
      "name": "Pharmacy User"
    }
  }
}
```

**Logique**:
- Vérifier que l'utilisateur a le rôle `admin` ou `pharmacy`
- Vérifier que la catégorie existe
- Si `name` est fourni, vérifier l'unicité (en excluant la catégorie actuelle)
- Normaliser le nom si fourni
- Mettre à jour uniquement les champs fournis
- Enregistrer l'ID de l'utilisateur dans `updatedBy`
- Mettre à jour `updatedAt`
- Retourner la catégorie mise à jour

**Erreurs**:
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Catégorie introuvable
- `409 Conflict` - Une autre catégorie avec ce nom existe déjà

**Validation**:
- `name`: si fourni, 1-100 caractères, unique (sauf catégorie actuelle)
- `description`: si fourni, max 500 caractères

---

### DELETE `/api/v1/pharmacy/categories/:id`

**Description**: Supprime une catégorie (soft delete ou hard delete selon la stratégie)

**Headers**: `Authorization: Bearer <token>`

**Paramètres URL**:
- `id` (UUID, required) - ID de la catégorie

**Query Parameters**:
- `force` (boolean, optional, default: false) - Si true, supprime même si des produits sont associés

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Catégorie supprimée avec succès"
}
```

**Logique**:
- Vérifier que l'utilisateur a le rôle `admin` ou `pharmacy`
- Vérifier que la catégorie existe
- Compter le nombre de produits associés à cette catégorie
- Si des produits sont associés et `force = false`:
  - Retourner une erreur `400 Bad Request` avec un message indiquant le nombre de produits associés
  - Suggérer de d'abord réassigner ou supprimer les produits
- Si `force = true` ou aucun produit associé:
  - Option 1 (Soft Delete): Mettre `isActive = false` (recommandé)
  - Option 2 (Hard Delete): Supprimer définitivement la catégorie
  - Si hard delete, les produits associés auront `category = null` ou une catégorie par défaut

**Erreurs**:
- `400 Bad Request` - Des produits sont associés à cette catégorie (si `force = false`)
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant
- `404 Not Found` - Catégorie introuvable

**Recommandation**: Utiliser le soft delete (`isActive = false`) plutôt que le hard delete pour préserver l'historique.

---

## Intégration avec les Produits

### Relation avec PharmacyProduct

Lors de la création ou modification d'un produit, la catégorie doit être validée :

```javascript
// Exemple de validation lors de la création d'un produit
const category = await PharmacyCategory.findOne({
  where: { 
    id: productData.categoryId,
    isActive: true 
  }
});

if (!category) {
  throw new Error('Catégorie invalide ou inactive');
}
```

### Catégories par défaut

Il est recommandé de créer des catégories par défaut lors de l'initialisation de la base de données :

- Antalgiques
- Antibiotiques
- Antipaludéens
- Antihypertenseurs
- Gastro-entérologie
- Anti-inflammatoires
- Antidiabétiques
- Solutés
- Vitamines
- Autres

---

## Permissions

### Rôles autorisés
- `admin` - Accès complet (CRUD)
- `pharmacy` - Accès complet (CRUD)

### Rôles non autorisés
- `reception` - Pas d'accès
- `doctor` - Pas d'accès
- `lab` - Pas d'accès

---

## Exemples de requêtes

### Créer une catégorie
```bash
curl -X POST http://localhost:3000/api/v1/pharmacy/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Antalgiques",
    "description": "Médicaments contre la douleur"
  }'
```

### Lister toutes les catégories
```bash
curl -X GET http://localhost:3000/api/v1/pharmacy/categories \
  -H "Authorization: Bearer <token>"
```

### Modifier une catégorie
```bash
curl -X PUT http://localhost:3000/api/v1/pharmacy/categories/<category-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Antalgiques et Anti-inflammatoires",
    "description": "Médicaments contre la douleur et l'inflammation"
  }'
```

### Supprimer une catégorie
```bash
curl -X DELETE http://localhost:3000/api/v1/pharmacy/categories/<category-id> \
  -H "Authorization: Bearer <token>"
```

---

## Notes importantes

1. **Unicité du nom**: Le nom de la catégorie doit être unique (insensible à la casse)
2. **Soft Delete recommandé**: Préférer désactiver (`isActive = false`) plutôt que supprimer définitivement
3. **Validation des produits**: Avant de supprimer une catégorie, vérifier qu'aucun produit n'y est associé (sauf si `force = true`)
4. **Normalisation**: Normaliser les noms de catégories (trim, première lettre en majuscule)
5. **Historique**: Conserver les informations de création et modification (`createdBy`, `updatedBy`)
