# 2. Accueil / Réception

Ce chapitre concerne les utilisateurs **Accueil** (réception) et **Administrateur** pour les écrans d’accueil.

---

## 2.1 Liste des patients

**Menu** : **Liste des patients**  
**URL** : `/reception/today`

### Objectif

Voir les patients enregistrés pour une date donnée (par défaut : aujourd’hui).

### Éléments de l’écran

- **Sélecteur de date** : Choisir la date pour afficher les patients de ce jour.
- **Recherche** : Par nom, ID Vitalis ou autre critère selon l’implémentation.
- **Tableau** : Liste des patients avec au minimum – ID Vitalis, nom, prénom, statut de paiement, assignation médecin, assurance/remise (si affiché).
- **Pagination** : Si la liste est longue.
- **Bouton Exporter** : Export Excel des patients de la date (si disponible).

### Actions

- **Voir détail** : Cliquer sur une ligne ou un bouton (œil / Détail) pour ouvrir une modal ou une page avec les informations du patient.
- **Appliquer les filtres** : Après avoir choisi la date et éventuellement la recherche, appliquer pour mettre à jour la liste.

---

## 2.2 Enregistrer un patient

**Menu** : **Enregistrer patient**  
**URL** : `/reception/register`

### Objectif

Enregistrer un **nouveau** patient ou un **existant** (déjà en base), enregistrer le paiement de la consultation et, pour un nouveau, l’assigner à un médecin.

### Cas 1 : Patient existant

1. Choisir l’onglet ou l’option **Patient existant**.
2. Saisir l’**ID Vitalis** (ou recherche par nom) et valider la recherche.
3. Sélectionner le patient dans les résultats.
4. **Paiement** : Saisir le montant (ou laisser le montant consultation par défaut), choisir la méthode (Espèces / Orange Money), et si besoin :
   - **Patient assuré** : Activer l’option, choisir l’établissement d’assurance, le pourcentage de couverture, le numéro d’identifiant assureur.
   - **Remise** : Activer et saisir le pourcentage de remise.
5. Pour Orange Money : Saisir la **référence** de transaction.
6. Valider le paiement (avec éventuelle confirmation dans une modal).
7. **Assignation** : Choisir un médecin et confirmer l’assignation. Un **dossier de consultation** est créé pour ce patient.

### Cas 2 : Nouveau patient

1. Choisir l’onglet ou l’option **Nouveau patient**.
2. **Étape Paiement** : Saisir le montant, la méthode (Espèces / Orange Money), et optionnellement assurance et remise comme ci-dessus. Référence obligatoire si Orange Money.
3. Valider le paiement. L’application génère un **ID Vitalis** et peut l’afficher (à communiquer au patient).
4. **Étape Informations patient** : Renseigner nom, prénom, date de naissance, genre, téléphone, email, adresse, contact d’urgence, etc. Optionnellement lit, assurance, remise.
5. Enregistrer le patient.
6. **Étape Assignation** : Choisir un médecin et confirmer. Un dossier de consultation est créé.

### Boutons / actions courantes

- **Annuler** : Quitter sans enregistrer.
- **Étape suivante / Précédente** : Navigation dans le stepper (Paiement → ID Vitalis / Infos → Médecin).
- **Copier l’ID Vitalis** : Copie dans le presse-papier pour l’afficher ou le donner au patient.

---

## 2.3 Tous les paiements

**Menu** : **Tous les Paiements**  
**URL** : `/reception/payments`

### Objectif

Consulter et filtrer tous les paiements (consultation, labo, imagerie ; hors pharmacie), et exporter la liste en Excel.

### Filtres

- **Mois** : Liste déroulante (ex. « février 2025 », « tous les mois »). Filtre sur tout le mois.
- **Date** : Sélection d’un jour précis (calendrier). Incompatible avec le filtre Mois : choisir l’un ou l’autre.
- **Type de paiement** : Tous / Consultation / Laboratoire / Imagerie / Pharmacie (si proposé).
- **Assurance** : Tous / Assurés / Non assurés.
- **Assureur** : Visible si « Assurés » est sélectionné ; liste des sociétés d’assurance (ex. SLP).
- **Remise** : Tous / Avec remise / Sans remise.
- **Recherche** : Par numéro client (ID Vitalis) ou autre champ selon l’écran.

Après avoir réglé les filtres, cliquer sur **Appliquer les filtres** (ou équivalent) pour mettre à jour le tableau.

### Tableau

Colonnes typiques : Date, Patient (ID Vitalis, nom), Type, Montant, Méthode (Espèces / Orange Money), Assurance / Remise, Statut, etc.

### Actions

- **Exporter en Excel** : Téléchargement d’un fichier Excel avec les paiements correspondant aux filtres appliqués.
- **Réinitialiser les filtres** : Remettre tous les filtres à « Tous » ou valeur par défaut.

---

## 2.4 Paiement labo et imagerie

**Menu** : **Paiement labo et imagerie**  
**URL** : `/reception/lab-payments`

### Objectif

Voir les **demandes de laboratoire ou d’imagerie** en attente de paiement, enregistrer le paiement et éventuellement assigner la demande à un technicien labo.

### Éléments de l’écran

- **Filtres** : Date, statut (en attente / payé), recherche, assurance, remise, assureur (si assurés).
- **Liste des demandes** : Pour chaque demande – patient, examens demandés, montant, statut (en attente / payé).
- **Bouton Payer** (ou équivalent) sur chaque demande non payée.

### Enregistrer un paiement

1. Cliquer sur **Payer** pour la demande concernée.
2. Une **modal Paiement** s’ouvre.
3. **Assurance** : Activer « Patient assuré » si besoin, puis remplir établissement, couverture (%), numéro d’identifiant assureur.
4. **Remise** : Activer « Bénéficie d’une remise » et saisir le pourcentage si besoin.
5. **Mode de paiement** : Espèces ou Orange Money ; si Orange Money, saisir la référence.
6. **Assignation au labo** (si proposé) : Cocher pour assigner à un technicien et choisir le technicien dans la liste.
7. Confirmer (éventuellement une deuxième modal « Confirmer le paiement »). Le paiement est enregistré, la demande passe en « payée » et peut être assignée au labo.

---

## 2.5 Assignation médecin

**Menu** : **Assignation médecin**  
**URL** : `/reception/assign`

### Objectif

Assigner un **médecin** à un patient qui a déjà été enregistré et a payé sa consultation (sans avoir été assigné lors de l’enregistrement), ou modifier l’assignation.

### Déroulement

1. **Liste des patients** : Affichage des patients éligibles (avec paiement, sans médecin assigné ou liste configurée par l’application). Utiliser la **recherche** (ID Vitalis, nom) pour trouver un patient.
2. **Sélectionner un médecin** : Dans une liste déroulante ou une liste de cartes, choisir le médecin à assigner.
3. **Assigner** : Cliquer sur le bouton **Assigner** (ou « Assigner à [nom du médecin] ») pour le patient sélectionné.
4. **Confirmation** : Une modal peut demander de confirmer l’assignation. Valider. Un **dossier de consultation** est créé ou mis à jour pour ce patient avec ce médecin.

### Autres actions

- **Pagination** : Si la liste des patients est paginée.
- **Filtres** : Selon l’écran (date, statut d’assignation, etc.).
