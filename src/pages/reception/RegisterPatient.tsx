import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Stepper, Step } from '@/components/shared/Stepper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  UserPlus,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Stethoscope,
  CheckCircle2,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { generateVitalisId, mockUsers } from '@/data/mockData';

const steps: Step[] = [
  { id: 1, title: 'Création', description: 'Infos patient' },
  { id: 2, title: 'ID Vitalis', description: 'Confirmation' },
  { id: 3, title: 'Paiement', description: 'Consultation' },
  { id: 4, title: 'Médecin', description: 'Assignation' },
];

const doctors = mockUsers.filter((u) => u.role === 'doctor');

const RegisterPatient: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
  });

  // Payment data
  const [paymentData, setPaymentData] = useState({
    method: 'cash' as 'cash' | 'orange_money',
    amount: 15000,
    reference: '',
  });

  // Assignment data
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyId = () => {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      setCopied(true);
      toast.success('ID copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.gender) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      // Generate ID when moving from step 1 to step 2
      const newId = generateVitalisId();
      setGeneratedId(newId);
      toast.success('Patient créé avec succès !', {
        description: `Identifiant: ${newId}`,
      });
    }

    if (currentStep === 3) {
      if (paymentData.method === 'orange_money' && !paymentData.reference) {
        toast.error('Veuillez entrer la référence Orange Money');
        return;
      }
      toast.success('Paiement validé !');
    }

    if (currentStep === 4) {
      if (!selectedDoctor) {
        toast.error('Veuillez sélectionner un médecin');
        return;
      }
      const doctor = doctors.find((d) => d.id === selectedDoctor);
      toast.success('Processus terminé !', {
        description: `Patient assigné à ${doctor?.name}`,
      });
      // Navigate to dashboard after completion
      navigate('/reception');
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Enregistrer un nouveau patient"
        description="Suivez les étapes pour créer un dossier patient complet"
      />

      {/* Stepper */}
      <Card>
        <CardContent className="py-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step 1: Patient Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Entrez le nom"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Prénom(s) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Entrez le prénom"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                </div>
              </div>

              {/* Birth and gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Sexe <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+225 07 XX XX XX XX"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Adresse
                </Label>
                <Textarea
                  id="address"
                  placeholder="Adresse complète du patient"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations médicales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Groupe sanguin</Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => handleChange('bloodType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                  <Input
                    id="emergencyContact"
                    placeholder="Nom et téléphone"
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Allergies connues
                </Label>
                <Textarea
                  id="allergies"
                  placeholder="Listez les allergies connues (médicaments, aliments, etc.)"
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: ID Generated */}
      {currentStep === 2 && generatedId && (
        <Card className="border-2 border-primary/30">
          <CardContent className="py-10">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Patient créé avec succès !
                </h2>
                <p className="text-muted-foreground">
                  {formData.firstName} {formData.lastName}
                </p>
              </div>

              {/* ID Display */}
              <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-2">Identifiant unique VITALIS</p>
                <p className="text-3xl font-mono font-bold text-primary">{generatedId}</p>
              </div>

              <Button variant="outline" onClick={handleCopyId} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    ID Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier l'identifiant
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                Cet identifiant sera utilisé pour tous les documents et dossiers du patient.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Paiement de la consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient info summary */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-muted-foreground font-mono">{generatedId}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {paymentData.amount.toLocaleString()} FCFA
                </p>
                <p className="text-sm text-muted-foreground">Consultation</p>
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-3">
              <Label>Mode de paiement</Label>
              <RadioGroup
                value={paymentData.method}
                onValueChange={(value: 'cash' | 'orange_money') =>
                  setPaymentData((prev) => ({ ...prev, method: value }))
                }
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                  <Label
                    htmlFor="cash"
                    className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Espèces</p>
                      <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="orange_money" id="orange_money" className="peer sr-only" />
                  <Label
                    htmlFor="orange_money"
                    className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">Orange Money</p>
                      <p className="text-sm text-muted-foreground">Paiement mobile</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Orange Money reference */}
            {paymentData.method === 'orange_money' && (
              <div className="space-y-2">
                <Label htmlFor="reference">
                  Référence transaction <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reference"
                  placeholder="Ex: OM-XXXXXXX"
                  value={paymentData.reference}
                  onChange={(e) =>
                    setPaymentData((prev) => ({ ...prev, reference: e.target.value }))
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Doctor Assignment */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Assigner un médecin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient info summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">{generatedId}</p>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Paiement validé</span>
                </div>
              </div>
            </div>

            {/* Doctor selection */}
            <div className="space-y-3">
              <Label>Sélectionner un médecin</Label>
              <RadioGroup
                value={selectedDoctor}
                onValueChange={setSelectedDoctor}
                className="grid gap-3"
              >
                {doctors.map((doctor) => (
                  <div key={doctor.id}>
                    <RadioGroupItem value={doctor.id} id={doctor.id} className="peer sr-only" />
                    <Label
                      htmlFor={doctor.id}
                      className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.department}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                          Disponible
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={handleNextStep} className="gap-2">
          {currentStep === 4 ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Terminer
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RegisterPatient;
