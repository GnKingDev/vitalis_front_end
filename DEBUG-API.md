# Guide de débogage des requêtes API

## Problème : Les requêtes ne touchent pas le backend

### Vérifications à faire

1. **Vérifier que le backend est démarré**
   ```bash
   # Le backend doit être sur le port 3000
   curl http://localhost:3000/api/v1/health
   # ou
   curl http://localhost:3000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'
   ```

2. **Vérifier la configuration du proxy dans Vite**
   - Le proxy est configuré dans `vite.config.ts`
   - Il redirige `/api` vers `http://localhost:3000`
   - Les logs de proxy apparaissent dans la console du terminal où Vite tourne

3. **Vérifier les logs dans la console du navigateur**
   - Ouvrir la console du navigateur (F12)
   - Les logs commencent par :
     - 🔧 : Configuration de l'API
     - 🔵 : Requête envoyée
     - 🟢 : Réponse reçue
     - 🔴 : Erreur
     - 🔐 : Tentative de login
     - ✅ : Login réussi
     - ❌ : Erreur de login

4. **Vérifier l'URL construite**
   - En développement : `/api/v1/auth/login`
   - Le proxy Vite transforme cela en : `http://localhost:3000/api/v1/auth/login`

5. **Vérifier les headers**
   - Le token doit être dans `Authorization: Bearer <token>`
   - `Content-Type: application/json` doit être présent

### Erreurs courantes

#### Erreur CORS
Si vous voyez une erreur CORS, c'est que :
- Le backend n'autorise pas les requêtes depuis `http://localhost:5173`
- Solution : Configurer CORS dans le backend pour autoriser `http://localhost:5173`

#### Erreur 404
Si vous voyez une erreur 404 :
- Vérifier que le backend écoute bien sur le port 3000
- Vérifier que les routes sont bien `/api/v1/...`

#### Erreur de connexion (ERR_CONNECTION_REFUSED)
- Le backend n'est pas démarré
- Le backend écoute sur un autre port
- Vérifier avec `netstat -an | grep 3000` (Linux/Mac) ou `netstat -an | findstr 3000` (Windows)

### Test manuel

1. **Tester directement le backend**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@vitalis.com","password":"password"}'
   ```

2. **Tester via le proxy**
   - Ouvrir `http://localhost:5173` dans le navigateur
   - Ouvrir la console (F12)
   - Aller dans l'onglet Network
   - Essayer de se connecter
   - Vérifier la requête dans Network

### Configuration

#### Variables d'environnement
Créer un fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:3000
```

#### Ports
- Frontend (Vite) : `http://localhost:5173`
- Backend (API) : `http://localhost:3000`

### Logs de débogage

Les logs sont activés automatiquement en mode développement. Pour les désactiver, commenter les `console.log` dans :
- `src/config/api.ts`
- `src/services/api/authService.ts`
- `vite.config.ts`
