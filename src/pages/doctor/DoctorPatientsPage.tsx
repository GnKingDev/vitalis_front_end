import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Users,
  Search,
  Phone,
  Stethoscope,
  Clock,
  CheckCircle2,
  Eye,
  Filter,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { getDoctorDossiers, updateMyAvailability } from '@/services/api/doctorService';
import { getConsultations } from '@/services/api/consultationsService';
import { Link, useSearchParams } from 'react-router-dom';
import { PatientInsuranceDiscount } from '@/components/shared/PatientInsuranceDiscount';

const DoctorPatientsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') || 'all';
  const today = new Date().toISOString().split('T')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(statusFromUrl);
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>(statusFromUrl);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [appliedDateFilter, setAppliedDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  
  const itemsPerPage = 5;

  const isAvailable = user?.doctorIsAvailable !== false;
  const handleToggleAvailability = async (checked: boolean) => {
    if (!user?.id || user.role !== 'doctor') return;
    setAvailabilityLoading(true);
    try {
      await updateMyAvailability(checked);
      await refreshUser();
    } catch (err) {
      console.error('Erreur mise à jour disponibilité:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Load assigned patients
  useEffect(() => {
    const loadPatients = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await getDoctorDossiers({
          page: currentPage,
          limit: itemsPerPage,
          search: appliedSearch || undefined,
          status: appliedStatusFilter === 'all' ? 'active' : appliedStatusFilter,
          date: appliedDateFilter || undefined,
        });
        
        if (response.success && response.data) {
          const dossiersData = Array.isArray(response.data.dossiers) 
            ? response.data.dossiers 
            : response.data.dossiers || response.data || [];
          // Extract patients from dossiers, preserving dossier structure
          const patientsData = dossiersData.map((dossier: any) => {
            // If dossier has a patient property, merge it with dossier info
            if (dossier.patient) {
              return {
                ...dossier.patient,
                dossier: dossier,
                assignment: dossier.assignment || dossier.patient.assignment,
              };
            }
            // Otherwise, use dossier as patient
            return {
              ...dossier,
              dossier: dossier,
              assignment: dossier.assignment,
            };
          }).filter((p: any) => p && p.id);
          
          console.log('Patients data loaded:', patientsData);
          setPatients(patientsData);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || 0);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPatients();
  }, [currentPage, appliedSearch, appliedStatusFilter, appliedDateFilter, user?.id]);

  // Load consultations for all patients
  useEffect(() => {
    const loadConsultations = async () => {
      if (!user?.id || patients.length === 0) return;
      
      try {
        const patientIds = patients.map((p: any) => p.id);
        const response = await getConsultations({
          doctorId: user.id,
          patientId: patientIds.join(','), // Might need to adjust based on API
        });
        
        if (response.success && response.data) {
          const consultationsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.consultations || [];
          setConsultations(consultationsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des consultations:', error);
      }
    };
    
    loadConsultations();
  }, [patients, user?.id]);

  // Synchroniser les filtres depuis l'URL quand elle change (ex: clic sur "Dossiers archivés")
  useEffect(() => {
    const s = searchParams.get('status');
    if (s && ['all', 'assigned', 'in_consultation', 'completed', 'archived'].includes(s)) {
      setStatusFilter(s);
      setAppliedStatusFilter(s);
    }
  }, [searchParams]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedStatusFilter, appliedDateFilter]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedStatusFilter(statusFilter);
    setAppliedDateFilter(dateFilter);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setStatusFilter('all');
    setAppliedStatusFilter('all');
    setDateFilter('');
    setAppliedDateFilter('');
    setCurrentPage(1);
  };

  // Get consultation for a patient
  const getConsultation = (patientId: string) => {
    return consultations.find(
      (c) => c.patientId === patientId && c.doctorId === user?.id
    );
  };

  // Générer les numéros de page
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Statistiques (inclure Archivé dans Terminées)
  const stats = useMemo(() => {
    const completed = patients.filter((p: any) => {
      const dossierStatus = p?.dossier?.status;
      const assignmentStatus = p?.assignment?.status;
      const consultationStatus = p?.dossier?.consultation?.status;
      return dossierStatus === 'archived' || dossierStatus === 'completed' || assignmentStatus === 'completed' || consultationStatus === 'completed';
    }).length;
    const inConsultation = patients.filter((p: any) => p.assignment?.status === 'in_consultation').length;
    const assigned = patients.filter((p: any) => {
      const isCompleted = p?.dossier?.status === 'archived' || p?.dossier?.status === 'completed' || p?.assignment?.status === 'completed' || p?.dossier?.consultation?.status === 'completed';
      if (isCompleted) return false;
      return p.assignment?.status === 'assigned';
    }).length;

    return {
      total: patients.length,
      assigned,
      inConsultation,
      completed,
    };
  }, [patients]);

  // Trouver le patient actuellement en consultation (un seul à la fois)
  const currentConsultationPatientId = useMemo(() => {
    const inProgressPatient = patients.find((p: any) => {
      return p.assignment?.status === 'in_consultation' || 
             (p.consultation && p.consultation.status === 'in_progress');
    });
    return inProgressPatient?.id || null;
  }, [patients]);

  // Obtenir le libellé du statut (Archivé, Terminé, En cours, En attente)
  const getStatusLabel = (patientOrId: any) => {
    const patient = typeof patientOrId === 'object' ? patientOrId : patients.find((p: any) => p.id === patientOrId);
    const dossierStatus = patient?.dossier?.status;
    const assignmentStatus = patient?.assignment?.status;
    const consultationStatus = patient?.dossier?.consultation?.status;
    if (dossierStatus === 'archived') return 'Archivé';
    if (dossierStatus === 'completed' || assignmentStatus === 'completed' || consultationStatus === 'completed') return 'Terminé';
    if ((typeof patientOrId === 'string' ? patientOrId : patient?.id) === currentConsultationPatientId) {
      return 'En cours';
    }
    return 'En attente';
  };

  // Obtenir la couleur du statut
  const getStatusColor = (patientOrId: any) => {
    const patient = typeof patientOrId === 'object' ? patientOrId : patients.find((p: any) => p.id === patientOrId);
    const dossierStatus = patient?.dossier?.status;
    const assignmentStatus = patient?.assignment?.status;
    const consultationStatus = patient?.dossier?.consultation?.status;
    if (dossierStatus === 'archived') return 'bg-muted text-muted-foreground border-muted-foreground/30';
    if (dossierStatus === 'completed' || assignmentStatus === 'completed' || consultationStatus === 'completed') return 'bg-success/10 text-success border-success';
    if ((typeof patientOrId === 'string' ? patientOrId : patient?.id) === currentConsultationPatientId) {
      return 'bg-warning/10 text-warning border-warning';
    }
    return 'bg-muted text-muted-foreground border-muted-foreground/20';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients assignés"
        description="Liste des patients assignés à votre consultation"
      />

      {/* Disponibilité médecin */}
      {user?.role === 'doctor' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Disponible pour recevoir des patients</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAvailable ? 'Vous êtes visible à la réception pour les nouvelles assignations' : 'Vous n\'êtes pas visible pour les assignations'}
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
                disabled={availabilityLoading}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total patients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.assigned}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pas encore commencé</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En consultation</p>
                <p className="text-2xl font-bold text-warning">{stats.inConsultation}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Consultation en cours</p>
              </div>
              <Stethoscope className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, ID Vitalis ou téléphone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyFilters();
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setAppliedStatusFilter(v);
                setCurrentPage(1);
                setSearchParams((prev) => {
                  const p = new URLSearchParams(prev);
                  if (v === 'all') p.delete('status');
                  else p.set('status', v);
                  return p;
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="assigned">En attente</SelectItem>
                <SelectItem value="in_consultation">En consultation</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="archived">Archivés</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[180px] justify-start text-left font-normal',
                    !dateFilter && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? new Date(dateFilter + 'T12:00:00').toLocaleDateString('fr-FR') : 'Date assignation'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter ? new Date(dateFilter + 'T12:00:00') : undefined}
                  onSelect={(d) => setDateFilter(d ? d.toISOString().split('T')[0] : '')}
                />
              </PopoverContent>
            </Popover>
            {(appliedSearch || appliedStatusFilter !== 'all' || appliedDateFilter) && (
              <Button variant="outline" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
            )}
            <Button onClick={handleApplyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des patients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des patients assignés ({totalItems || patients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">
                {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient assigné'}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Aucun patient n\'a été assigné à votre consultation pour le moment'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID Vitalis</TableHead>
                  <TableHead>Assurance</TableHead>
                  <TableHead>Remise</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dossier archivé</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun patient trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient: any) => {
                    if (!patient) return null;

                    const assignment = patient.assignment || {};
                    const dossier = patient.dossier || {};
                    const patientConsultation = getConsultation(patient.id);
                    
                    const assignmentDate = assignment.createdAt || dossier.createdAt || patient.createdAt
                      ? new Date(assignment.createdAt || dossier.createdAt || patient.createdAt).toLocaleDateString('fr-FR')
                      : 'N/A';
                    const assignmentTime = assignment.createdAt || dossier.createdAt || patient.createdAt
                      ? new Date(assignment.createdAt || dossier.createdAt || patient.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A';

                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
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
                              <p className="text-sm text-muted-foreground">
                                {(patient.gender === 'M' || patient.gender === 'male' || patient.gender === 'Male') 
                                  ? 'Homme' 
                                  : (patient.gender === 'F' || patient.gender === 'female' || patient.gender === 'Female')
                                    ? 'Femme'
                                    : 'Non renseigné'} • {
                                  patient.dateOfBirth && !isNaN(new Date(patient.dateOfBirth).getTime())
                                    ? new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')
                                    : (patient as any).age 
                                      ? `${(patient as any).age} ans`
                                      : 'Âge non renseigné'
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {patient.vitalisId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <PatientInsuranceDiscount patient={patient} column="assurance" />
                        </TableCell>
                        <TableCell>
                          <PatientInsuranceDiscount patient={patient} column="remise" />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(patient)}
                          >
                            {getStatusLabel(patient)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigné le {assignmentDate} à {assignmentTime}
                          </p>
                        </TableCell>
                        <TableCell>
                          {dossier.hasArchivedDossier ? (
                            <Badge variant="secondary" className="bg-muted">
                              Oui
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link
                                to={
                                  dossier.status === 'archived'
                                    ? `/doctor/consultation?patient=${patient.id}&dossier=${dossier.id}`
                                    : `/doctor/consultation?patient=${patient.id}${dossier.id ? `&dossier=${dossier.id}` : ''}`
                                }
                              >
                                {dossier.status === 'archived' ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Détail
                                  </>
                                ) : assignment.status === 'assigned' ? (
                                  <>
                                    <Stethoscope className="h-4 w-4 mr-2" />
                                    Commencer
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir
                                  </>
                                )}
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {patients.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || patients.length)} sur {totalItems || patients.length} patient(s)
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {totalPages > 0 && getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page as number);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPatientsPage;
