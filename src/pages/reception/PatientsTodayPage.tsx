import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
  Calendar,
  Users,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  User,
  Search,
  Eye,
  MapPin,
  Plus,
  Download,
  Bed,
} from 'lucide-react';
import type { Patient } from '@/types';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getReceptionPatients, exportReceptionPatients } from '@/services/api/receptionService';
import { toast } from 'sonner';

const PatientsTodayPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Date par défaut = aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedDate, setAppliedDate] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;

  // Charger les patients depuis l'API
  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const response = await getReceptionPatients({
          page: currentPage,
          limit: itemsPerPage,
          date: appliedDate || undefined,
          search: appliedSearch || undefined,
        });
        
        if (response.success && response.data) {
          setPatients(response.data.patients || response.data);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || 0);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des patients:', error);
        toast.error('Erreur', {
          description: error?.message || 'Impossible de charger les patients',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [currentPage, appliedDate, appliedSearch]);

  // Réinitialiser la page quand les filtres appliqués changent
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedDate]);

  const handleExportExcel = async () => {
    try {
      const blob = await exportReceptionPatients({
        date: appliedDate || undefined,
        search: appliedSearch || undefined,
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients_${appliedDate || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export réussi', {
        description: 'Le fichier Excel a été téléchargé',
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'exporter les patients',
      });
    }
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedDate(selectedDate);
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSelectedDate('');
    setAppliedDate('');
    setSearchQuery('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  // Obtenir les informations de paiement pour un patient (depuis les données du patient)
  const getPatientPayment = (patient: Patient) => {
    // Les données de paiement sont incluses dans la réponse API
    return (patient as any).payment ? (patient as any).payment : null;
  };

  // Obtenir l'assignation du médecin pour un patient (depuis les données du patient)
  const getPatientAssignment = (patient: Patient) => {
    // Les données d'assignation sont incluses dans la réponse API
    return (patient as any).assignedDoctorId ? { doctorId: (patient as any).assignedDoctorId } : null;
  };

  // Obtenir le nom du médecin
  const getDoctorName = (doctorId: string, patient?: Patient) => {
    // Le nom du médecin est dans assignment.doctor.name
    if (patient && (patient as any).assignment?.doctor?.name) {
      return (patient as any).assignment.doctor.name;
    }
    // Fallback: chercher dans assignedDoctorName si disponible
    if (patient && (patient as any).assignedDoctorName) {
      return (patient as any).assignedDoctorName;
    }
    return 'Non assigné';
  };

  // Obtenir le lit occupé par le patient (depuis les données du patient)
  const getPatientBed = (patient: Patient) => {
    // Les données du lit sont incluses dans la réponse API
    if ((patient as any).bed) {
      return (patient as any).bed;
    }
    if ((patient as any).bedId) {
      return {
        id: (patient as any).bedId,
        number: (patient as any).bedNumber,
        type: (patient as any).bedType,
      };
    }
    return null;
  };

  // Formater la date pour l'affichage
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const isToday = appliedDate === today;
  const isAllPatients = !appliedDate;

  // Ouvrir la modal avec les détails du patient
  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  // Générer les numéros de page pour la pagination
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Liste des patients"
        description={isAllPatients ? "Tous les patients enregistrés" : isToday ? "Liste des patients enregistrés aujourd'hui" : `Liste des patients enregistrés le ${formatDisplayDate(selectedDate)}`}
      >
        <Button asChild>
          <Link to="/reception/register">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un patient
          </Link>
        </Button>
      </PageHeader>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total patients</p>
                <p className="text-2xl font-bold">{totalItems || patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paiements reçus</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p) => getPatientPayment(p)?.status === 'paid').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignés</p>
                <p className="text-2xl font-bold">
                  {patients.filter((p) => getPatientAssignment(p)).length}
                </p>
              </div>
              <User className="h-8 w-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélecteur de date */}
            <div className="space-y-2">
              <Label htmlFor="date-select" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Filtrer par date (optionnel)
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-select"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        formatDisplayDate(selectedDate)
                      ) : (
                        <span>Tous les patients</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate ? new Date(selectedDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date.toISOString().split('T')[0]);
                        } else {
                          setSelectedDate('');
                        }
                      }}
                      disabled={(date) => date > new Date(today)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDate('');
                      setAppliedDate('');
                      setCurrentPage(1);
                    }}
                    className="whitespace-nowrap"
                  >
                    Tous
                  </Button>
                )}
              </div>
            </div>

            {/* Recherche */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, ID Vitalis ou téléphone..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyFilters();
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!appliedDate && !appliedSearch}
            >
              Réinitialiser
            </Button>
            <Button onClick={handleApplyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Appliquer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liste des patients ({totalItems || patients.length})</span>
            <div className="flex gap-2">
              {appliedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDate('');
                    setAppliedDate('');
                    setCurrentPage(1);
                  }}
                >
                  Tous les patients
                </Button>
              )}
              {appliedDate !== today && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(today);
                    setAppliedDate(today);
                    setCurrentPage(1);
                  }}
                >
                  Aujourd'hui
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter en Excel
                </Button>
              )}
            </div>
          </CardTitle>
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
                {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? 'Essayez avec d\'autres termes de recherche'
                  : `Aucun patient n'a été enregistré le ${formatDisplayDate(selectedDate)}`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID Vitalis</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Heure</TableHead>
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
                  patients.map((patient) => {
                    const payment = getPatientPayment(patient);
                    const assignmentData = (patient as any).assignment;
                    const doctorName = assignmentData?.doctor?.name || 'Non assigné';
                    const registrationTime = patient.createdAt && !isNaN(new Date(patient.createdAt).getTime())
                      ? new Date(patient.createdAt).toLocaleTimeString('fr-FR', {
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
                                {patient.gender === 'M' ? 'Homme' : 'Femme'} • {
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
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </p>
                            {patient.email && (
                              <p className="text-sm flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {patient.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment ? (
                            <div>
                              <Badge
                                variant={payment.status === 'paid' ? 'default' : 'secondary'}
                                className={
                                  payment.status === 'paid'
                                    ? 'bg-success text-success-foreground'
                                    : ''
                                }
                              >
                                {payment.status === 'paid' ? 'Payé' : 'En attente'}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {typeof payment.amount === 'string' 
                                  ? parseFloat(payment.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  : payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                } GNF
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{doctorName}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{registrationTime}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(patient)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Détail
                          </Button>
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

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <Badge variant="outline" className="font-mono mt-1">
                      {selectedPatient.vitalisId}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Détails complets du patient
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date de naissance</p>
                      <p className="font-medium">
                        {selectedPatient.dateOfBirth 
                          ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('fr-FR')
                          : (selectedPatient as any).age 
                            ? `${(selectedPatient as any).age} ans`
                            : 'Non renseigné'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sexe</p>
                      <p className="font-medium">
                        {selectedPatient.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date d'enregistrement</p>
                      <p className="font-medium">
                        {new Date(selectedPatient.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {(() => {
                      const patientBed = getPatientBed(selectedPatient);
                      return patientBed ? (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            Lit occupé
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={patientBed.type === 'vip' ? 'default' : 'outline'}>
                              Lit {patientBed.number} ({patientBed.type === 'vip' ? 'VIP' : 'Classique'})
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedPatient.email}</p>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="font-medium">{selectedPatient.address}</p>
                      </div>
                    )}
                    {selectedPatient.emergencyContact && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contact d'urgence</p>
                        <p className="font-medium">{selectedPatient.emergencyContact}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paiement */}
                {(() => {
                  const payment = getPatientPayment(selectedPatient);
                  return payment ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Paiement
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Statut</span>
                          <Badge
                            variant={payment.status === 'paid' ? 'default' : 'secondary'}
                            className={
                              payment.status === 'paid'
                                ? 'bg-success text-success-foreground'
                                : ''
                            }
                          >
                            {payment.status === 'paid' ? 'Payé' : 'En attente'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Montant</span>
                          <span className="font-semibold text-lg text-success">
                            {typeof payment.amount === 'string' 
                              ? parseFloat(payment.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : payment.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            } GNF
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Méthode</span>
                          <span className="font-medium">
                            {payment.method === 'orange_money' ? 'Orange Money' : 'Espèces'}
                          </span>
                        </div>
                        {payment.reference && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Référence</span>
                            <span className="font-mono text-sm">{payment.reference}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Date</span>
                          <span className="text-sm">
                            {payment.createdAt 
                              ? new Date(payment.createdAt).toLocaleString('fr-FR')
                              : selectedPatient.createdAt
                                ? new Date(selectedPatient.createdAt).toLocaleString('fr-FR')
                                : 'Non disponible'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Médecin assigné */}
                {(() => {
                  const assignmentData = (selectedPatient as any).assignment;
                  const fullAssignment = assignmentData;
                  return fullAssignment ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Médecin assigné
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Médecin</span>
                          <span className="font-medium">
                            {fullAssignment.doctor?.name || 'Non assigné'}
                          </span>
                        </div>
                        {fullAssignment.doctor?.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Email</span>
                            <span className="text-sm font-medium">{fullAssignment.doctor.email}</span>
                          </div>
                        )}
                        {fullAssignment.status && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Statut</span>
                            <Badge
                              variant="outline"
                              className={
                                fullAssignment.status === 'completed'
                                  ? 'bg-success/10 text-success border-success'
                                  : fullAssignment.status === 'in_consultation'
                                  ? 'bg-warning/10 text-warning border-warning'
                                  : fullAssignment.status === 'assigned'
                                  ? 'bg-info/10 text-info border-info'
                                  : ''
                              }
                            >
                              {fullAssignment.status === 'completed'
                                ? 'Consultation terminée'
                                : fullAssignment.status === 'in_consultation'
                                ? 'En consultation'
                                : fullAssignment.status === 'assigned'
                                ? 'Assigné'
                                : 'Non assigné'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Médecin assigné
                      </h3>
                      <p className="text-sm text-muted-foreground">Aucun médecin assigné</p>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsTodayPage;
