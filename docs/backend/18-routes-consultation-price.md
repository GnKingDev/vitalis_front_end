# Routes - Prix de Consultation

## Base URL
`/api/v1/consultation/price`

## Vue d'ensemble

Les routes de prix de consultation permettent de gérer le prix unique de la consultation médicale. Il n'existe qu'un seul prix de consultation pour toute la clinique, qui peut être défini et modifié par l'administrateur.

## Modèle de données

### ConsultationPrice

**Table**: `consultation_prices`

**Champs**:
- `id` (UUID, Primary Key)
- `price` (DECIMAL(10, 2), NOT NULL) - Prix de la consultation en GNF
- `isActive` (BOOLEAN, NOT NULL, DEFAULT true) - Indique si le prix est actif
- `createdAt` (DATE, NOT NULL)
- `updatedAt` (DATE, NOT NULL)
- `createdBy` (UUID, Foreign Key → users.id, NULLABLE) - Utilisateur qui a créé le prix
- `updatedBy` (UUID, Foreign Key → users.id, NULLABLE) - Utilisateur qui a modifié le prix

**Contraintes**:
- Il ne peut exister qu'un seul prix actif à la fois (`isActive = true`)
- Le prix doit être supérieur à 0
- Le prix est en GNF (Franc guinéen)

**Indexes**:
- Index unique sur `isActive` (pour garantir un seul prix actif)

**Validations**:
- `price`: Requis, > 0, type DECIMAL(10, 2)

## Routes

### GET `/api/v1/consultation/price`

**Description**: Récupère le prix actuel de la consultation

**Headers**: `Authorization: Bearer <token>`

**Réponse (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "price": 50000,
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-28T15:00:00Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "Admin User"
    },
    "updatedBy": {
      "id": "user-uuid",
      "name": "Admin User"
    }
  }
}
```

**Logique**:
- Retourner le prix actif (`isActive = true`)
- Si aucun prix actif n'existe, retourner un prix par défaut (0 ou null selon la logique métier)
- Inclure les informations de l'utilisateur créateur et modificateur

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès en lecture seule (pour afficher le prix lors de l'enregistrement)
- `doctor`: Accès en lecture seule

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `404 Not Found` - Aucun prix de consultation défini (optionnel, peut retourner 0)

---

### PUT `/api/v1/consultation/price`

**Description**: Met à jour le prix de la consultation (crée le prix s'il n'existe pas)

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "price": 50000
}
```

**Validation**:
- `price` (number, required) - Prix en GNF, doit être > 0

**Réponse (200)**:
```json
{
  "success": true,
  "message": "Prix de consultation mis à jour avec succès",
  "data": {
    "id": "uuid",
    "price": 50000,
    "isActive": true,
    "updatedAt": "2026-01-28T16:00:00Z",
    "updatedBy": {
      "id": "user-uuid",
      "name": "Admin User"
    }
  }
}
```

**Logique**:
1. **Si un prix actif existe**:
   - Mettre à jour le prix existant
   - Mettre à jour `updatedAt` et `updatedBy`
   - Conserver `isActive = true`

2. **Si aucun prix actif n'existe**:
   - Créer un nouveau prix avec `isActive = true`
   - Enregistrer `createdBy` et `updatedBy` avec l'utilisateur actuel

3. **Validation**:
   - Vérifier que `price > 0`
   - Vérifier que le prix est un nombre valide

**Permissions**:
- `admin`: Accès complet
- `reception`: Accès refusé
- `doctor`: Accès refusé

**Erreurs**:
- `400 Bad Request` - Prix invalide (<= 0, non numérique, etc.)
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant (admin requis)

**Exemple de validation**:
```javascript
// Vérifier le prix
if (!data.price || data.price <= 0) {
  return res.status(400).json({
    success: false,
    message: 'Le prix doit être supérieur à 0'
  });
}

if (typeof data.price !== 'number' || isNaN(data.price)) {
  return res.status(400).json({
    success: false,
    message: 'Le prix doit être un nombre valide'
  });
}
```

---

### GET `/api/v1/consultation/price/history` (Optionnel)

**Description**: Récupère l'historique des modifications du prix de consultation

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (number, optional, default: 10) - Nombre d'entrées à retourner

**Réponse (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "price": 50000,
      "isActive": true,
      "updatedAt": "2026-01-28T16:00:00Z",
      "updatedBy": {
        "id": "user-uuid",
        "name": "Admin User"
      }
    },
    {
      "id": "uuid",
      "price": 45000,
      "isActive": false,
      "updatedAt": "2026-01-15T10:00:00Z",
      "updatedBy": {
        "id": "user-uuid",
        "name": "Admin User"
      }
    }
  ]
}
```

**Logique**:
- Retourner tous les prix (actifs et inactifs) triés par date de modification (plus récent en premier)
- Limiter le nombre de résultats si `limit` est fourni
- Inclure les informations de l'utilisateur modificateur

**Permissions**:
- `admin`: Accès complet

**Erreurs**:
- `401 Unauthorized` - Token manquant ou invalide
- `403 Forbidden` - Rôle insuffisant

---

## Logique métier

### Règles de gestion

1. **Prix unique**:
   - Il ne peut exister qu'un seul prix actif à la fois
   - Lors de la mise à jour, le prix précédent est désactivé (`isActive = false`) et un nouveau prix est créé, OU le prix existant est mis à jour (selon la logique métier choisie)

2. **Historique**:
   - Conserver l'historique des prix précédents pour traçabilité
   - Les prix inactifs ne sont plus utilisés mais restent en base de données

3. **Utilisation du prix**:
   - Le prix actif est utilisé lors de la création de paiements de consultation
   - Le prix est affiché dans l'interface de réception lors de l'enregistrement d'un patient

4. **Modification**:
   - Seul l'administrateur peut modifier le prix
   - La modification prend effet immédiatement pour toutes les nouvelles consultations

### Hooks Sequelize

**Before Create/Update**:
- Vérifier que le prix est > 0
- S'assurer qu'il n'y a qu'un seul prix actif (désactiver les autres si nécessaire)

**After Update**:
- Si un nouveau prix actif est créé, désactiver tous les autres prix actifs

## Intégration Frontend-Backend

### Exemple d'utilisation dans le frontend

```typescript
// Charger le prix actuel
const loadPrice = async () => {
  const response = await getConsultationPrice();
  if (response.success && response.data) {
    const currentPrice = response.data.price || 0;
    setPrice(formatPrice(currentPrice.toString()));
  }
};

// Mettre à jour le prix
const handleSave = async () => {
  const numericPrice = parsePrice(price);
  
  if (numericPrice <= 0) {
    toast.error('Le prix doit être supérieur à 0');
    return;
  }

  const response = await updateConsultationPrice({ price: numericPrice });
  if (response.success) {
    toast.success('Prix de consultation mis à jour avec succès');
  }
};
```

### Utilisation dans la réception

Lors de l'enregistrement d'un patient ou de la création d'un paiement de consultation, le prix peut être récupéré via :

```typescript
const consultationPrice = await getConsultationPrice();
const amount = consultationPrice.data.price;
```

## Sécurité

- Seul l'administrateur peut modifier le prix
- Le prix est en lecture seule pour les autres rôles
- Toutes les modifications sont tracées (createdBy, updatedBy, timestamps)

## Statistiques

Le prix de consultation peut être utilisé dans les statistiques de revenus :

- `GET /api/v1/stats/revenue` - Inclure le prix de consultation dans le calcul des revenus

Voir [Routes - Statistiques](./11-routes-stats.md) pour plus de détails.
