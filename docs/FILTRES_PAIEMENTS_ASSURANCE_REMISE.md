# Filtres par assurance et remise + Export Excel (paiements)

Ce document décrit l’utilisation des **filtres par assurance et remise** et du **bouton Exporter en Excel** sur les pages de paiements.

---

## 1. Où sont ces fonctionnalités ?

Elles sont disponibles sur **trois pages** :

| Page | Chemin | Rôle typique |
|------|--------|---------------|
| **Paiements (réception)** | Réception → Paiements | Réception, Admin |
| **Paiements Labo et Imagerie** | Réception → Paiements Labo et Imagerie | Réception, Admin |
| **Paiements Pharmacie** | Pharmacie → Paiements | Pharmacie, Admin |

---

## 2. Filtre par assurance

- **Libellé** : « Assurance »
- **Valeurs** :
  - **Tous** : aucun filtre (tous les paiements).
  - **Assurés** : uniquement les paiements dont le patient a une assurance (établissement + couverture).
  - **Non assurés** : uniquement les paiements dont le patient n’a pas d’assurance.

**Utilisation** : choisir une valeur dans la liste, puis cliquer sur **« Appliquer les filtres »**. La liste des paiements est mise à jour en fonction du critère assurance (et des autres filtres actifs).

### 2.1 Filtre Assureur (quand « Assurés » est choisi)

Dès que vous sélectionnez **« Assurés »**, un second filtre **« Assureur »** apparaît :

- **Tous les assureurs** : tous les patients assurés, quel que soit l’établissement d’assurance.
- **Nom d’un assureur** (ex. « SLP », « AXA »…) : uniquement les paiements dont le patient est assuré chez cet établissement.

Vous pouvez donc soit afficher tous les assurés, soit restreindre à une société d’assurance précise. Cliquer sur **« Appliquer les filtres »** après avoir choisi l’assureur (ou laissé « Tous les assureurs »).

---

## 3. Filtre par remise

- **Libellé** : « Remise »
- **Valeurs** :
  - **Tous** : aucun filtre.
  - **Avec remise** : uniquement les paiements dont le patient bénéficie d’une remise (pourcentage > 0).
  - **Sans remise** : uniquement les paiements sans remise.

**Utilisation** : même principe que l’assurance : sélectionner une valeur puis **« Appliquer les filtres »**.

---

## 4. Combinaison avec les autres filtres

Sur chaque page, vous pouvez combiner :

- **Date** (calendrier ou « Tous les paiements »)
- **Type** (réception) ou **Statut** (labo, pharmacie)
- **Assurance** (Tous / Assurés / Non assurés)
- **Remise** (Tous / Avec remise / Sans remise)
- **Recherche** (ID Vitalis, nom, N° paiement, etc.)

Tous les critères actifs sont appliqués ensemble. Le bouton **« Réinitialiser »** remet tous les filtres à leur valeur par défaut (dont Assurance et Remise à « Tous »).

---

## 5. Exporter en Excel

- **Bouton** : **« Exporter en Excel »** (icône téléchargement), à côté de « Appliquer les filtres » et « Réinitialiser ».
- **Comportement** :
  - L’export utilise **les mêmes filtres que la liste** (date, type/statut, recherche, **assurance**, **remise**).
  - Un fichier Excel (`.xlsx`) est généré et téléchargé.
  - Le nom du fichier contient la date d’export et, selon la page, un libellé du type :
    - `paiements_YYYY-MM-DD.xlsx` ou `paiements_all_YYYY-MM-DD.xlsx` (réception)
    - `paiements_labo_imagerie_...` (labo/imagerie)
    - `paiements_pharmacie_...` (pharmacie)

**Utilisation** : appliquer les filtres souhaités (y compris assurance et remise), puis cliquer sur **« Exporter en Excel »**. Aucune étape supplémentaire n’est nécessaire.

---

## 6. Récapitulatif par page

### 6.1 Paiements (réception)

- Filtres : Date, Type de paiement, **Assurance**, **Remise**, Recherche (ID Vitalis).
- Export : **Exporter en Excel** applique les filtres courants (y compris assurance et remise).

### 6.2 Paiements Labo et Imagerie

- Filtres : Date, Statut, **Assurance**, **Remise**, Recherche.
- Export : **Exporter en Excel** (visible pour les admins) avec les mêmes filtres.

### 6.3 Paiements Pharmacie

- Filtres : Date, Statut, **Assurance**, **Remise**, Rechercher.
- Export : **Exporter en Excel** avec les mêmes filtres.

---

## 7. Côté technique (backend)

Pour que les filtres **assurance** et **remise** et l’**export** fonctionnent côté serveur, les APIs doivent accepter les paramètres suivants.

### Liste des paiements

- **Réception** : `GET /api/v1/reception/payments?isInsured=true|false&hasDiscount=true|false&insuranceEstablishmentId=...` (optionnel, pour filtrer par assureur quand `isInsured=true`).
- **Labo / Imagerie** : `GET /api/v1/reception/lab-payments?isInsured=...&hasDiscount=...&insuranceEstablishmentId=...`.
- **Pharmacie** : `GET /api/v1/pharmacy/payments?isInsured=...&hasDiscount=...&insuranceEstablishmentId=...`.

### Export Excel

- **Réception** : `GET /api/v1/reception/payments/export?date=...&type=...&search=...&isInsured=...&hasDiscount=...&insuranceEstablishmentId=...` (réponse en fichier binaire `.xlsx`).
- **Labo / Imagerie** : `GET /api/v1/reception/lab-payments/export?...&isInsured=...&hasDiscount=...&insuranceEstablishmentId=...`.
- **Pharmacie** : `GET /api/v1/pharmacy/payments/export?...&isInsured=...&hasDiscount=...&insuranceEstablishmentId=...`.

Si ces paramètres ou routes d’export ne sont pas encore implémentés, le front envoie déjà les requêtes ; il suffit d’ajouter la logique côté backend pour filtrer et générer l’Excel en conséquence.


---

## 8. Colonnes montants dans les tableaux (et exports)

Dans les trois pages de paiements, le tableau affiche les colonnes de montants suivantes (champs API à renvoyer par le backend) :

| Colonne affichée | Champ API | Description |
|------------------|-----------|-------------|
| **Montant de base** | `amountBase` | Prix fixe (consultation, total labo/imagerie, total pharmacie) avant toute déduction. |
| **Déduction assurance** | `insuranceDeduction` | Part prise en charge par l'assurance (déduite du montant de base). |
| **Déduction remise** | `discountDeduction` | Part déduite au titre de la remise. |
| **Montant payé** | `amount` | Montant effectivement payé par le patient (après déduction assurance puis remise). |

Relation : `amountBase - insuranceDeduction - discountDeduction ≈ amount`.

Les exports Excel (réception, labo/imagerie, pharmacie) doivent inclure ces colonnes pour cohérence avec l'écran.
