import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  User,
  Clock,
  Check,
} from 'lucide-react';
import {
  mockPatients,
  mockUsers,
  mockPayments,
} from '@/data/mockData';

const AssignDoctor: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Get patients with paid consultation but not yet assigned
  const paidPatients = mockPatients.filter((patient) => {
    const hasPayment = mockPayments.some(
      (p) => p.patientId === patient.id && p.type === 'consultation' && p.status === 'paid'
    );
    return hasPayment;
  });

  const doctors = mockUsers.filter((u) => u.role === 'doctor');

  const filteredPatients = paidPatients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.vitalisId.toLowerCase().includes(query)
    );
  });

  const handleAssign = () => {
    if (!selectedDoctor || !selectedPatient) {
      toast.error('Veuillez sélectionner un médecin');
      return;
    }

    const patient = mockPatients.find((p) => p.id === selectedPatient);
    const doctor = doctors.find((d) => d.id === selectedDoctor);

    toast.success(`Patient assigné à ${doctor?.name}`, {
      description: `${patient?.firstName} ${patient?.lastName} (${patient?.vitalisId})`,
    });

    setAssignDialogOpen(false);
    setSelectedPatient(null);
    setSelectedDoctor('');
  };

  const openAssignDialog = (patientId: string) => {
    setSelectedPatient(patientId);
    setAssignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignation médecin"
        description="Assigner les patients ayant payé à un médecin"
      />

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un patient (ID, nom)..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Doctors overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.department}</p>
                </div>
                <Badge variant="outline" className="badge-completed">
                  Disponible
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patients list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Patients en attente d'assignation
            <Badge variant="outline" className="ml-2">
              {filteredPatients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun patient en attente d'assignation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="font-mono text-xs">
                          {patient.vitalisId}
                        </Badge>
                        <span>•</span>
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="paid" />
                    <Button size="sm" onClick={() => openAssignDialog(patient.id)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assigner
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner à un médecin</DialogTitle>
            <DialogDescription>
              Sélectionnez le médecin pour ce patient
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient info */}
              <div className="p-4 rounded-lg bg-secondary/50">
                {(() => {
                  const patient = mockPatients.find((p) => p.id === selectedPatient);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {patient?.firstName[0]}{patient?.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient?.vitalisId}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Doctor selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Médecin</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{doctor.name}</span>
                          <span className="text-muted-foreground">
                            ({doctor.department})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAssignDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleAssign}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignDoctor;
