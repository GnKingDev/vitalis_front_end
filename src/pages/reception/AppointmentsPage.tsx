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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  const [dateFilter, setDateFilter] = useState<string>('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<{ id: string; status: 'present' | 'absent'; patientName: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [appRes, docRes] = await Promise.all([
          getAppointments({
            page: currentPage,
            limit: itemsPerPage,
            date: dateFilter || undefined,
            doctorId: doctorFilter || undefined,
            status: statusFilter || undefined,
            search: searchQuery.trim() || undefined,
          }),
          getReceptionDoctors(),
        ]);
        const list =
          appRes?.data?.appointments ??
          (Array.isArray(appRes?.data) ? appRes.data : null) ??
          appRes?.appointments ??
          [];
        setAppointments(list);
        const pagination = (appRes as any)?.pagination ?? (appRes as any)?.data?.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages ?? 1);
          setTotalItems(pagination.totalItems ?? list.length);
        } else {
          setTotalPages(1);
          setTotalItems(list.length);
        }
        if (docRes?.data) {
          const docList = Array.isArray(docRes.data) ? docRes.data : docRes.data.doctors || [];
          setDoctors(docList);
        }
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors du chargement des rendez-vous');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentPage, dateFilter, doctorFilter, statusFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
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
    setConfirmStatus(null);
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
              placeholder="Toutes les dates"
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
                              onClick={() =>
                                setConfirmStatus({
                                  id: a.id,
                                  status: 'present',
                                  patientName: a.patient ? `${a.patient.firstName || ''} ${a.patient.lastName || ''}`.trim() || 'Ce patient' : 'Ce patient',
                                })
                              }
                            >
                              {updatingId === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Présent
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive"
                              disabled={updatingId === a.id}
                              onClick={() =>
                                setConfirmStatus({
                                  id: a.id,
                                  status: 'absent',
                                  patientName: a.patient ? `${a.patient.firstName || ''} ${a.patient.lastName || ''}`.trim() || 'Ce patient' : 'Ce patient',
                                })
                              }
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
          {!isLoading && appointments.length > 0 && totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} rendez-vous
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
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

      <AlertDialog open={!!confirmStatus} onOpenChange={(open) => !open && setConfirmStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmStatus?.status === 'present' ? 'Confirmer la présence' : 'Confirmer l\'absence'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmStatus?.status === 'present'
                ? `Confirmer que ${confirmStatus?.patientName || 'ce patient'} est bien présent ?`
                : `Confirmer que ${confirmStatus?.patientName || 'ce patient'} est absent ?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmStatus && handleStatus(confirmStatus.id, confirmStatus.status)}
              className={confirmStatus?.status === 'absent' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppointmentsPage;
