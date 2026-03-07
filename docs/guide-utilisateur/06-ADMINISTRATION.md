# 6. Administration

Ce chapitre décrit les écrans réservés au rôle **Administrateur** (menu **Administration**).

---

## 6.1 Utilisateurs

**Menu** : **Administration** → **Utilisateurs**  
**URL** : `/admin/users`

### Objectif

Gérer les **comptes utilisateurs** de la plateforme : créer, modifier, suspendre, réactiver, supprimer.

### Éléments

- **Filtres** : Recherche par nom/email, filtre par rôle (Admin, Accueil, Médecin, Laboratoire, Pharmacie).
- **Tableau** : Nom, email, rôle, statut (actif / suspendu), date de création, actions.

### Actions

- **Ajouter un utilisateur** : Bouton qui ouvre une modal. Renseigner nom, email, mot de passe, rôle. Valider. L’utilisateur peut se connecter avec ces identifiants. Option « Changer le mot de passe à la première connexion » selon la configuration.
- **Modifier** : Changer nom, email, rôle ou mot de passe.
- **Suspendre** : Désactiver le compte ; l’utilisateur ne peut plus se connecter.
- **Réactiver** : Réactiver un compte suspendu.
- **Supprimer** : Supprimer définitivement le compte (avec confirmation).

---

## 6.2 Statistiques

**Menu** : **Administration** → **Statistiques**  
**URL** : `/admin/stats`

### Objectif

Consulter des **tableaux de bord et indicateurs** : nombre de patients, consultations, revenus, activité labo/imagerie, pharmacie, etc. (selon les écrans implémentés).

### Contenu typique

- Cartes ou graphiques : chiffres du jour, de la semaine, du mois.
- Filtres par période.
- Export possible (si disponible).

---

## 6.3 Tests labo et imagerie

**Menu** : **Administration** → **Tests Labo et Imagerie**  
**URL** : `/admin/tests`

### Objectif

Gérer le **catalogue des examens** proposés en laboratoire et en imagerie : nom, type (lab / imagerie), prix, etc.

### Actions

- **Liste** : Tous les tests avec nom, type, prix.
- **Ajouter un test** : Nom, type (Laboratoire / Imagerie), prix (GNF), éventuellement catégorie.
- **Modifier** : Éditer nom, type, prix.
- **Supprimer** : Retirer un test du catalogue (avec vérification des demandes existantes selon les règles métier).

---

## 6.4 Gestion des lits

**Menu** : **Administration** → **Gestion des lits**  
**URL** : `/admin/beds`

### Objectif

Gérer les **lits** (chambres) disponibles pour l’hospitalisation ou l’accueil des patients.

### Actions

- **Liste des lits** : Numéro ou identifiant, type (si applicable), statut (disponible / occupé).
- **Ajouter un lit** : Créer un nouveau lit.
- **Modifier** : Changer le type ou les informations du lit.
- **Supprimer** : Retirer un lit (si aucun patient ne l’occupe).

L’accueil peut utiliser cette liste lors de l’enregistrement d’un patient pour assigner un lit (voir 2.2).

---

## 6.5 Prix de consultation

**Menu** : **Administration** → **Prix de consultation**  
**URL** : `/admin/consultation-price`

### Objectif

Définir le **tarif de la consultation** utilisé par défaut lors de l’enregistrement d’un patient et pour les calculs (assurance, remise).

### Actions

- **Voir le prix actuel** : Affichage du prix en vigueur (GNF).
- **Modifier le prix** : Saisir le nouveau montant et enregistrer. L’historique des changements peut être affiché (si implémenté).

---

## 6.6 Sociétés d’assurance

**Menu** : **Administration** → **Sociétés d'assurance**  
**URL** : `/admin/insurance-establishments`

### Objectif

Gérer les **établissements d’assurance** (ex. SLP, AXA) utilisés dans les filtres et lors de la saisie de l’assurance patient (enregistrement, paiements).

### Actions

- **Liste** : Nom, code, statut (actif / inactif).
- **Ajouter** : Nom, code. L’établissement apparaît dans les listes déroulantes « Établissement d’assurance » et dans le filtre Assureur.
- **Modifier** : Changer nom, code, statut.
- **Supprimer** ou **Désactiver** : Retirer ou désactiver une société (avec vérification des patients assurés selon les règles métier).

---

## 6.7 Numéros Lab

**Menu** : **Administration** → **Numéros Lab**  
**URL** : `/admin/lab-numbers`

### Objectif

Gérer les **numéros de laboratoire** (identifiants des techniciens ou des postes) utilisés pour signer ou identifier les résultats (labo / imagerie).

### Actions

- **Liste** : Numéro, utilisateur associé (si applicable), statut.
- **Créer** : Associer un numéro à un technicien ou un poste.
- **Assigner** / **Modifier** : Changer l’assignation.
- **Supprimer** : Retirer un numéro (selon les règles métier).

---

## 6.8 Raccourcis Administration

Sous le menu **Administration**, l’administrateur a aussi accès à :

- **Paiements pharmacie** : Lien vers `/pharmacy/payments` (voir 5.4).
- **Paiement labo et imagerie** : Lien vers `/reception/lab-payments` (voir 2.4).

Cela permet d’accéder rapidement à ces écrans sans passer par les menus Réception ou Pharmacie.
