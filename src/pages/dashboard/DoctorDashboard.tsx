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
  Stethoscope,
  TestTube2,
  FileText,
  Clock,
  ArrowRight,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import {
  mockPatients,
  mockConsultations,
  mockLabRequests,
  mockDoctorAssignments,
  getPatientsByDoctor,
} from '@/data/mockData';
import { Link } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Get assigned patients for this doctor
  const assignedData = getPatientsByDoctor(user?.id || 'user-3');
  const waitingPatients = assignedData.filter(d => d.assignment.status === 'assigned');
  const inConsultation = assignedData.filter(d => d.assignment.status === 'in_consultation');

  // Lab results ready for review
  const labResultsReady = mockLabRequests.filter(
    r => r.doctorId === (user?.id || 'user-3') && r.status === 'result_ready'
  );

  // Today's consultations
  const todayConsultations = mockConsultations.filter(
    c => c.doctorId === (user?.id || 'user-3') && c.createdAt.startsWith('2026-01')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenue, ${user?.name || 'Dr.'}`}
        description="Vos patients et consultations du jour"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Patients en attente"
          value={waitingPatients.length}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="En consultation"
          value={inConsultation.length}
          icon={Stethoscope}
          variant="primary"
        />
        <StatsCard
          title="Résultats labo à voir"
          value={labResultsReady.length}
          icon={TestTube2}
          variant="success"
        />
        <StatsCard
          title="Consultations aujourd'hui"
          value={todayConsultations.length}
          icon={ClipboardList}
          variant="default"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Patients assignés
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/patients" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {assignedData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun patient assigné pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedData.map(({ assignment, patient, consultation }) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {patient?.firstName[0]}{patient?.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="font-mono text-xs">
                            {patient?.vitalisId}
                          </Badge>
                          <span>•</span>
                          <span>{patient?.gender === 'M' ? 'Homme' : 'Femme'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={assignment.status === 'assigned' ? 'waiting' : 'in_progress'} />
                      <Button size="sm" asChild>
                        <Link to={`/doctor/consultation?patient=${patient?.id}`}>
                          {assignment.status === 'assigned' ? 'Commencer' : 'Continuer'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lab results ready */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TestTube2 className="h-5 w-5 text-success" />
              Résultats labo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {labResultsReady.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun résultat en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {labResultsReady.map((request) => {
                  const patient = mockPatients.find(p => p.id === request.patientId);
                  return (
                    <div
                      key={request.id}
                      className="p-3 rounded-lg bg-success/5 border border-success/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <Badge className="badge-completed text-xs">Prêt</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {request.exams.map(e => e.name).join(', ')}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Voir résultats
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
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
              <Link to="/doctor/lab-requests">
                <TestTube2 className="h-5 w-5 text-warning" />
                <span>Demande labo</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/doctor/prescriptions">
                <FileText className="h-5 w-5 text-primary" />
                <span>Ordonnance</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/patients">
                <Users className="h-5 w-5 text-info" />
                <span>Dossiers patients</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/doctor/patients">
                <ClipboardList className="h-5 w-5 text-success" />
                <span>Mes consultations</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
