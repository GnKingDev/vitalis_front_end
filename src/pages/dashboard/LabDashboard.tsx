import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TestTube2,
  Clock,
  Activity,
  FileCheck,
  ArrowRight,
  User,
  Printer,
} from 'lucide-react';
import {
  mockPatients,
  mockLabRequests,
  mockUsers,
} from '@/data/mockData';
import { Link } from 'react-router-dom';

const LabDashboard: React.FC = () => {
  const { user } = useAuth();

  // Filter lab requests by status
  const pendingRequests = mockLabRequests.filter(r => r.status === 'assigned' || r.status === 'paid');
  const inProgressRequests = mockLabRequests.filter(r => r.status === 'in_progress');
  const completedToday = mockLabRequests.filter(
    r => r.status === 'result_ready' || r.status === 'sent_to_doctor'
  );

  const getPatient = (patientId: string) => mockPatients.find(p => p.id === patientId);
  const getDoctor = (doctorId: string) => mockUsers.find(u => u.id === doctorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratoire"
        description="Gestion des examens et résultats"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Examens en attente"
          value={pendingRequests.length}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="En cours d'analyse"
          value={inProgressRequests.length}
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="Résultats prêts"
          value={completedToday.length}
          icon={FileCheck}
          variant="success"
        />
        <StatsCard
          title="Total aujourd'hui"
          value={mockLabRequests.length}
          icon={TestTube2}
          variant="default"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Examens en attente
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab/pending" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun examen en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => {
                  const patient = getPatient(request.patientId);
                  const doctor = getDoctor(request.doctorId);
                  return (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient?.vitalisId} • Prescrit par {doctor?.name}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {request.exams.map((exam) => (
                          <Badge key={exam.id} variant="outline" className="text-xs">
                            {exam.name}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" className="w-full">
                        Commencer l'analyse
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-info" />
              En cours d'analyse
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab/in-progress" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {inProgressRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun examen en cours</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inProgressRequests.map((request) => {
                  const patient = getPatient(request.patientId);
                  return (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg bg-info/5 border border-info/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient?.vitalisId}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {request.exams.map((exam) => (
                          <Badge key={exam.id} variant="outline" className="text-xs">
                            {exam.name}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Saisir résultats
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed results */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-success" />
              Résultats prêts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab/results" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {completedToday.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun résultat disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Examens</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médecin</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedToday.map((request) => {
                      const patient = getPatient(request.patientId);
                      const doctor = getDoctor(request.doctorId);
                      return (
                        <tr key={request.id} className="border-b hover:bg-secondary/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-success" />
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
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {request.exams.slice(0, 2).map((exam) => (
                                <Badge key={exam.id} variant="outline" className="text-xs">
                                  {exam.name.substring(0, 15)}...
                                </Badge>
                              ))}
                              {request.exams.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{request.exams.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {doctor?.name}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline">
                                <Printer className="h-4 w-4" />
                              </Button>
                              {request.status === 'result_ready' && (
                                <Button size="sm">
                                  Envoyer au médecin
                                </Button>
                              )}
                            </div>
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

export default LabDashboard;
