import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, User, Stethoscope, Loader2, Check, X, Search } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments, getAppointmentById, updateAppointmentStatus } from '@/services/api/appointmentsService';
import { getReceptionDoctors } from '@/services/api/receptionService';

const statusLabels: Record<string, string> = {
  scheduled: 'Prévu',
  present: 'Présent',
  absent: 'Absent',
  cancelled: 'Annulé',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  scheduled: 'secondary',
  present: 'default',
  absent: 'destructive',
  cancelled: 'outline',
};

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [appRes, docRes] = await Promise.all([
          getAppointments({
            date: dateFilter || undefined,
            doctorId: doctorFilter || undefined,
            status: statusFilter || undefined,
            search: searchQuery.trim() || undefined,
            limit: 100,
          }),
          getReceptionDoctors(),
        ]);
        if (appRes?.data?.appointments) setAppointments(appRes.data.appointments);
        else setAppointments([]);
        if (docRes?.data) {
          const list = Array.isArray(docRes.data) ? docRes.data : docRes.data.doctors || [];
          setDoctors(list);
        }
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des rendez-vous');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dateFilter, doctorFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    getAppointmentById(detailId)
      .then((res) => {
        if (!cancelled && res?.data) setDetail(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger le détail');
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => { cancelled = true; };
  }, [detailId]);

  const handleStatus = async (id: string, status: 'present' | 'absent') => {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      toast.success(status === 'present' ? 'Patient marqué présent' : 'Patient marqué absent');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (e: any) {
      toast.error(e?.message || 'Erreur');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rendez-vous"
        description={isAdmin ? 'Liste des rendez-vous et détail' : 'Liste des rendez-vous — marquer présence'}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <DatePicker
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Choisir la date"
            />
          </div>
          <div className="space-y-2">
            <Label>Médecin</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option value="">Tous</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="scheduled">Prévu</option>
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Recherche (patient)</Label>
            <Input
              placeholder="Nom, ID Vitalis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">Aucun rendez-vous</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médecin</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & heure</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                    {isAdmin && <th className="text-left py-3 px-4 font-medium text-muted-foreground">Détail</th>}
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-secondary/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {a.patient ? `${a.patient.firstName || ''} ${a.patient.lastName || ''}`.trim() : '–'}
                          {a.patient?.vitalisId && (
                            <Badge variant="outline" className="font-mono text-xs">{a.patient.vitalisId}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{a.doctor?.name || '–'}</td>
                      <td className="py-3 px-4 text-sm">
                        {a.appointmentAt
                          ? new Date(a.appointmentAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '–'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant[a.status] || 'outline'}>
                          {statusLabels[a.status] || a.status}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" onClick={() => setDetailId(a.id)}>
                            Voir détail
                          </Button>
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        {a.status === 'scheduled' && (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              disabled={updatingId === a.id}
                              onClick={() => handleStatus(a.id, 'present')}
                            >
                              {updatingId === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Présent
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive"
                              disabled={updatingId === a.id}
                              onClick={() => handleStatus(a.id, 'absent')}
                            >
                              <X className="h-3 w-3" />
                              Absent
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail du rendez-vous</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : detail ? (
            <div className="space-y-3 text-sm">
              <p><strong>Patient:</strong> {detail.patient ? `${detail.patient.firstName} ${detail.patient.lastName}` : '–'} ({detail.patient?.vitalisId || '–'})</p>
              <p><strong>Médecin:</strong> {detail.doctor?.name || '–'}</p>
              <p><strong>Date & heure:</strong> {detail.appointmentAt ? new Date(detail.appointmentAt).toLocaleString('fr-FR') : '–'}</p>
              <p><strong>Statut:</strong> {statusLabels[detail.status] || detail.status}</p>
              {detail.notes && <p><strong>Notes:</strong> {detail.notes}</p>}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
