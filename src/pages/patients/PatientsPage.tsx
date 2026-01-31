import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PatientTimeline } from '@/components/shared/PatientTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  User,
  Phone,
  Calendar,
  MapPin,
  Clock,
  FileText,
  Activity,
  TestTube2,
  Pill,
  X,
} from 'lucide-react';
import {
  mockPatients,
  mockConsultations,
  mockLabRequests,
  mockPrescriptions,
  mockUsers,
  getPatientTimeline,
} from '@/data/mockData';

const PatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = mockPatients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.vitalisId.toLowerCase().includes(query) ||
      patient.phone.includes(query)
    );
  });

  const getPatientConsultations = (patientId: string) =>
    mockConsultations.filter((c) => c.patientId === patientId);

  const getPatientLabRequests = (patientId: string) =>
    mockLabRequests.filter((l) => l.patientId === patientId);

  const getPatientPrescriptions = (patientId: string) =>
    mockPrescriptions.filter((p) => p.patientId === patientId);

  const getDoctorName = (doctorId: string) =>
    mockUsers.find((u) => u.id === doctorId)?.name || 'Inconnu';

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const selectedPatientData = selectedPatient
    ? mockPatients.find((p) => p.id === selectedPatient)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dossiers patients"
        description="Consultez l'historique complet des patients"
      />

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, nom ou téléphone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <Card
            key={patient.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedPatient(patient.id)}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-primary">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <Badge variant="outline" className="font-mono text-xs mt-1">
                    {patient.vitalisId}
                  </Badge>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {patient.gender === 'M' ? 'H' : 'F'}, {calculateAge(patient.dateOfBirth)} ans
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">Aucun patient trouvé</p>
        </div>
      )}

      {/* Patient detail modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedPatientData && (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {selectedPatientData.firstName[0]}{selectedPatientData.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <span>
                      {selectedPatientData.firstName} {selectedPatientData.lastName}
                    </span>
                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                      {selectedPatientData.vitalisId}
                    </Badge>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedPatientData && (
            <div className="space-y-6">
              {/* Patient info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sexe</p>
                    <p className="text-sm font-medium">
                      {selectedPatientData.gender === 'M' ? 'Masculin' : 'Féminin'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Âge</p>
                    <p className="text-sm font-medium">
                      {calculateAge(selectedPatientData.dateOfBirth)} ans
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-sm font-medium">{selectedPatientData.phone}</p>
                  </div>
                </div>
                {selectedPatientData.bloodType && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Groupe sanguin</p>
                      <p className="text-sm font-medium">{selectedPatientData.bloodType}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for history */}
              <Tabs defaultValue="timeline">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="timeline" className="gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Parcours</span>
                  </TabsTrigger>
                  <TabsTrigger value="consultations" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Consultations</span>
                  </TabsTrigger>
                  <TabsTrigger value="lab" className="gap-1">
                    <TestTube2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Labo</span>
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="gap-1">
                    <Pill className="h-4 w-4" />
                    <span className="hidden sm:inline">Ordonnances</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Historique du parcours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PatientTimeline
                        events={getPatientTimeline(selectedPatientData.id)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="consultations" className="mt-4">
                  <div className="space-y-3">
                    {getPatientConsultations(selectedPatientData.id).map((consultation) => (
                      <Card key={consultation.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                {getDoctorName(consultation.doctorId)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(consultation.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <StatusBadge status={consultation.status} />
                          </div>
                          {consultation.diagnosis && (
                            <p className="text-sm mt-2 p-2 bg-secondary/50 rounded">
                              <strong>Diagnostic:</strong> {consultation.diagnosis}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {getPatientConsultations(selectedPatientData.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucune consultation
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="lab" className="mt-4">
                  <div className="space-y-3">
                    {getPatientLabRequests(selectedPatientData.id).map((request) => (
                      <Card key={request.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                {request.exams.map((e) => e.name).join(', ')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <StatusBadge status={request.status} />
                          </div>
                          {request.results && request.results.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {request.results.map((result, i) => (
                                <div
                                  key={i}
                                  className="p-2 bg-success/5 rounded text-sm"
                                >
                                  <p className="font-medium">{result.examName}</p>
                                  <p>{result.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {getPatientLabRequests(selectedPatientData.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun examen de laboratoire
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-4">
                  <div className="space-y-3">
                    {getPatientPrescriptions(selectedPatientData.id).map((prescription) => (
                      <Card key={prescription.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                {getDoctorName(prescription.doctorId)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <StatusBadge status={prescription.status} />
                          </div>
                          <div className="mt-3 space-y-1">
                            {prescription.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Pill className="h-3 w-3 text-muted-foreground" />
                                <span>{item.medicationName}</span>
                                <span className="text-muted-foreground">
                                  - {item.dosage}, {item.frequency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {getPatientPrescriptions(selectedPatientData.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucune ordonnance
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsPage;
