# Guide utilisateur – Plateforme Vitalis

## Vue d'ensemble

La plateforme **Vitalis** est une application de gestion médicale qui couvre le parcours patient de l'accueil à la pharmacie : enregistrement, paiement de la consultation, assignation à un médecin, consultation, demandes de laboratoire et d'imagerie, ordonnances et paiements pharmacie.

Ce guide décrit le fonctionnement de l'application pour chaque rôle (Accueil, Médecin, Laboratoire, Pharmacie, Administrateur). Il est conçu pour être utilisé tel quel ou transmis à un outil de conception de documents.

---

## Rôles et accès

| Rôle | Libellé dans l'application | Accès principaux |
|------|----------------------------|------------------|
| **admin** | Administrateur | Tous les menus + Administration (utilisateurs, statistiques, paramètres) |
| **reception** | Accueil | Liste des patients, Enregistrer patient, Paiements, Assignation médecin |
| **doctor** | Médecin | Patients assignés, Consultation, Demandes labo/imagerie, Résultats, Ordonnances, Dossiers archivés |
| **lab** | Laboratoire | Demandes laboratoire, Demandes imagerie |
| **pharmacy** | Pharmacie | Stock produits, Alertes, Catégories, Paiements pharmacie |

L'**Administrateur** voit en plus les entrées : Paiements pharmacie, Paiement labo et imagerie, et tout le sous-menu Administration.

---

## Structure du guide

Le guide est découpé en fichiers par domaine :

| Fichier | Contenu |
|---------|--------|
| **01-CONNEXION-ET-DASHBOARD.md** | Connexion, changement de mot de passe, tableau de bord |
| **02-ACCUEIL-RECEPTION.md** | Liste des patients du jour, enregistrement patient, tous les paiements, paiement labo/imagerie, assignation médecin |
| **03-MEDECIN.md** | Patients assignés, consultation (fiche, labo, imagerie, demande externe, ordonnance), résultats, dossiers archivés |
| **04-LABORATOIRE-ET-IMAGERIE.md** | Demandes laboratoire, demandes imagerie, saisie des résultats, validation, envoi |
| **05-PHARMACIE.md** | Stock produits, alertes stock, catégories, paiements pharmacie, ordonnances reçues |
| **06-ADMINISTRATION.md** | Utilisateurs, statistiques, tests labo/imagerie, lits, prix de consultation, sociétés d'assurance, numéros lab |

---

## Parcours patient simplifié

1. **Accueil** : Le patient arrive → Enregistrement (nouveau ou existant) avec paiement consultation (espèces/Orange Money, assurance, remise) → Assignation à un médecin.
2. **Médecin** : Consultation (symptômes, diagnostic) → Éventuellement demandes labo/imagerie ou demande externe → Ordonnance.
3. **Labo/Imagerie** : Si demandes envoyées → Paiement labo/imagerie (accueil) → Réalisation des examens (lab) → Saisie et validation des résultats.
4. **Pharmacie** : Ordonnance reçue → Vente de produits (paiement avec assurance/remise si applicable).

---

## Conventions du document

- **Bouton** : action déclenchée par un clic sur un bouton de l'interface.
- **Filtre** : critère de recherche ou de liste (date, mois, type, assurance, etc.).
- **Modal / Dialogue** : fenêtre qui s'ouvre au-dessus de la page pour saisie ou confirmation.
- Les **étapes** sont numérotées lorsque l'ordre est important.
