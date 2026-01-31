import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  User,
  Activity,
  Thermometer,
  Heart,
  Scale,
  Ruler,
  FileText,
  TestTube2,
  Pill,
  Save,
  Printer,
  Send,
} from 'lucide-react';
import {
  mockPatients,
  mockConsultations,
  labExamsCatalog,
} from '@/data/mockData';

const ConsultationPage: React.FC = () => {
  const [selectedPatient] = useState(mockPatients[0]);
  const [consultation] = useState(mockConsultations[0]);
  const [activeTab, setActiveTab] = useState('vitals');

  // Vitals form
  const [vitals, setVitals] = useState({
    temperature: consultation.vitals?.temperature?.toString() || '',
    bloodPressure: consultation.vitals?.bloodPressure || '',
    heartRate: consultation.vitals?.heartRate?.toString() || '',
    weight: consultation.vitals?.weight?.toString() || '',
    height: consultation.vitals?.height?.toString() || '',
  });

  // Consultation form
  const [consultForm, setConsultForm] = useState({
    symptoms: consultation.symptoms || '',
    diagnosis: consultation.diagnosis || '',
    notes: consultation.notes || '',
  });

  // Lab request
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medication: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' },
  ]);

  const handleSaveVitals = () => {
    toast.success('Constantes enregistrées');
  };

  const handleSaveConsultation = () => {
    toast.success('Consultation enregistrée');
  };

  const handleLabRequest = () => {
    if (selectedExams.length === 0) {
      toast.error('Sélectionnez au moins un examen');
      return;
    }
    toast.success('Demande d\'examens envoyée à l\'accueil', {
      description: `${selectedExams.length} examen(s) demandé(s)`,
    });
  };

  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medication: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' },
    ]);
  };

  const handleSavePrescription = () => {
    toast.success('Ordonnance enregistrée');
  };

  const handleSendToPharmacy = () => {
    toast.success('Ordonnance envoyée à la pharmacie');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultation"
        description="Fiche de consultation patient"
      />

      {/* Patient info header */}
      <Card className="border-2 border-primary/20">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="font-mono">
                    {selectedPatient.vitalisId}
                  </Badge>
                  <span>•</span>
                  <span>{selectedPatient.gender === 'M' ? 'Homme' : 'Femme'}</span>
                  <span>•</span>
                  <span>{selectedPatient.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedPatient.bloodType && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  {selectedPatient.bloodType}
                </Badge>
              )}
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  Allergies: {selectedPatient.allergies.join(', ')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Constantes</span>
          </TabsTrigger>
          <TabsTrigger value="consultation" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="lab" className="gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="hidden sm:inline">Labo</span>
          </TabsTrigger>
          <TabsTrigger value="prescription" className="gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Ordonnance</span>
          </TabsTrigger>
        </TabsList>

        {/* Vitals Tab */}
        <TabsContent value="vitals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Constantes vitales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-destructive" />
                    Température (°C)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-destructive" />
                    Tension artérielle
                  </Label>
                  <Input
                    placeholder="120/80"
                    value={vitals.bloodPressure}
                    onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Fréquence cardiaque (bpm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="72"
                    value={vitals.heartRate}
                    onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-info" />
                    Poids (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-info" />
                    Taille (cm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="170"
                    value={vitals.height}
                    onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                  />
                </div>
              </div>
              <Button className="mt-6 gap-2" onClick={handleSaveVitals}>
                <Save className="h-4 w-4" />
                Enregistrer les constantes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultation Tab */}
        <TabsContent value="consultation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Fiche de consultation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Symptômes / Motif de consultation</Label>
                <Textarea
                  placeholder="Décrivez les symptômes du patient..."
                  rows={3}
                  value={consultForm.symptoms}
                  onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Diagnostic</Label>
                <Textarea
                  placeholder="Diagnostic établi..."
                  rows={3}
                  value={consultForm.diagnosis}
                  onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes / Observations</Label>
                <Textarea
                  placeholder="Notes complémentaires..."
                  rows={3}
                  value={consultForm.notes}
                  onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
                />
              </div>
              <Button className="gap-2" onClick={handleSaveConsultation}>
                <Save className="h-4 w-4" />
                Enregistrer la consultation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lab Tab */}
        <TabsContent value="lab" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-warning" />
                Demande d'examens de laboratoire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {labExamsCatalog.map((exam) => (
                  <label
                    key={exam.id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedExams.includes(exam.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300"
                        checked={selectedExams.includes(exam.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExams([...selectedExams, exam.id]);
                          } else {
                            setSelectedExams(selectedExams.filter((id) => id !== exam.id));
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium text-sm">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">{exam.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {exam.price.toLocaleString()} F
                    </span>
                  </label>
                ))}
              </div>

              {selectedExams.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">
                      {labExamsCatalog
                        .filter((e) => selectedExams.includes(e.id))
                        .reduce((sum, e) => sum + e.price, 0)
                        .toLocaleString()}{' '}
                      FCFA
                    </span>
                  </div>
                  <Button className="w-full gap-2" onClick={handleLabRequest}>
                    <Send className="h-4 w-4" />
                    Envoyer la demande (paiement à l'accueil)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription Tab */}
        <TabsContent value="prescription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Ordonnance médicale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionItems.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-secondary/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Médicament</Label>
                        <Input
                          placeholder="Nom du médicament"
                          value={item.medication}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[index].medication = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Dosage</Label>
                        <Input
                          placeholder="500mg"
                          value={item.dosage}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[index].dosage = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fréquence</Label>
                        <Input
                          placeholder="3 fois/jour"
                          value={item.frequency}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[index].frequency = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Durée</Label>
                        <Input
                          placeholder="7 jours"
                          value={item.duration}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[index].duration = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantité</Label>
                        <Input
                          type="number"
                          placeholder="21"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[index].quantity = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Instructions</Label>
                        <Input
                          placeholder="Après les repas"
                          value={item.instructions}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[index].instructions = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddPrescriptionItem}
              >
                + Ajouter un médicament
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleSavePrescription}>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
                <Button className="flex-1 gap-2" onClick={handleSendToPharmacy}>
                  <Send className="h-4 w-4" />
                  Envoyer à la pharmacie
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsultationPage;
