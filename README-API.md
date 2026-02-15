# Configuration API et Proxy

## Configuration du Proxy

Le projet utilise Vite avec un proxy configuré pour rediriger toutes les requêtes API vers le backend.

### Configuration Vite

Le proxy est configuré dans `vite.config.ts` :

```typescript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL || 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path, // Garde /api dans l'URL
  },
}
```

### Ports

- **Frontend (Vite)** : `localhost:5173` (port par défaut de Vite)
- **Backend (API)** : `localhost:3000` (configurable via `VITE_API_URL`)

### Variables d'environnement

Créer un fichier `.env` à la racine du projet (copier depuis `.env.example` si disponible) :

```env
# URL du backend API
# En développement, le backend devrait tourner sur le port 3000
VITE_API_URL=http://localhost:3000
```

En production, deux options sont possibles :

1. **Backend sur le même domaine** (recommandé) : Ne pas définir `VITE_API_URL` ou le laisser vide. Les requêtes utiliseront des URLs relatives (`/api/v1`) qui pointent vers le même domaine que le frontend.

2. **Backend sur un sous-domaine différent** : Définir `VITE_API_URL` avec l'URL complète du backend :
```env
VITE_API_URL=https://api.vitalis.com
```

**Note** : 
- En développement, le proxy Vite redirige `/api` vers `http://localhost:3000` (ou la valeur de `VITE_API_URL`).
- En production, si `VITE_API_URL` n'est pas défini, les requêtes utilisent des URLs relatives vers le même domaine.
- Le proxy Vite n'est actif qu'en développement (`npm run dev`). En production (`npm run build`), les fichiers statiques sont servis et les requêtes API sont faites directement.

## Utilisation de l'API

### Routes centralisées

Toutes les routes API sont centralisées dans `src/config/apiRoutes.ts` pour éviter les erreurs de typo :

```typescript
import API_ROUTES from '@/config/apiRoutes';

// Utilisation
const patients = await api.get(API_ROUTES.patients.list);
const patient = await api.get(API_ROUTES.patients.get('patient-id'));
const loginResponse = await api.post(API_ROUTES.auth.login, {
  email: 'docteur@vitalis.com',
  password: 'motdepasse123'
});
```

### Configuration de base

Le fichier `src/config/api.ts` contient la configuration de base :

- `API_BASE_URL` : URL de base de l'API (`/api/v1` en dev, URL complète en prod)
- `buildApiUrl()` : Construit une URL complète pour une route
- `getDefaultHeaders()` : Retourne les headers par défaut (inclut le token JWT)
- `apiRequest()` : Fonction générique pour les requêtes API
- `api` : Objet avec les méthodes HTTP (get, post, put, patch, delete)

### Exemple d'utilisation

```typescript
import api from '@/config/api';

// GET request
const patients = await api.get('/patients', { page: 1, limit: 10 });

// POST request
const newPatient = await api.post('/patients', {
  firstName: 'John',
  lastName: 'Doe',
  // ...
});

// PUT request
const updated = await api.put(`/patients/${id}`, {
  firstName: 'Jane',
});

// DELETE request
await api.delete(`/patients/${id}`);
```

### Services API

Les services sont organisés par domaine dans `src/services/api/` :

- `authService.ts` : Authentification (login, logout, getCurrentUser)
- `patientsService.ts` : Gestion des patients
- (À ajouter : consultationsService, labService, etc.)

### Exemple avec un service

```typescript
import { login } from '@/services/api/authService';
import { getPatients } from '@/services/api/patientsService';

// Connexion
const { token, user } = await login({
  email: 'docteur@vitalis.com',
  password: 'motdepasse123'
});

// Récupérer les patients
const { data } = await getPatients({ page: 1, limit: 10 });
```

## Routes API disponibles

Toutes les routes suivent le pattern : `/api/v1/{ressource}`

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/me` - Utilisateur connecté

### Patients
- `GET /api/v1/patients` - Liste des patients
- `GET /api/v1/patients/:id` - Détails d'un patient
- `POST /api/v1/patients` - Créer un patient
- `PUT /api/v1/patients/:id` - Modifier un patient
- `GET /api/v1/patients/:id/history` - Historique complet
- `GET /api/v1/patients/:id/timeline` - Timeline des événements
- `GET /api/v1/patients/:id/dossiers` - Dossiers de consultation
- `GET /api/v1/patients/export` - Export Excel

### Consultations
- `GET /api/v1/consultations` - Liste des consultations
- `GET /api/v1/consultations/:id` - Détails d'une consultation
- `POST /api/v1/consultations` - Créer une consultation
- `PUT /api/v1/consultations/:id` - Modifier une consultation

### Laboratoire
- `GET /api/v1/lab/requests` - Demandes de laboratoire
- `GET /api/v1/lab/requests/:id` - Détails d'une demande
- `POST /api/v1/lab/requests` - Créer une demande
- `GET /api/v1/lab/results` - Résultats de laboratoire
- `POST /api/v1/lab/results` - Créer un résultat

### Imagerie
- `GET /api/v1/imaging/requests` - Demandes d'imagerie
- `POST /api/v1/imaging/requests` - Créer une demande

### Pharmacie
- `GET /api/v1/pharmacy/products` - Produits
- `POST /api/v1/pharmacy/products` - Créer un produit
- `GET /api/v1/pharmacy/payments` - Paiements pharmacie
- `POST /api/v1/pharmacy/payments` - Créer un paiement

### Paiements
- `GET /api/v1/payments` - Liste des paiements
- `POST /api/v1/payments` - Créer un paiement

### Réception
- `GET /api/v1/reception/patients` - Patients (réception)
- `POST /api/v1/reception/patients/register` - Enregistrer un patient
- `GET /api/v1/reception/assignments` - Assignations
- `POST /api/v1/reception/assignments` - Créer une assignation

### Statistiques
- `GET /api/v1/stats/overview` - Vue d'ensemble
- `GET /api/v1/stats/patients` - Stats patients
- `GET /api/v1/stats/revenue` - Stats revenus

## Gestion des erreurs

Toutes les requêtes API gèrent automatiquement les erreurs :

```typescript
try {
  const data = await api.get('/patients');
} catch (error) {
  // error.message contient le message d'erreur du backend
  console.error('Erreur:', error.message);
}
```

## Authentification

Le token JWT est automatiquement inclus dans les headers de toutes les requêtes via `getDefaultHeaders()`. Le token est récupéré depuis `sessionStorage` ou `localStorage`.

Pour mettre à jour le token après une connexion :

```typescript
import { login } from '@/services/api/authService';

const { token, user } = await login(credentials);
// Le token est automatiquement stocké dans sessionStorage
```

## Développement

1. Démarrer le backend sur le port 3000
2. Démarrer le frontend : `npm run dev`
3. Le frontend sera accessible sur `http://localhost:5173` (port par défaut de Vite)
4. Toutes les requêtes vers `/api/*` seront automatiquement proxifiées vers le backend sur le port 3000

## Production

En production, configurer `VITE_API_URL` avec l'URL complète du backend. Le proxy Vite n'est utilisé qu'en développement.

```env
VITE_API_URL=https://api.vitalis.com
```

## Résumé de la Configuration

### Fichiers créés

1. **`vite.config.ts`** : Configuration du proxy Vite
   - Port frontend : **5173** (port par défaut de Vite)
   - Proxy `/api` → `http://localhost:3000` (configurable via `VITE_API_URL`)

2. **`src/config/api.ts`** : Configuration de base de l'API
   - Gestion de l'URL de base (`/api/v1` en dev)
   - Headers par défaut (inclut JWT automatiquement)
   - Gestion des erreurs
   - Méthodes HTTP helpers (get, post, put, patch, delete)

3. **`src/config/apiRoutes.ts`** : Routes centralisées
   - Toutes les routes API documentées
   - Facilite la maintenance et évite les erreurs de typo

4. **`src/services/api/`** : Services API par domaine
   - `authService.ts` : Authentification
   - `patientsService.ts` : Patients
   - (À ajouter : consultationsService, labService, pharmacyService, etc.)

5. **`README-API.md`** : Documentation complète
6. **`ENV-EXAMPLE.txt`** : Exemple de configuration `.env`

### Structure des requêtes

**Développement** :
- Frontend : `http://localhost:5173/api/v1/{route}`
- Proxy redirige vers : `http://localhost:3000/api/v1/{route}`

**Production** :
- Frontend : `https://frontend.com/api/v1/{route}`
- Appel direct vers : `https://api.vitalis.com/api/v1/{route}`

### Prochaines étapes

1. ✅ Créer le fichier `.env` avec `VITE_API_URL=http://localhost:3000`
2. ✅ Démarrer le backend sur le port 3000
3. ✅ Démarrer le frontend : `npm run dev`
4. ✅ Accéder au frontend sur `http://localhost:5173`
5. ✅ Tester une requête API pour vérifier le proxy
5. ⏳ Créer les autres services API (consultations, lab, pharmacy, etc.)
6. ⏳ Remplacer les appels mockData par les vrais appels API
