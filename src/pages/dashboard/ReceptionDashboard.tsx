import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReceptionStats, getReceptionPatients, getReceptionAssignments } from '@/services/api/receptionService';
import { getPayments } from '@/services/api/paymentsService';
import { toast } from 'sonner';

const ReceptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientsToday: 0,
    paymentsToday: 0,
    pendingAssignments: 0,
  });
  const [patientsToday, setPatientsToday] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Charger les statistiques
        const statsData = await getReceptionStats(today);
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        }

        // Charger les patients d'aujourd'hui
        const patientsResponse = await getReceptionPatients({ date: today, limit: 4 });
        if (patientsResponse.success && patientsResponse.data) {
          setPatientsToday(patientsResponse.data.patients || patientsResponse.data || []);
        }

        // Charger les assignations en attente
        const assignmentsResponse = await getReceptionAssignments({ status: 'assigned' });
        if (assignmentsResponse.success && assignmentsResponse.data) {
          // S'assurer que c'est toujours un tableau
          const assignmentsData = assignmentsResponse.data.assignments || assignmentsResponse.data;
          setPendingAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        } else {
          setPendingAssignments([]);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les données du dashboard',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Patients enregistrés"
          value={stats.patientsToday || patientsToday.length}
          subtitle="Aujourd'hui"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Paiements reçus"
          value={stats.paymentsToday || 0}
          icon={CreditCard}
          variant="success"
        />
        <StatsCard
          title="En attente d'assignation"
          value={stats.pendingAssignments || pendingAssignments.length}
          icon={UserCheck}
          variant="default"
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
                  const patient = assignment.patient || {};
                  const doctor = assignment.doctor || {};
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
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.vitalisId}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{doctor.name || 'Non assigné'}</p>
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
              {patientsToday.slice(0, 4).map((patient) => (
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
      </div>
    </div>
  );
};

export default ReceptionDashboard;
