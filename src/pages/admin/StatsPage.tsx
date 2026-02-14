import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Users,
  Stethoscope,
  TestTube2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  UserCheck,
  Scan,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getStatsOverview,
  getStatsPatients,
  getStatsConsultations,
  getStatsRevenue,
  getStatsLab,
  getStatsImaging,
  getStatsUsers,
} from '@/services/api/statsService';

const StatsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [stats, setStats] = useState<any>({
    patients: { total: 0, today: 0, thisMonth: 0 },
    consultations: { total: 0, today: 0, completed: 0, inProgress: 0 },
    payments: { total: 0, today: 0, revenue: { total: 0, today: 0, thisMonth: 0 }, byMethod: { cash: 0, orange_money: 0 }, byType: { consultation: 0, lab: 0, imaging: 0, pharmacy: 0 } },
    lab: { total: 0, pending: 0, completed: 0 },
    imaging: { total: 0, pending: 0, completed: 0 },
    users: { total: 0, byRole: { admin: 0, reception: 0, doctor: 0, lab: 0, pharmacy: 0 } },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const filterDate = selectedDate || today;
        
        // Utiliser getStatsOverview pour obtenir toutes les statistiques en une seule requête
        const overviewResponse = await getStatsOverview(filterDate);

        if (overviewResponse.success && overviewResponse.data) {
          const data = overviewResponse.data;
          
          // Construire l'objet stats avec les données de l'API
          const newStats: any = {
            patients: {
              total: data.patients?.total || 0,
              today: data.patients?.today || 0,
              thisMonth: data.patients?.thisMonth || 0,
            },
            consultations: {
              total: data.consultations?.total || 0,
              today: data.consultations?.today || 0,
              completed: data.consultations?.completed || 0,
              inProgress: data.consultations?.inProgress || 0,
            },
            payments: {
              total: data.payments?.total || 0,
              today: data.payments?.today || 0,
              revenue: {
                total: data.payments?.revenue?.total || 0,
                today: data.payments?.revenue?.today || 0,
                thisMonth: data.payments?.revenue?.thisMonth || 0,
              },
              byMethod: {
                cash: data.payments?.byMethod?.cash || 0,
                orange_money: data.payments?.byMethod?.orange_money || 0,
              },
              byType: {
                consultation: data.payments?.byType?.consultation || 0,
                lab: data.payments?.byType?.lab || 0,
                imaging: data.payments?.byType?.imaging || 0,
                pharmacy: data.payments?.byType?.pharmacy || 0,
              },
            },
            lab: {
              total: data.lab?.total || 0,
              pending: data.lab?.pending || 0,
              completed: data.lab?.completed || 0,
            },
            imaging: {
              total: data.imaging?.total || 0,
              pending: data.imaging?.pending || 0,
              completed: data.imaging?.completed || 0,
            },
            users: {
              total: data.users?.total || 0,
              byRole: {
                admin: data.users?.byRole?.admin || 0,
                reception: data.users?.byRole?.reception || 0,
                doctor: data.users?.byRole?.doctor || 0,
                lab: data.users?.byRole?.lab || 0,
                pharmacy: data.users?.byRole?.pharmacy || 0,
              },
            },
          };

          setStats(newStats);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des statistiques:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les statistiques',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [selectedDate, today]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Aujourd'hui";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques"
        description="Vue d'ensemble des statistiques de la clinique"
      />

      {/* Date Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="date-filter" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Filtrer par date
              </Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={today}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedDate(today)}
                disabled={selectedDate === today}
              >
                Aujourd'hui
              </Button>
              {selectedDate !== today && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(today)}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
          {selectedDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Statistiques pour le <strong>{formatDate(selectedDate)}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30 animate-spin" />
          <p className="text-lg font-medium">Chargement des statistiques...</p>
        </div>
      ) : (
        <>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Patients"
          value={stats.patients.total}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Consultations"
          value={stats.consultations.total}
          icon={Stethoscope}
          variant="success"
        />
        <StatsCard
          title="Revenus Total"
          value={`${stats.payments.revenue.total.toLocaleString()} GNF`}
          icon={DollarSign}
          variant="default"
        />
        <StatsCard
          title="Utilisateurs"
          value={stats.users.total}
          icon={UserCheck}
          variant="primary"
        />
      </div>

      {/* Selected Date Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedDate === today ? 'Patients aujourd\'hui' : `Patients le ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`}
                </p>
                <p className="text-2xl font-bold">{stats.patients.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedDate === today ? 'Consultations aujourd\'hui' : `Consultations le ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`}
                </p>
                <p className="text-2xl font-bold">{stats.consultations.today}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedDate === today ? 'Revenus aujourd\'hui' : `Revenus le ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`}
                </p>
                <p className="text-2xl font-bold text-success">
                  {(stats.payments.revenue.today || 0).toLocaleString()} GNF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedDate === today ? 'Paiements aujourd\'hui' : `Paiements le ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`}
                </p>
                <p className="text-2xl font-bold">{stats.payments.today}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statistiques Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Total patients</span>
                <span className="text-lg font-semibold">{stats.patients.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Patients aujourd'hui</span>
                <span className="text-lg font-semibold">{stats.patients.today}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Patients ce mois</span>
                <span className="text-lg font-semibold">{stats.patients.thisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultations Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Statistiques Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Total consultations</span>
                <span className="text-lg font-semibold">{stats.consultations.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Consultations terminées</span>
                <span className="text-lg font-semibold text-success">{stats.consultations.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">En cours</span>
                <span className="text-lg font-semibold text-warning">{stats.consultations.inProgress}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab & Imaging Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Examens Laboratoire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Total demandes</span>
                <span className="text-lg font-semibold">{stats.lab.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">En attente</span>
                <span className="text-lg font-semibold text-warning">{stats.lab.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Terminées</span>
                <span className="text-lg font-semibold text-success">{stats.lab.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Examens Imagerie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Total demandes</span>
                <span className="text-lg font-semibold">{stats.imaging.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">En attente</span>
                <span className="text-lg font-semibold text-warning">{stats.imaging.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Terminées</span>
                <span className="text-lg font-semibold text-success">{stats.imaging.completed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Revenus total</span>
                <span className="text-lg font-semibold text-success">
                  {(stats.payments.revenue.total || 0).toLocaleString()} GNF
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Revenus aujourd'hui</span>
                <span className="text-lg font-semibold text-success">
                  {(stats.payments.revenue.today || 0).toLocaleString()} GNF
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Revenus ce mois</span>
                <span className="text-lg font-semibold text-success">
                  {(stats.payments.revenue.thisMonth || 0).toLocaleString()} GNF
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Méthodes de Paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Espèces</span>
                <span className="text-lg font-semibold">{stats.payments.byMethod.cash}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Orange Money</span>
                <span className="text-lg font-semibold">{stats.payments.byMethod.orange_money}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Types de Paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Consultations</span>
                <span className="text-lg font-semibold">{stats.payments.byType.consultation}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Laboratoire</span>
                <span className="text-lg font-semibold">{stats.payments.byType.lab}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Imagerie</span>
                <span className="text-lg font-semibold">{stats.payments.byType.imaging}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Pharmacie</span>
                <span className="text-lg font-semibold">{stats.payments.byType.pharmacy}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Utilisateurs par Rôle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Administrateurs</span>
                <span className="text-lg font-semibold">{stats.users.byRole.admin}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Accueil</span>
                <span className="text-lg font-semibold">{stats.users.byRole.reception}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Médecins</span>
                <span className="text-lg font-semibold">{stats.users.byRole.doctor}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Laboratoire</span>
                <span className="text-lg font-semibold">{stats.users.byRole.lab}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Pharmacie</span>
                <span className="text-lg font-semibold">{stats.users.byRole.pharmacy}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
        </>
      )}
    </div>
  );
};

export default StatsPage;
