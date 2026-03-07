# 4. Laboratoire et imagerie

Ce chapitre concerne le rôle **Laboratoire** (et **Administrateur** pour les mêmes écrans). Les techniciens labo gèrent les **demandes laboratoire** et les **demandes imagerie** (selon les droits et l’organisation).

---

## 4.1 Demandes laboratoire

**Menu** : **Demandes laboratoire**  
**URL** : `/lab/requests`

### Objectif

Voir les **demandes d’examens de laboratoire** envoyées par les médecins et déjà payées (et éventuellement assignées au labo). Traiter les demandes : les prendre en charge, saisir les résultats, valider et envoyer.

### Éléments de l’écran

- **Filtres** : Statut (en attente, en cours, terminé), date, recherche patient, etc.
- **Liste des demandes** : Pour chaque demande – patient, examens demandés, statut, date, technicien assigné (si applicable).
- **Pagination** si nécessaire.

### Actions sur une demande

- **Voir / Ouvrir** : Accéder à la **page de détail de la demande** (`/lab/requests/:id`).
- Sur la page de détail :
  - Consulter les examens demandés et les informations patient.
  - **Prendre en charge** ou **Démarrer** : Passer la demande en « en cours ».
  - **Saisir les résultats** : Pour chaque examen, renseigner les paramètres (nom, valeur, unité, valeurs de référence, statut normal/hors norme). Notes du technicien possibles.
  - **Valider** : Valider les résultats (après contrôle).
  - **Envoyer** : Marquer comme terminé et notifier le médecin / rendre le résultat visible côté médecin.
  - **Imprimer / Générer PDF** : Générer le rapport PDF du résultat laboratoire (design type laboratoire).

---

## 4.2 Demandes imagerie

**Menu** : **Demandes imagerie**  
**URL** : `/lab/imaging-requests`

### Objectif

Même logique que les demandes **laboratoire**, mais pour les **examens d’imagerie** (radiologie, échographie, etc.).

### Différences principales

- Les « résultats » sont souvent un **compte-rendu texte** (et éventuellement des champs structurés) plutôt que des tableaux de valeurs.
- Sur la page de détail : saisie du compte-rendu, validation, envoi.
- **Générer PDF** : Rapport d’imagerie (design type imagerie).

---

## 4.3 Workflow résumé

1. **Accueil** : Le patient paie la demande labo/imagerie (écran Paiement labo et imagerie) ; la demande peut être assignée à un technicien.
2. **Labo** : Le technicien voit la demande dans « Demandes laboratoire » ou « Demandes imagerie », l’ouvre, saisit les résultats (ou le compte-rendu), valide et envoie.
3. **Médecin** : Voit le résultat dans « Résultats labo et imagerie » et peut l’ouvrir et imprimer le PDF.
