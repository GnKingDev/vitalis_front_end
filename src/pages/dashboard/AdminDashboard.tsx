import React, { useState, useEffect } from 'react';
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
  CreditCard,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '@/services/api/statsService';
import { getPatients } from '@/services/api/patientsService';
import { getConsultations } from '@/services/api/consultationsService';
import { getLabRequests } from '@/services/api/labService';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patientsToday: 0,
    consultationsToday: 0,
    pendingLabRequests: 0,
    revenue: 0,
  });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [activeConsultations, setActiveConsultations] = useState<any[]>([]);
  const [pendingLabs, setPendingLabs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Charger les statistiques
        const statsData = await getDashboardStats();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        }

        // Charger les patients récents
        const patientsResponse = await getPatients({ page: 1, limit: 5, date: today });
        if (patientsResponse.success && patientsResponse.data) {
          setRecentPatients(patientsResponse.data.patients || patientsResponse.data || []);
        }

        // Charger les consultations actives
        const consultationsResponse = await getConsultations({ 
          status: 'in_progress,waiting',
          date: today 
        });
        if (consultationsResponse.success && consultationsResponse.data) {
          const consultations = Array.isArray(consultationsResponse.data) 
            ? consultationsResponse.data 
            : consultationsResponse.data.consultations || [];
          setActiveConsultations(consultations);
        }

        // Charger les demandes labo en attente
        const labResponse = await getLabRequests({ 
          status: 'pending',
          date: today 
        });
        if (labResponse.success && labResponse.data) {
          const labs = Array.isArray(labResponse.data) 
            ? labResponse.data 
            : labResponse.data.requests || [];
          setPendingLabs(labs.filter((l: any) => l.status !== 'sent_to_doctor'));
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

  const getPatientName = (patient: any) => {
    if (typeof patient === 'string') {
      // Si c'est un ID, chercher dans les patients récents
      const p = recentPatients.find(pat => pat.id === patient);
      return p ? `${p.firstName} ${p.lastName}` : 'Inconnu';
    }
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
          value={stats.patientsToday || 0}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Consultations"
          value={stats.consultationsToday || 0}
          icon={Stethoscope}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Examens labo en attente"
          value={stats.pendingLabRequests || 0}
          icon={TestTube2}
          variant="warning"
        />
        <StatsCard
          title="Revenus du jour"
          value={`${(stats.revenue || 0).toLocaleString()} GNF`}
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
                      <p className="font-medium">{getPatientName(consultation.patient || consultation.patientId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.doctor?.name || consultation.doctorId || 'Non assigné'}
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
                    <p className="font-medium">{getPatientName(request.patient || request.patientId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.exams?.length || request.examIds?.length || 0} examen(s)
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;
