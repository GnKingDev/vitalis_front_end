import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { Search, Archive, User, FileText, Stethoscope, Loader2, FolderOpen, Calendar, Clock } from 'lucide-react';
import { getPatients } from '@/services/api/patientsService';
import { getPatientDossiers } from '@/services/api/patientsService';
import { archiveDossier } from '@/services/api/consultationsService';
import { getArchivedDossiers } from '@/services/api/receptionService';
import { getAppointments } from '@/services/api/appointmentsService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusLabels: Record<string, string> = {
  active: 'En cours',
  completed: 'Terminé',
  archived: 'Archivé',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  completed: 'secondary',
  archived: 'outline',
};

const ArchiveDossierPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('archive');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [isLoadingDossiers, setIsLoadingDossiers] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [dossierToArchive, setDossierToArchive] = useState<any | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Liste des dossiers archivés (onglet "Voir les archivés")
  const [archivedList, setArchivedList] = useState<any[]>([]);
  const [archivedSearchInput, setArchivedSearchInput] = useState('');
  const [archivedSearch, setArchivedSearch] = useState('');
  const [archivedPage, setArchivedPage] = useState(1);
  const [archivedTotalPages, setArchivedTotalPages] = useState(1);
  const [archivedTotalItems, setArchivedTotalItems] = useState(0);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const itemsPerPage = 20;

  // Historique RDV du patient (onglet Archiver un dossier)
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [loadingPatientAppointments, setLoadingPatientAppointments] = useState(false);
  // Dialog RDV pour un dossier archivé (onglet Voir les archivés)
  const [rdvDialogOpen, setRdvDialogOpen] = useState(false);
  const [rdvDialogPatient, setRdvDialogPatient] = useState<{ id: string; name: string } | null>(null);
  const [rdvDialogList, setRdvDialogList] = useState<any[]>([]);
  const [loadingRdvDialog, setLoadingRdvDialog] = useState(false);

  // Recherche patient au debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setPatientSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await getPatients({ search: searchQuery.trim(), limit: 15 });
        const list = response.data?.patients ?? (Array.isArray(response.data) ? response.data : []);
        setPatientSearchResults(list);
      } catch (e) {
        console.error(e);
        toast.error('Erreur lors de la recherche');
        setPatientSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Charger les dossiers du patient sélectionné
  useEffect(() => {
    if (!selectedPatient?.id) {
      setDossiers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoadingDossiers(true);
      setDossiers([]);
      try {
        const response = await getPatientDossiers(selectedPatient.id, { limit: 50 });
        const list = response.data?.dossiers ?? (Array.isArray(response.data) ? response.data : []);
        if (!cancelled) setDossiers(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error('Impossible de charger les dossiers');
          setDossiers([]);
        }
      } finally {
        if (!cancelled) setIsLoadingDossiers(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPatient?.id]);

  // Charger l'historique des RDV du patient sélectionné (onglet Archiver un dossier)
  useEffect(() => {
    if (!selectedPatient?.id) {
      setPatientAppointments([]);
      return;
    }
    let cancelled = false;
    setLoadingPatientAppointments(true);
    getAppointments({ patientId: selectedPatient.id, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.appointments ?? (Array.isArray(res?.data) ? res.data : []);
        setPatientAppointments(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setPatientAppointments([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPatientAppointments(false);
      });
    return () => { cancelled = true; };
  }, [selectedPatient?.id]);

  const openRdvDialog = (patientId: string, patientName: string) => {
    setRdvDialogPatient({ id: patientId, name: patientName });
    setRdvDialogOpen(true);
    setRdvDialogList([]);
    setLoadingRdvDialog(true);
    getAppointments({ patientId, limit: 100 })
      .then((res) => {
        const list = res?.data?.appointments ?? (Array.isArray(res?.data) ? res.data : []);
        setRdvDialogList(Array.isArray(list) ? list : []);
      })
      .catch(() => setRdvDialogList([]))
      .finally(() => setLoadingRdvDialog(false));
  };

  // Charger la liste des dossiers archivés (onglet "Voir les archivés")
  useEffect(() => {
    if (activeTab !== 'archived-list') return;
    let cancelled = false;
    (async () => {
      setIsLoadingArchived(true);
      try {
        const response = await getArchivedDossiers({
          page: archivedPage,
          limit: itemsPerPage,
          search: archivedSearch.trim() || undefined,
        });
        if (cancelled) return;
        const list = response.data?.dossiers ?? (Array.isArray(response.data) ? response.data : []);
        setArchivedList(list);
        const pag = response.pagination ?? response.data?.pagination;
        if (pag) {
          setArchivedTotalPages(pag.totalPages ?? 1);
          setArchivedTotalItems(pag.totalItems ?? list.length);
        } else {
          setArchivedTotalPages(1);
          setArchivedTotalItems(list.length);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error('Impossible de charger les dossiers archivés');
          setArchivedList([]);
        }
      } finally {
        if (!cancelled) setIsLoadingArchived(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, archivedPage, archivedSearch]);

  const handleArchive = async () => {
    if (!dossierToArchive?.id) return;
    setIsArchiving(true);
    try {
      const response = await archiveDossier(dossierToArchive.id);
      if (response.success) {
        toast.success(response.message || 'Dossier archivé');
        setArchiveConfirmOpen(false);
        setDossierToArchive(null);
        if (selectedPatient?.id) {
          const response2 = await getPatientDossiers(selectedPatient.id, { limit: 50 });
          const list = response2.data?.dossiers ?? (Array.isArray(response2.data) ? response2.data : []);
          setDossiers(list);
        }
      } else {
        toast.error(response.message || 'Impossible d\'archiver');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Impossible d\'archiver le dossier');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dossiers et archivage"
        description="Archiver un dossier terminé ou consulter la liste des dossiers archivés."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="archive" className="gap-2">
            <Archive className="h-4 w-4" />
            Archiver un dossier
          </TabsTrigger>
          <TabsTrigger value="archived-list" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Voir les dossiers archivés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher un patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom, ID Vitalis ou téléphone</Label>
            <Input
              placeholder="Ex: Dupont, VTL-2026-00001..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isSearching && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche...
            </div>
          )}
          {!isSearching && searchQuery.trim() && (
            <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
              {patientSearchResults.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">Aucun patient trouvé</div>
              ) : (
                patientSearchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/50 transition-colors"
                    onClick={() => {
                      setSelectedPatient(p);
                      setSearchQuery('');
                      setPatientSearchResults([]);
                    }}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {p.firstName} {p.lastName}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {p.vitalisId || p.id}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPatient && (
        <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dossiers de {selectedPatient.firstName} {selectedPatient.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              ID Vitalis : {selectedPatient.vitalisId || selectedPatient.id}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPatient(null);
                setDossiers([]);
              }}
            >
              Changer de patient
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingDossiers ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Chargement des dossiers...
              </div>
            ) : dossiers.length === 0 ? (
              <p className="text-muted-foreground py-6">Aucun dossier pour ce patient.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-secondary/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médecin</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossiers.map((d) => (
                      <tr key={d.id} className="border-b hover:bg-secondary/20">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          {d.doctor?.name || '–'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariant[d.status] || 'outline'}>
                            {statusLabels[d.status] || d.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : '–'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {d.status === 'completed' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => {
                                setDossierToArchive(d);
                                setArchiveConfirmOpen(true);
                              }}
                            >
                              <Archive className="h-4 w-4" />
                              Archiver
                            </Button>
                          ) : d.status === 'archived' ? (
                            <span className="text-xs text-muted-foreground">Déjà archivé</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Terminer d’abord la consultation</span>
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

        {/* Historique des RDV de ce patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique des rendez-vous de ce patient
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Liste des RDV passés et à venir pour ce patient.
            </p>
          </CardHeader>
          <CardContent>
            {loadingPatientAppointments ? (
              <div className="flex items-center gap-2 py-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : patientAppointments.length === 0 ? (
              <p className="text-muted-foreground py-4">Aucun rendez-vous pour ce patient.</p>
            ) : (
              <ul className="divide-y max-h-64 overflow-y-auto">
                {[...patientAppointments]
                  .sort((a, b) => new Date(b.appointmentAt).getTime() - new Date(a.appointmentAt).getTime())
                  .map((a: any) => {
                    const at = a.appointmentAt ? new Date(a.appointmentAt) : null;
                    const status = a.status === 'scheduled' ? 'Prévu' : a.status === 'present' ? 'Présent' : a.status === 'absent' ? 'Absent' : a.status === 'cancelled' ? 'Annulé' : a.status || '–';
                    return (
                      <li key={a.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {at && (
                            <span className="text-sm">
                              {at.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} à{' '}
                              {at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">— {a.doctor?.name || '–'}</span>
                        </div>
                        <Badge variant={a.status === 'present' ? 'default' : a.status === 'absent' ? 'destructive' : 'secondary'}>
                          {status}
                        </Badge>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
        </>
      )}

        </TabsContent>

        <TabsContent value="archived-list" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Dossiers archivés
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Liste des dossiers archivés (patient, médecin, date). Aucun détail médical.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Rechercher par nom patient ou ID Vitalis..."
                    value={archivedSearchInput}
                    onChange={(e) => setArchivedSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setArchivedSearch(archivedSearchInput.trim());
                        setArchivedPage(1);
                      }
                    }}
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setArchivedSearch(archivedSearchInput.trim());
                    setArchivedPage(1);
                  }}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Rechercher
                </Button>
              </div>
              {isLoadingArchived ? (
                <div className="flex items-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Chargement...
                </div>
              ) : archivedList.length === 0 ? (
                <p className="text-muted-foreground py-6">Aucun dossier archivé trouvé.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-secondary/30">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID Vitalis</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médecin</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Archivé le</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Archivé par</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">RDV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {archivedList.map((d) => {
                          const patientName = d.patient
                            ? `${d.patient.firstName || ''} ${d.patient.lastName || ''}`.trim() || '–'
                            : '–';
                          return (
                          <tr key={d.id} className="border-b hover:bg-secondary/20">
                            <td className="py-3 px-4">
                              {patientName}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">
                              {d.patient?.vitalisId || '–'}
                            </td>
                            <td className="py-3 px-4">{d.doctor?.name || '–'}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {d.archivedAt
                                ? new Date(d.archivedAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '–'}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {d.archivedByUser?.name || '–'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {d.patient?.id ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => openRdvDialog(d.patient.id, patientName)}
                                >
                                  <Calendar className="h-4 w-4" />
                                  Voir les RDV
                                </Button>
                              ) : (
                                '–'
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {archivedTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {archivedTotalItems} dossier(s) — page {archivedPage} / {archivedTotalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={archivedPage <= 1}
                          onClick={() => setArchivedPage((p) => Math.max(1, p - 1))}
                        >
                          Précédent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={archivedPage >= archivedTotalPages}
                          onClick={() => setArchivedPage((p) => p + 1)}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dossier sera marqué comme archivé. Cette action est définitive et le dossier ne pourra plus être modifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleArchive();
              }}
              disabled={isArchiving}
              className="gap-2"
            >
              {isArchiving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={rdvDialogOpen} onOpenChange={setRdvDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique des RDV — {rdvDialogPatient?.name || 'Patient'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0">
            {loadingRdvDialog ? (
              <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : rdvDialogList.length === 0 ? (
              <p className="text-muted-foreground py-4">Aucun rendez-vous pour ce patient.</p>
            ) : (
              <ul className="divide-y">
                {[...rdvDialogList]
                  .sort((a, b) => new Date(b.appointmentAt).getTime() - new Date(a.appointmentAt).getTime())
                  .map((a: any) => {
                    const at = a.appointmentAt ? new Date(a.appointmentAt) : null;
                    const status = a.status === 'scheduled' ? 'Prévu' : a.status === 'present' ? 'Présent' : a.status === 'absent' ? 'Absent' : a.status === 'cancelled' ? 'Annulé' : a.status || '–';
                    return (
                      <li key={a.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          {at && (
                            <span className="text-sm">
                              {at.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} à{' '}
                              {at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">— {a.doctor?.name || '–'}</span>
                        </div>
                        <Badge variant={a.status === 'present' ? 'default' : a.status === 'absent' ? 'destructive' : 'secondary'}>
                          {status}
                        </Badge>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArchiveDossierPage;
