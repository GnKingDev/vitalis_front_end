import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CreditCard,
  UserCheck,
  Clock,
  Plus,
  ArrowRight,
  Phone,
  Calendar,
} from 'lucide-react';
import {
  mockPatients,
  mockPayments,
  mockDoctorAssignments,
  mockUsers,
} from '@/data/mockData';
import { Link } from 'react-router-dom';

const ReceptionDashboard: React.FC = () => {
  const { user } = useAuth();

  // Today's data
  const today = new Date().toISOString().split('T')[0];
  const patientsToday = mockPatients.filter(p => p.createdAt.startsWith('2026-01-31'));
  const paymentsToday = mockPayments.filter(p => p.createdAt.startsWith('2026-01-31'));
  
  const pendingAssignments = mockDoctorAssignments.filter(d => d.status === 'assigned');

  const totalRevenue = paymentsToday
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const getPatient = (patientId: string) => mockPatients.find(p => p.id === patientId);
  const getDoctor = (doctorId: string) => mockUsers.find(u => u.id === doctorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accueil - Réception"
        description="Gestion des patients et des paiements"
      >
        <Button asChild>
          <Link to="/reception/register">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau patient
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Patients enregistrés"
          value={patientsToday.length}
          subtitle="Aujourd'hui"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Paiements reçus"
          value={paymentsToday.filter(p => p.status === 'paid').length}
          icon={CreditCard}
          variant="success"
        />
        <StatsCard
          title="En attente d'assignation"
          value={pendingAssignments.length}
          icon={UserCheck}
          variant="default"
        />
        <StatsCard
          title="Revenus du jour"
          value={`${totalRevenue.toLocaleString()} F`}
          icon={CreditCard}
          variant="success"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue / Waiting patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              File d'attente
            </CardTitle>
            <Badge variant="outline" className="badge-pending">
              {pendingAssignments.length} patient(s)
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun patient en attente</p>
                </div>
              ) : (
                pendingAssignments.map((assignment, index) => {
                  const patient = getPatient(assignment.patientId);
                  const doctor = getDoctor(assignment.doctorId);
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning font-bold">
                          {index + 1}
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
                      <div className="text-right">
                        <p className="text-sm font-medium">{doctor?.name}</p>
                        <StatusBadge status="waiting" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Patients récents
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reception/today" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPatients.slice(0, 4).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-mono text-xs">
                      {patient.vitalisId}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's paid consultations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-success" />
              Paiements du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsToday.filter(p => p.status === 'paid').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun paiement aujourd'hui</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID Vitalis</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Montant</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsToday.filter(p => p.status === 'paid').map((payment) => {
                      const patient = getPatient(payment.patientId);
                      return (
                        <tr key={payment.id} className="border-b hover:bg-secondary/30">
                          <td className="py-3 px-4">
                            <p className="font-medium">
                              {patient?.firstName} {patient?.lastName}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="font-mono text-xs">
                              {patient?.vitalisId}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {payment.type === 'consultation' ? 'Consultation' : 
                               payment.type === 'lab' ? 'Laboratoire' : 'Pharmacie'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-medium text-success">
                            {payment.amount.toLocaleString()} FCFA
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={payment.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
