# 3. Médecin

Ce chapitre décrit les écrans et actions pour le rôle **Médecin** (et **Administrateur** pour les parties consultation et résultats).

---

## 3.1 Patients assignés

**Menu** : **Patients assignés**  
**URL** : `/doctor/patients`

### Objectif

Voir la liste des **patients assignés** au médecin connecté (dossiers de consultation actifs ou en cours).

### Éléments de l’écran

- **Filtres / recherche** : Par nom, ID Vitalis, statut du dossier (actif / terminé / archivé).
- **Liste** : Pour chaque patient – ID Vitalis, nom, prénom, statut du dossier, date, etc.
- **Pagination** si la liste est longue.

### Actions

- **Ouvrir la consultation** : Cliquer sur une ligne ou sur un bouton **Consultation** (ou « Voir ») pour accéder à la **page de consultation** du patient (voir 3.2).

---

## 3.2 Consultation (fiche patient)

**Accès** : Depuis **Patients assignés** → sélection d’un patient.  
**URL** : `/doctor/consultation?patient=...&dossier=...`

La page de consultation comporte **plusieurs onglets**. En haut : informations du patient et bouton **Retour à la liste**.

### Onglet Consultation

- **Symptômes / Motif de consultation** : Zone de texte.
- **Diagnostic** : Zone de texte.
- **Notes / Observations** : Zone de texte.
- **Boutons** :
  - **Enregistrer** : Sauvegarde la fiche de consultation (symptômes, diagnostic, notes).
  - **Terminer la consultation** : Ouvre une modal de confirmation puis clôture le dossier (statut « terminé »). À utiliser quand la consultation est finie.

### Onglet Labo

- **Historique** : Bouton **Voir l’historique** pour afficher les demandes de laboratoire déjà envoyées pour ce patient.
- **Nouvelle demande** : Liste des examens de laboratoire disponibles (cases à cocher). Sélectionner les examens, puis cliquer sur **Envoyer la demande** (ou équivalent). Une modal de confirmation demande de valider. Après validation, la demande est envoyée à l’accueil (paiement labo) puis au laboratoire.

### Onglet Imagerie

- Même principe que **Labo** : historique des demandes d’imagerie, sélection des examens d’imagerie, **Envoyer la demande** avec confirmation.

### Onglet Demande externe

- **Objectif** : Saisir des **résultats d’examens réalisés en dehors de l’établissement** (labo ou imagerie externes), les enregistrer et générer un PDF.
- **Documents enregistrés** : Liste des demandes externes déjà enregistrées ; pour chacune, bouton **Supprimer** (avec confirmation).
- **Nouveau résultat externe** :
  - **Nom de l’examen** (ex. NFS externe, Radio thorax externe).
  - **Détails / Résultats** : Zone de texte (description ou copier-coller du rapport).
- **Boutons** :
  - **Ajouter un résultat** : Ajoute un bloc nom + détails.
  - **Enregistrer** : Ouvre une modal « Enregistrer les demandes externes » ; confirmer pour enregistrer. Les nouveaux éléments apparaissent dans « Documents enregistrés ».
  - **Imprimer** : Génère et ouvre le PDF du premier document enregistré (ou message si aucun document enregistré).

### Onglet Ordonnance

- **Médicaments enregistrés** : Liste des médicaments déjà ajoutés à l’ordonnance (modification possible selon configuration).
- **Nouveaux médicaments** : Pour chaque ligne – Médicament, Dosage, Fréquence, Durée, Quantité, Instructions. Bouton **Ajouter un médicament**.
- **Boutons** :
  - **Enregistrer l’ordonnance** : Ouvre une modal de confirmation ; après validation, l’ordonnance est enregistrée.
  - **Imprimer ordonnance** : Génère et ouvre (ou télécharge) le PDF de l’ordonnance. L’ordonnance doit être enregistrée au préalable.
- **Supprimer un médicament** : Bouton poubelle sur une ligne ; une modal demande confirmation avant suppression.

### Autres éléments possibles

- **Archiver le dossier** : Bouton pour archiver le dossier (consultation en lecture seule ensuite). Une modal de confirmation peut s’afficher.

---

## 3.3 Demandes envoyées au laboratoire et imagerie

**Menu** : **Demandes envoyées au laboratoire et imagerie**  
**URL** : `/doctor/lab-requests`

### Objectif

Voir les **demandes de laboratoire et d’imagerie** créées par le médecin (ou pour ses patients), leur statut et accéder aux résultats quand ils sont disponibles.

### Actions

- Consulter la liste des demandes (patient, examens, statut, date).
- **Voir résultat** (ou équivalent) : Accès à la page de détail du résultat (voir 3.4) lorsque le laboratoire a saisi et validé les résultats.

---

## 3.4 Résultats labo et imagerie

**Menu** : **Résultats labo et imagerie**  
**URL** : `/doctor/lab-results`

### Objectif

Voir la **liste des résultats** (laboratoire et imagerie) disponibles pour les patients du médecin.

### Actions

- **Ouvrir un résultat** : Cliquer sur une ligne pour accéder à la **page de détail du résultat** (`/doctor/lab-results/:id`).
- Sur la page de détail : affichage des informations du patient, de la demande, des examens et des résultats (tableaux de valeurs pour le labo, compte-rendu pour l’imagerie). Boutons possibles : **Imprimer PDF** pour générer le rapport PDF du résultat.

---

## 3.5 Dossiers archivés

**Menu** : **Dossiers archivés**  
**URL** : `/doctor/patients?status=archived`

### Objectif

Voir les **dossiers de consultation archivés** (consultations terminées et archivées). La liste est en lecture seule ; on peut ouvrir un dossier pour consulter la fiche de consultation, les demandes, l’ordonnance, etc., sans pouvoir modifier (sauf si l’application prévoit des exceptions).
