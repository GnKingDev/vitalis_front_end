import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Stethoscope,
  TestTube2,
  Pill,
  CreditCard,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  getDashboardStats,
  mockPatients,
  mockConsultations,
  mockLabRequests,
  mockPrescriptions,
  mockUsers,
} from '@/data/mockData';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = getDashboardStats();

  const recentPatients = mockPatients.slice(0, 5);
  const activeConsultations = mockConsultations.filter(c => c.status === 'in_progress' || c.status === 'waiting');
  const pendingLabs = mockLabRequests.filter(l => l.status !== 'sent_to_doctor');
  const pendingPrescriptions = mockPrescriptions.filter(p => p.status !== 'delivered');

  const getDoctorName = (doctorId: string) => {
    return mockUsers.find(u => u.id === doctorId)?.name || 'Non assigné';
  };

  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Inconnu';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user?.name.split(' ')[0] || 'Admin'}`}
        description="Voici un aperçu de l'activité de la clinique aujourd'hui"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Patients aujourd'hui"
          value={stats.patientsToday}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Consultations"
          value={stats.consultationsToday}
          icon={Stethoscope}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Examens labo en attente"
          value={stats.pendingLabRequests}
          icon={TestTube2}
          variant="warning"
        />
        <StatsCard
          title="Revenus du jour"
          value={`${stats.revenue.toLocaleString()} FCFA`}
          icon={CreditCard}
          variant="default"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Patients récents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reception/today" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">{patient.vitalisId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active consultations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Consultations actives</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/patients" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeConsultations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune consultation active
                </p>
              ) : (
                activeConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">{getPatientName(consultation.patientId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getDoctorName(consultation.doctorId)}
                      </p>
                    </div>
                    <StatusBadge status={consultation.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending lab requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Examens labo</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab/pending" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLabs.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{getPatientName(request.patientId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.exams.length} examen(s)
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Ordonnances</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pharmacy/prescriptions" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{getPatientName(prescription.patientId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.items.length} médicament(s)
                    </p>
                  </div>
                  <StatusBadge status={prescription.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/reception/register">
                <Users className="h-5 w-5 text-primary" />
                <span>Nouveau patient</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/reception/payments">
                <CreditCard className="h-5 w-5 text-success" />
                <span>Encaisser</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/doctor/consultation">
                <Stethoscope className="h-5 w-5 text-info" />
                <span>Consultation</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/pharmacy/stock">
                <Pill className="h-5 w-5 text-warning" />
                <span>Stock pharmacie</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
