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
  Stethoscope,
  TestTube2,
  FileText,
  Clock,
  ArrowRight,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { getDoctorDossiers } from '@/services/api/doctorService';
import { getConsultations } from '@/services/api/consultationsService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignedData, setAssignedData] = useState<any[]>([]);
  const [todayConsultations, setTodayConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Charger les dossiers assignés
        const dossiersResponse = await getDoctorDossiers({ 
          status: 'active',
          limit: 10 
        });
        if (dossiersResponse.success && dossiersResponse.data) {
          const dossiers = Array.isArray(dossiersResponse.data) 
            ? dossiersResponse.data 
            : dossiersResponse.data.dossiers || [];
          console.log('Dossiers chargés:', dossiers);
          setAssignedData(dossiers);
        } else {
          console.error('Erreur réponse dossiers:', dossiersResponse);
        }

        // Charger les consultations d'aujourd'hui
        const consultationsResponse = await getConsultations({ 
          doctorId: user?.id,
          date: today 
        });
        if (consultationsResponse.success && consultationsResponse.data) {
          const consultations = Array.isArray(consultationsResponse.data) 
            ? consultationsResponse.data 
            : consultationsResponse.data.consultations || [];
          console.log('Consultations chargées:', consultations);
          setTodayConsultations(consultations);
        } else {
          console.error('Erreur réponse consultations:', consultationsResponse);
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

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const waitingPatients = assignedData.filter((d: any) => {
    const status = d.status || d.assignment?.status;
    return status === 'assigned' || status === 'active';
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenue, ${user?.name || 'Dr.'}`}
        description="Vos patients et consultations du jour"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Patients en attente"
          value={waitingPatients.length}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Consultations aujourd'hui"
          value={todayConsultations.length}
          icon={ClipboardList}
          variant="default"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Patients queue */}
        <Card>
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
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Chargement...</p>
              </div>
            ) : assignedData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun patient assigné pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedData.map((dossier: any) => {
                  const patient = dossier.patient || dossier;
                  const assignment = dossier.assignment || {};
                  const status = assignment.status || dossier.status || 'assigned';
                  
                  if (!patient || !patient.id) {
                    console.warn('Dossier sans patient valide:', dossier);
                    return null;
                  }
                  
                  return (
                    <div
                      key={dossier.id || patient.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {patient.firstName?.[0] || '?'}{patient.lastName?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient.firstName || 'N/A'} {patient.lastName || ''}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-mono text-xs">
                              {patient.vitalisId || 'N/A'}
                            </Badge>
                            {patient.gender && (
                              <>
                                <span>•</span>
                                <span>{patient.gender === 'M' ? 'Homme' : 'Femme'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={status === 'assigned' || status === 'active' ? 'waiting' : 'in_progress'} />
                        <Button size="sm" asChild>
                          <Link to={`/doctor/consultation?patient=${patient.id}&dossier=${dossier.id}`}>
                            {status === 'assigned' || status === 'active' ? 'Commencer' : 'Continuer'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
