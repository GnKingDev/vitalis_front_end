# Assurance et Remise — Backend (réponses API)

Ce document décrit comment le **backend** envoie les données d’assurance et de remise, et comment le **frontend** les affiche.

---

## APIs

### Établissements d'assurance

| Méthode | URL | Description | Accès |
|--------|-----|-------------|--------|
| GET | `/api/v1/insurance-establishments` | Liste (actifs par défaut, pour sélecteur) | Auth |
| GET | `/api/v1/insurance-establishments/:id` | Détail | Auth |
| POST | `/api/v1/insurance-establishments` | Créer | Admin |
| PUT | `/api/v1/insurance-establishments/:id` | Modifier | Admin |
| DELETE | `/api/v1/insurance-establishments/:id` | Désactiver | Admin |

**Corps POST/PUT** : `{ "name": "Nom", "code": "CODE", "isActive": true }`

### Patient — assurance / remise

- **POST** et **PUT** `/api/v1/patients` acceptent en plus :
  - `insurance`: `{ isInsured: boolean, establishmentId: uuid, coveragePercent: 0-100, memberNumber?: string }`
  - `discount`: `{ hasDiscount: boolean, discountPercent: 0-100 }`
- **GET** `/api/v1/patients/:id` renvoie les champs `isInsured`, `insuranceEstablishmentId`, `insuranceCoveragePercent`, `insuranceMemberNumber`, `hasDiscount`, `discountPercent` et l’objet `insuranceEstablishment` (id, name, code) si présent.

### Enregistrement (réception)

- **POST** `/api/v1/reception/patients/register` : en plus des champs existants, accepter `insurance` (avec `memberNumber` optionnel) et `discount` (même structure que ci‑dessus). Le montant du paiement consultation est calculé après assurance puis remise ; le détail est stocké sur le paiement (`amountBase`, `insuranceDeduction`, `discountDeduction`).

### Paiement patient existant

- **POST** `/api/v1/reception/patients/:id/payment` : le montant envoyé est le **montant de base**. Le backend applique assurance puis remise (depuis le patient ou surcharges dans le corps) et enregistre le montant final + détail. Pour la pharmacie, seule la remise s’applique (pas d’assurance).

---

## Affichage assurance et remise sur les patients (frontend)

Pour afficher l’assurance et la remise partout où un patient est affiché (listes, détail, paiements, dossiers, etc.), **toutes les réponses API qui renvoient un ou des patients** incluent les **champs plats** suivants sur chaque objet patient :

| Champ | Type | Description |
|-------|------|-------------|
| `insuranceEstablishmentName` | string \| null | Nom de la société d’assurance (ex. « AXA Assurance Santé »). |
| `insuranceCoveragePercent` | number | Pourcentage de couverture (0–100). 0 si non assuré. |
| `discountPercent` | number | Pourcentage de remise (0–100). 0 si pas de remise. |

**Endpoints concernés** (liste non exhaustive) :  
`GET /api/v1/patients`, `GET /api/v1/patients/:id`, `GET /api/v1/reception/patients`, `GET /api/v1/reception/patients/:id`, `GET /api/v1/reception/payments`, `GET /api/v1/reception/lab-payments`, `GET /api/v1/pharmacy/payments`, `GET /api/v1/doctor/dossiers`, etc. Tout endpoint qui retourne un objet `patient` (ou un tableau de patients) inclut ces trois champs.

**Règles d’affichage côté frontend** :
- **Assurance** : afficher si `insuranceEstablishmentName` est présent **ou** si `insuranceCoveragePercent` > 0 (ex. « [Nom] (X %) »).
- **Remise** : afficher si `discountPercent` > 0 (ex. « Remise 10 % »).
- Si aucune donnée (nom null, pourcentages 0), le front affiche « — » dans les colonnes Assurance / Remise.

---

## Sous-menu Administration (frontend)

Dans le menu **Administration**, le sous-menu **Établissements d’assurance** :

1. Liste les établissements : `GET /api/v1/insurance-establishments?isActive=true` (ou sans filtre pour tout afficher).
2. Permet d’ajouter : formulaire → `POST /api/v1/insurance-establishments`.
3. Permet de modifier : formulaire pré-rempli → `PUT /api/v1/insurance-establishments/:id`.
4. Permet de désactiver : `DELETE /api/v1/insurance-establishments/:id`.

L’accueil (inscription / paiement) utilise `GET /api/v1/insurance-establishments` pour peupler le sélecteur « Établissement d’assurance » avec les établissements actifs.

---

*Document aligné avec le backend VITALIS — Frontend.*
