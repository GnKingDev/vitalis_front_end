# 5. Pharmacie

Ce chapitre décrit les écrans pour le rôle **Pharmacie** (et **Administrateur**).

---

## 5.1 Stock produits

**Menu** : **Pharmacie** → **Stock produits**  
**URL** : `/pharmacy/stock`

### Objectif

Gérer le **stock des produits** de la pharmacie : consulter la liste, ajouter un produit, modifier (prix, stock, seuil d’alerte), et éventuellement désactiver ou supprimer.

### Éléments de l’écran

- **Recherche** : Par nom de produit.
- **Filtre par catégorie** : Liste déroulante des catégories (si configurées).
- **Tableau** : Colonnes typiques – Nom, Catégorie, Prix, Stock, Seuil minimum, Unité, Statut (en stock / stock faible / rupture), Actions.
- **Pagination** si la liste est longue.

### Actions

- **Ajouter un produit** : Bouton qui ouvre une modal ou un formulaire. Renseigner : nom, catégorie, prix, stock initial, seuil minimum (alerte), unité. Valider pour créer le produit.
- **Modifier** : Sur une ligne, bouton **Modifier** (ou icône crayon) pour éditer le produit (nom, catégorie, prix, stock, seuil, unité). Enregistrer les modifications.
- **Voir alertes** : Lien vers la page **Alertes stock** pour les produits en dessous du seuil ou en rupture.

---

## 5.2 Alertes stock

**Menu** : **Pharmacie** → **Alertes stock**  
**URL** : `/pharmacy/alerts`

### Objectif

Voir les **produits en stock faible** ou en **rupture de stock** (stock &lt; seuil minimum ou = 0).

### Éléments

- Liste ou cartes des produits concernés avec nom, stock actuel, seuil, éventuellement tendance.
- Lien vers la fiche produit ou la page Stock pour ajuster les quantités ou les seuils.

---

## 5.3 Catégories

**Menu** : **Pharmacie** → **Catégories**  
**URL** : `/pharmacy/categories`

### Objectif

Gérer les **catégories de produits** (ex. Antalgiques, Antibiotiques) utilisées pour le stock et les filtres.

### Actions

- **Liste des catégories** : Nom, éventuellement nombre de produits.
- **Ajouter une catégorie** : Saisir le nom (et champs additionnels si prévus), valider.
- **Modifier** : Éditer le nom (ou autres champs) d’une catégorie.
- **Supprimer** : Supprimer une catégorie (avec vérification qu’aucun produit ne l’utilise, selon les règles métier).

---

## 5.4 Paiements pharmacie

**Menu** : **Paiements Pharmacie**  
**URL** : `/pharmacy/payments`

### Objectif

Enregistrer les **ventes** (paiements) de produits aux patients et consulter l’historique des paiements. Les paiements peuvent inclure **assurance** et **remise**.

### Créer un paiement

1. Cliquer sur **Créer un Paiement** (ou « Créer un paiement »).
2. Une **modal Créer un nouveau paiement** s’ouvre.
3. **ID Client (optionnel)** : Saisir l’ID Vitalis pour rechercher le patient. Si trouvé, le patient s’affiche (et assurance/remise peuvent être pré-remplies).
4. **Sélectionner des produits** : Rechercher un produit par nom, cliquer pour l’ajouter au panier. Ajuster les **quantités** (+ / -). Répéter pour tous les produits de la vente.
5. **Montant** : Le montant de base et le **montant à payer** (après déductions) s’affichent.
6. **Patient assuré** : Activer le switch si le patient est assuré, puis renseigner établissement d’assurance, couverture (%), numéro d’identifiant assureur. Le montant à payer se met à jour.
7. **Bénéficie d’une remise** : Activer le switch et saisir le pourcentage de remise si applicable. Le montant à payer se met à jour.
8. **Méthode de paiement** : Espèces ou Orange Money. Si Orange Money, saisir la **référence** de transaction.
9. Cliquer sur **Créer le paiement**. Le paiement est enregistré, le stock des produits est décrementé, et la modal se ferme.

### Liste des paiements

- **Filtres** : Date, statut (payé / en attente), recherche, assurance, assureur, remise.
- **Tableau** : Date, patient, montant, méthode, assurance/remise, statut, etc.
- **Exporter en Excel** : Téléchargement des paiements selon les filtres appliqués.
- **Appliquer les filtres** / **Réinitialiser** : Comme sur les autres écrans de liste.

---

## 5.5 Ordonnances (pharmacie)

**Menu** : **Pharmacie** → selon la structure (par ex. **Ordonnances** ou depuis un sous-menu).  
**URL** : `/pharmacy/prescriptions` et `/pharmacy/prescriptions/:id`

### Objectif

Voir les **ordonnances** envoyées par les médecins et **traiter** une ordonnance (préparer les produits, enregistrer le paiement).

### Liste des ordonnances

- Liste des ordonnances reçues (patient, médecin, date, statut).
- **Ouvrir** une ordonnance pour voir le détail (médicaments, posologie, etc.).

### Détail d’une ordonnance

- Affichage des médicaments prescrits (nom, dosage, fréquence, durée, quantité, instructions).
- **Paiement** : Bouton pour enregistrer le paiement de la vente correspondant à cette ordonnance (même logique que « Créer un paiement » : sélection des produits correspondants, assurance, remise, méthode de paiement). Une modal Paiement puis une confirmation permettent de finaliser.
