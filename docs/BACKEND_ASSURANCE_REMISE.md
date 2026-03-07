# Assurance et Remise — Spécification Backend (Accueil / Réception)

Ce document décrit les besoins backend pour les fonctionnalités **Assurance** et **Remise** sur l’accueil (enregistrement et prise en charge des patients).

---

## 1. Contexte métier

- **Assurance** : un patient peut être assuré. On enregistre son établissement d’assurance et un **pourcentage de couverture**. Ce pourcentage est déduit du montant à payer pour la **consultation**, et doit aussi s’appliquer aux **examens labo** et **imagerie** lorsque le patient paie ces actes.
- **Remise** : un patient peut bénéficier d’une **remise** (pourcentage). Elle s’applique sur le ou les **paiements** possibles (consultation, labo, imagerie, pharmacie, etc., selon les règles métier).
- Ces deux notions sont utilisées :
  - à **l’inscription** (nouveau patient) ;
  - à **l’accueil** pour un **patient déjà enregistré** (à chaque passage en caisse / paiement).

---

## 2. Données à gérer côté backend

### 2.1 Établissements d’assurance

- **Liste des établissements d’assurance** (mutuelles, conventions, etc.) utilisée pour le choix à l’écran.
- Champs suggérés : `id`, `name` (nom affiché), éventuellement `code`, `isActive`.
- **API suggérée** : `GET /api/insurance-establishments` (ou équivalent) retournant la liste des établissements actifs.

### 2.2 Patient — champs assurance

À stocker sur le **patient** (ou sur un lien patient–assurance si un patient peut avoir plusieurs assurances) :

| Champ | Type | Description |
|-------|------|-------------|
| `isInsured` | boolean | Patient assuré ou non |
| `insuranceEstablishmentId` | string (UUID ou id) | Référence vers l’établissement d’assurance (optionnel si non assuré) |
| `insuranceCoveragePercent` | number (0–100) | Pourcentage de couverture (ex. 80 = 80 %) |
| `insuranceMemberNumber` | string (optionnel) | Numéro d’identifiant chez l’assureur (numéro de contrat, matricule, etc.) |

- Ces champs peuvent être **saisis à l’inscription** et **modifiés à l’accueil** pour un patient déjà enregistré.
- Lors d’un **paiement** (consultation, labo, imagerie), le backend doit calculer le montant après déduction assurance (voir § 4).

### 2.3 Patient — champs remise

À stocker sur le **patient** ou sur le **contexte de la visite** (selon la règle métier : remise permanente vs remise ponctuelle) :

| Champ | Type | Description |
|-------|------|-------------|
| `hasDiscount` | boolean | Bénéficie d’une remise ou non |
| `discountPercent` | number (0–100) | Pourcentage de remise (ex. 10 = 10 %) |

- La remise s’applique sur le(s) paiement(s) possible(s) (voir § 4).
- À clarifier côté métier : la remise est-elle **par visite** ou **par patient** (permanente) ? Le front peut envoyer la valeur au moment du paiement dans les deux cas.

---

## 3. APIs à prévoir / adapter

### 3.1 Établissements d’assurance

- **GET /api/insurance-establishments**  
  - Réponse : liste d’objets `{ id, name, ... }`.  
  - Utilisation : peupler le sélecteur « Établissement d’assurance » à l’accueil (inscription et patient existant).

### 3.2 Création / mise à jour patient (inscription)

- **POST /api/reception/register** (ou équivalent) — inscription **nouveau patient**.
- Corps à étendre (ou à inclure dans un sous-objet `insurance` / `discount`) :
  - `insurance`: `{ isInsured, establishmentId?, coveragePercent? }`
  - `discount`: `{ hasDiscount, discountPercent? }`

Exemple (à adapter au schéma existant) :

```json
{
  "firstName": "...",
  "lastName": "...",
  "phone": "...",
  "insurance": {
    "isInsured": true,
    "establishmentId": "ins-1",
    "coveragePercent": 80
  },
  "discount": {
    "hasDiscount": true,
    "discountPercent": 10
  },
  "payment": { ... }
}
```

### 3.3 Patient déjà enregistré — mise à jour assurance / remise

- **PATCH /api/patients/:id** (ou **PUT**) : mise à jour des champs assurance et remise.
- Ou endpoint dédié : **PATCH /api/patients/:id/insurance** et **PATCH /api/patients/:id/discount** si vous préférez séparer.

L’accueil doit pouvoir **modifier** l’assurance et la remise d’un patient existant avant d’enregistrer un paiement (consultation, etc.).

### 3.4 Paiement (consultation, labo, imagerie)

- **POST /api/reception/register** (nouveau patient) et **POST /api/reception/patients/:id/payment** (patient existant) ou équivalents.
- Le backend doit :
  - Lire les données **assurance** et **remise** du patient (ou reçues dans la requête).
  - Calculer le **montant après déduction assurance** puis **après remise** (voir § 4).
  - Enregistrer le **montant final** (et idéalement le détail : base, déduction assurance, déduction remise) sur le paiement.

Optionnel : accepter dans le corps du paiement des surcharges explicites pour cette visite :

```json
{
  "amount": 50000,
  "insurance": { "isInsured": true, "establishmentId": "...", "coveragePercent": 80 },
  "discount": { "hasDiscount": true, "discountPercent": 10 }
}
```

Si non envoyé, le backend utilise les valeurs déjà enregistrées sur le patient.

---

## 4. Règles de calcul (à implémenter côté backend)

### 4.1 Ordre d’application

1. **Montant de base** = prix consultation (+ lit si applicable), ou total examens labo, ou total imagerie, etc.
2. **Déduction assurance** (si patient assuré et `coveragePercent` > 0) :  
   `deductionAssurance = montantBase * (coveragePercent / 100)`
3. **Montant après assurance** : `montantBase - deductionAssurance`
4. **Déduction remise** (si remise et `discountPercent` > 0) :  
   `deductionRemise = montantApresAssurance * (discountPercent / 100)`
5. **Montant final à payer** : `montantApresAssurance - deductionRemise` (à arrondir selon la règle métier).

### 4.2 Où s’appliquent assurance et remise

- **Consultation** : assurance puis remise sur le montant consultation (+ lit).
- **Examens labo** : assurance puis remise sur le total des examens labo (à appliquer au moment du paiement labo).
- **Imagerie** : assurance puis remise sur le total imagerie (au moment du paiement imagerie).
- **Pharmacie** : selon la règle métier (souvent seule la **remise** s’applique ; l’assurance peut être hors périmètre pour les médicaments — à valider).

---

## 5. Récapitulatif pour le front

- Le front (accueil) envoie :
  - à l’**inscription** : champs patient + `insurance` + `discount` + paiement ;
  - pour un **patient existant** : mise à jour éventuelle de l’assurance/remise (PATCH patient) puis enregistrement du paiement avec montant calculé côté backend (ou en envoyant insurance/discount dans la requête de paiement).
- Les **établissements d’assurance** sont chargés via `GET /api/insurance-establishments` (à créer côté backend).
- Les **pourcentages** sont saisis en 0–100 ; le backend fait les calculs et persiste le montant final et, si besoin, le détail (base, déduction assurance, déduction remise) pour l’historique et les rapports.

---

## 6. Données mock actuelles (frontend)

- **Établissements** : liste statique dans `RegisterPatient.tsx` (`MOCK_INSURANCE_ESTABLISHMENTS`). À remplacer par l’appel à `GET /api/insurance-establishments`.
- **Assurance / remise** : état local uniquement (mock). À brancher sur les APIs ci-dessus et sur les réponses patient (lecture des champs `insurance` et `discount` pour pré-remplir le formulaire pour un patient existant).

---

*Document rédigé pour l’équipe backend — à adapter selon les choix techniques et métier du projet.*
