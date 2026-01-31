import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Copy, Check, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { generateVitalisId } from '@/data/mockData';

const RegisterPatient: React.FC = () => {
  const navigate = useNavigate();
  const [generatedId] = useState(generateVitalisId());
  const [copied, setCopied] = useState(false);
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    toast.success('ID copié dans le presse-papiers');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.gender) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    toast.success(`Patient ${formData.firstName} ${formData.lastName} enregistré avec succès!`, {
      description: `ID Vitalis: ${generatedId}`,
    });
    
    // Navigate to payment
    navigate('/reception/payments');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Enregistrer un nouveau patient"
        description="Créez un dossier patient et générez son identifiant unique VITALIS"
      />

      {/* Generated ID Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <UserPlus className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Identifiant unique généré</p>
                <p className="text-2xl font-mono font-bold text-primary">{generatedId}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleCopyId} className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copier l'ID
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
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
        <Card className="mt-6">
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="sm:flex-1">
            Annuler
          </Button>
          <Button type="submit" className="sm:flex-1 gap-2">
            <UserPlus className="h-4 w-4" />
            Enregistrer le patient
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPatient;
