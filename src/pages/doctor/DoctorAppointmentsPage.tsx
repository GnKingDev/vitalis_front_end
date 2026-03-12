import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, User, Loader2 } from 'lucide-react';
import { getDoctorAppointments } from '@/services/api/appointmentsService';

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

const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDoctorAppointments({
          date: dateFilter || undefined,
          limit: 100,
        });
        const list = res?.data?.appointments ?? (Array.isArray(res?.data) ? res.data : []);
        setAppointments(list);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des rendez-vous');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [dateFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes rendez-vous"
        description="Rendez-vous qui vous sont attribués"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Choisir la date"
              />
            </div>
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
            <div className="py-12 text-center text-muted-foreground">Aucun rendez-vous pour cette date</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-secondary/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & heure</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointmentsPage;
