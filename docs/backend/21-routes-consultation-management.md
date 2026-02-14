# Routes Backend - Gestion des Consultations

## Vue d'ensemble

Ce document décrit la logique de gestion des consultations dans le système VITALIS. Une consultation est créée **une seule fois** pour un patient lors de sa première consultation, puis peut être **mise à jour** lors des consultations suivantes.

## Principe fondamental

### Création unique

- Une consultation est créée **une seule fois** pour un patient lors de sa première consultation médicale.
- La consultation est liée à un **dossier de consultation** (`ConsultationDossier`) qui peut être actif ou archivé.
- Une fois créée, la consultation peut être **mise à jour** mais jamais recréée.

### Mise à jour

- Les données de la consultation (symptoms, diagnosis, notes, vitals) peuvent être mises à jour à tout moment.
- La mise à jour se fait via la même route que la création, mais le backend doit détecter si une consultation existe déjà.

## Route principale

### `POST /api/v1/doctor/consultations`

Crée une nouvelle consultation ou met à jour une consultation existante.

#### Corps de la requête

```json
{
  "patientId": "uuid (requis)",
  "symptoms": "Décrivez les symptômes du patient...",
  "diagnosis": "Diagnostic établi...",
  "notes": "Notes / Observations...",
  "dossierId": "uuid (optionnel)"
}
```

#### Logique backend

```javascript
// 1. Vérifier si une consultation existe déjà pour ce patient et ce dossier
const existingConsultation = await Consultation.findOne({
  where: {
    patientId: req.body.patientId,
    dossierId: req.body.dossierId || null,
    status: { [Op.in]: ['in_progress', 'completed'] }
  }
});

if (existingConsultation) {
  // MISE À JOUR : Consultation existe déjà
  const updatedConsultation = await existingConsultation.update({
    symptoms: req.body.symptoms || existingConsultation.symptoms,
    diagnosis: req.body.diagnosis || existingConsultation.diagnosis,
    notes: req.body.notes || existingConsultation.notes,
    vitals: req.body.vitals || existingConsultation.vitals,
    updatedAt: new Date()
  });
  
  return res.json({
    success: true,
    message: "Consultation mise à jour avec succès",
    data: {
      consultation: updatedConsultation,
      isUpdate: true
    }
  });
} else {
  // CRÉATION : Nouvelle consultation
  const newConsultation = await Consultation.create({
    patientId: req.body.patientId,
    doctorId: req.user.id, // Médecin connecté
    dossierId: req.body.dossierId || null,
    status: 'in_progress',
    symptoms: req.body.symptoms || null,
    diagnosis: req.body.diagnosis || null,
    notes: req.body.notes || null,
    vitals: req.body.vitals || {}
  });
  
  // Si dossierId est fourni, mettre à jour le dossier
  if (req.body.dossierId) {
    await ConsultationDossier.update(
      { consultationId: newConsultation.id },
      { where: { id: req.body.dossierId } }
    );
  }
  
  return res.json({
    success: true,
    message: "Consultation créée avec succès",
    data: {
      consultation: newConsultation,
      isUpdate: false
    }
  });
}
```

#### Réponse succès (200 OK) - Création

```json
{
  "success": true,
  "message": "Consultation créée avec succès",
  "data": {
    "consultation": {
      "id": "uuid-de-la-consultation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "dossierId": "uuid-du-dossier",
      "status": "in_progress",
      "symptoms": "Décrivez les symptômes du patient...",
      "diagnosis": "Diagnostic établi...",
      "notes": "Notes / Observations...",
      "vitals": {},
      "createdAt": "2026-02-13T14:02:25.000Z",
      "updatedAt": "2026-02-13T14:02:25.000Z"
    },
    "isUpdate": false
  }
}
```

#### Réponse succès (200 OK) - Mise à jour

```json
{
  "success": true,
  "message": "Consultation mise à jour avec succès",
  "data": {
    "consultation": {
      "id": "uuid-de-la-consultation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "dossierId": "uuid-du-dossier",
      "status": "in_progress",
      "symptoms": "Symptômes mis à jour...",
      "diagnosis": "Diagnostic mis à jour...",
      "notes": "Notes mises à jour...",
      "vitals": {},
      "createdAt": "2026-02-13T14:02:25.000Z",
      "updatedAt": "2026-02-13T14:05:30.000Z"
    },
    "isUpdate": true
  }
}
```

## Route GET Dossier avec Consultation incluse

### `GET /api/v1/doctor/dossiers/:id`

Récupère un dossier de consultation avec toutes ses relations, **y compris la consultation**.

#### Réponse succès (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-du-dossier",
    "patient": {
      "id": "uuid-du-patient",
      "vitalisId": "VTL-2026-00001",
      "firstName": "Lamah",
      "lastName": "Monsieur",
      "dateOfBirth": "1999-12-10",
      "gender": "M",
      "phone": "+22461289454",
      "email": null,
      "address": "sonfonia",
      "emergencyContact": null,
      "createdAt": "2026-02-13T12:01:09.000Z",
      "updatedAt": "2026-02-13T12:01:09.000Z"
    },
    "assignment": {
      "id": "uuid-de-l-assignation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "paymentId": "uuid-du-paiement",
      "status": "assigned",
      "createdBy": "uuid-du-createur",
      "createdAt": "2026-02-13T12:01:36.000Z",
      "updatedAt": "2026-02-13T12:01:36.000Z",
      "doctor": {
        "id": "uuid-du-medecin",
        "name": "gobou",
        "email": "gobou@vitali-clinique.com"
      }
    },
    "consultation": {
      "id": "uuid-de-la-consultation",
      "patientId": "uuid-du-patient",
      "doctorId": "uuid-du-medecin",
      "status": "in_progress",
      "symptoms": "hello",
      "vitals": {},
      "diagnosis": "hello",
      "notes": "hello",
      "createdAt": "2026-02-13T14:02:25.000Z",
      "updatedAt": "2026-02-13T14:02:25.000Z"
    },
    "labRequests": [
      {
        "id": "uuid-de-la-demande",
        "patientId": "uuid-du-patient",
        "consultationId": null,
        "doctorId": "uuid-du-medecin",
        "labTechnicianId": null,
        "status": "pending",
        "totalAmount": "50000.00",
        "paymentId": null,
        "createdAt": "2026-02-13T13:33:18.000Z",
        "updatedAt": "2026-02-13T13:33:18.000Z",
        "exams": [
          {
            "id": "uuid-de-l-examen",
            "labRequestId": "uuid-de-la-demande",
            "labExamId": "uuid-de-l-examen-lab",
            "price": "50000.00",
            "createdAt": "2026-02-13T13:33:18.000Z",
            "updatedAt": "2026-02-13T13:33:18.000Z",
            "labExam": {
              "id": "uuid-de-l-examen-lab",
              "name": "NFS",
              "category": "Laboratoire",
              "price": "50000.00",
              "description": null,
              "isActive": true,
              "createdAt": "2026-02-13T09:42:48.000Z",
              "updatedAt": "2026-02-13T09:42:48.000Z"
            }
          }
        ]
      }
    ],
    "imagingRequests": [],
    "prescriptions": [],
    "customItems": [],
    "status": "active",
    "createdAt": "2026-02-13T12:01:36.000Z"
  }
}
```

#### Points importants

1. **Consultation incluse** : La consultation doit être **toujours incluse** dans la réponse du dossier si elle existe, via la relation Sequelize.
2. **Pas besoin d'appel séparé** : Le frontend n'a pas besoin de faire un appel séparé à `GET /api/v1/consultations/:id` si la consultation est déjà dans la réponse du dossier.
3. **Consultation null** : Si aucune consultation n'existe encore, le champ `consultation` doit être `null` (pas absent).

## Implémentation Sequelize

### Modèle ConsultationDossier

```javascript
ConsultationDossier.hasOne(Consultation, {
  foreignKey: 'dossierId',
  as: 'consultation',
  onDelete: 'SET NULL'
});
```

### Requête Sequelize pour GET /doctor/dossiers/:id

```javascript
const dossier = await ConsultationDossier.findByPk(dossierId, {
  include: [
    {
      model: Patient,
      as: 'patient',
      attributes: ['id', 'vitalisId', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'email', 'address', 'emergencyContact', 'createdAt', 'updatedAt']
    },
    {
      model: DoctorAssignment,
      as: 'assignment',
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email']
        }
      ]
    },
    {
      model: Consultation,
      as: 'consultation', // IMPORTANT: inclure la consultation
      required: false // LEFT JOIN pour inclure même si pas de consultation
    },
    {
      model: LabRequest,
      as: 'labRequests',
      include: [
        {
          model: LabRequestExam,
          as: 'exams',
          include: [
            {
              model: LabExam,
              as: 'labExam',
              attributes: ['id', 'name', 'category', 'price', 'description', 'isActive', 'createdAt', 'updatedAt']
            }
          ]
        }
      ]
    },
    {
      model: ImagingRequest,
      as: 'imagingRequests',
      required: false
    },
    {
      model: Prescription,
      as: 'prescriptions',
      required: false
    },
    {
      model: CustomItem,
      as: 'customItems',
      required: false
    }
  ]
});
```

## Cas d'usage

### 1. Première consultation

**Scénario** : Un patient vient pour la première fois et le médecin commence une consultation.

1. Le médecin remplit le formulaire (symptoms, diagnosis, notes).
2. Le frontend envoie `POST /api/v1/doctor/consultations` avec `patientId` et `dossierId`.
3. Le backend **crée** une nouvelle consultation.
4. Le backend retourne la consultation créée avec `isUpdate: false`.

### 2. Mise à jour de consultation

**Scénario** : Le médecin revient sur une consultation existante pour la modifier.

1. Le frontend charge le dossier via `GET /api/v1/doctor/dossiers/:id`.
2. La consultation est incluse dans la réponse.
3. Le frontend pré-remplit les champs avec les données de la consultation.
4. Le médecin modifie les données.
5. Le frontend envoie `POST /api/v1/doctor/consultations` avec les mêmes `patientId` et `dossierId`.
6. Le backend **détecte** qu'une consultation existe déjà et la **met à jour**.
7. Le backend retourne la consultation mise à jour avec `isUpdate: true`.

### 3. Consultation après rechargement de page

**Scénario** : Le médecin recharge la page de consultation.

1. Le frontend charge le dossier via `GET /api/v1/doctor/dossiers/:id`.
2. La consultation est incluse dans la réponse.
3. Le frontend utilise directement `response.data.consultation` pour pré-remplir le formulaire.
4. **Pas besoin** d'appel séparé à `GET /api/v1/consultations/:id`.

## Avantages de cette approche

1. **Performance** : Un seul appel API pour charger toutes les données du dossier, y compris la consultation.
2. **Simplicité** : Le frontend n'a pas besoin de gérer plusieurs appels API séquentiels.
3. **Cohérence** : Les données sont toujours synchronisées car elles viennent d'une seule source.
4. **Efficacité** : Réduction du nombre de requêtes HTTP.

## Validation et sécurité

### Vérifications à effectuer

1. **Patient existe** : Vérifier que le `patientId` existe et appartient à un patient valide.
2. **Dossier existe** : Si `dossierId` est fourni, vérifier qu'il existe et est actif.
3. **Médecin autorisé** : Vérifier que le médecin connecté est autorisé à consulter ce patient (via l'assignation).
4. **Données valides** : Valider les champs `symptoms`, `diagnosis`, `notes` (longueur max, caractères autorisés).

### Exemple de validation

```javascript
// Validation avec Joi
const consultationSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  dossierId: Joi.string().uuid().optional(),
  symptoms: Joi.string().max(5000).optional().allow(null, ''),
  diagnosis: Joi.string().max(5000).optional().allow(null, ''),
  notes: Joi.string().max(5000).optional().allow(null, ''),
  vitals: Joi.object().optional()
});

const { error, value } = consultationSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    success: false,
    message: "Données invalides",
    errors: error.details.map(d => ({
      field: d.path.join('.'),
      message: d.message
    }))
  });
}
```

## Notes importantes

1. **Création unique** : Une consultation ne doit être créée qu'une seule fois par patient/dossier. Les appels suivants doivent mettre à jour la consultation existante.

2. **Inclusion dans la réponse** : La consultation doit **toujours** être incluse dans la réponse de `GET /api/v1/doctor/dossiers/:id` si elle existe, pour éviter les appels API supplémentaires.

3. **Statut de la consultation** : Une consultation peut avoir les statuts suivants :
   - `in_progress` : Consultation en cours
   - `completed` : Consultation terminée
   - `cancelled` : Consultation annulée

4. **Relation avec le dossier** : La consultation est liée au dossier via `dossierId`. Si le dossier est archivé, la consultation reste accessible mais ne peut plus être modifiée.

5. **Historique** : Toutes les mises à jour de la consultation doivent être tracées via le champ `updatedAt`. Pour un historique complet, considérer l'ajout d'une table d'audit.

## Exemple de route Express.js complète

```javascript
router.post('/doctor/consultations', authenticateToken, async (req, res) => {
  try {
    // Validation
    const { error, value } = consultationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: error.details
      });
    }
    
    const { patientId, dossierId, symptoms, diagnosis, notes, vitals } = value;
    const doctorId = req.user.id;
    
    // Vérifier que le patient existe
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient introuvable"
      });
    }
    
    // Vérifier que le médecin est autorisé (via assignation)
    if (dossierId) {
      const dossier = await ConsultationDossier.findByPk(dossierId, {
        include: [{ model: DoctorAssignment, as: 'assignment' }]
      });
      
      if (!dossier || dossier.assignment.doctorId !== doctorId) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à consulter ce patient"
        });
      }
    }
    
    // Chercher une consultation existante
    const whereClause = {
      patientId,
      status: { [Op.in]: ['in_progress', 'completed'] }
    };
    
    if (dossierId) {
      whereClause.dossierId = dossierId;
    } else {
      whereClause.dossierId = { [Op.is]: null };
    }
    
    const existingConsultation = await Consultation.findOne({
      where: whereClause
    });
    
    if (existingConsultation) {
      // MISE À JOUR
      await existingConsultation.update({
        symptoms: symptoms || existingConsultation.symptoms,
        diagnosis: diagnosis || existingConsultation.diagnosis,
        notes: notes || existingConsultation.notes,
        vitals: vitals || existingConsultation.vitals,
        updatedAt: new Date()
      });
      
      // Recharger pour avoir les données à jour
      await existingConsultation.reload();
      
      return res.json({
        success: true,
        message: "Consultation mise à jour avec succès",
        data: {
          consultation: existingConsultation,
          isUpdate: true
        }
      });
    } else {
      // CRÉATION
      const newConsultation = await Consultation.create({
        patientId,
        doctorId,
        dossierId: dossierId || null,
        status: 'in_progress',
        symptoms: symptoms || null,
        diagnosis: diagnosis || null,
        notes: notes || null,
        vitals: vitals || {}
      });
      
      // Mettre à jour le dossier si fourni
      if (dossierId) {
        await ConsultationDossier.update(
          { consultationId: newConsultation.id },
          { where: { id: dossierId } }
        );
      }
      
      return res.json({
        success: true,
        message: "Consultation créée avec succès",
        data: {
          consultation: newConsultation,
          isUpdate: false
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de la consultation:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la gestion de la consultation"
    });
  }
});
```
