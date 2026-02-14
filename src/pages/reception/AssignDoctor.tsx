import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  User,
  Clock,
  Check,
  Edit,
  Stethoscope,
} from 'lucide-react';
import {
  getReceptionPatients,
  getReceptionDoctors,
  createAssignment,
} from '@/services/api/receptionService';
import { api } from '@/config/api';

const AssignDoctor: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoadingDoctors(true);
        const response = await getReceptionDoctors();
        if (response.success && response.data) {
          const doctorsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.doctors || [];
          setDoctors(doctorsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des médecins:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger la liste des médecins',
        });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  // Load patients with paid consultation
  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const response = await getReceptionPatients({
          page: currentPage,
          limit: itemsPerPage,
          search: appliedSearch || undefined,
        });
        
        if (response.success && response.data) {
          // Filter only patients with paid consultation payment
          const patientsData = Array.isArray(response.data.patients) 
            ? response.data.patients 
            : response.data.patients || [];
          
          // Filter patients with paid consultation payment
          // Note: All patients from getReceptionPatients should have consultation payments
          const paidPatients = patientsData.filter((patient: any) => {
            const payment = patient.payment;
            return payment && payment.status === 'paid';
          });
          
          setPatients(paidPatients);
          
          if (response.data.pagination) {
            // Adjust pagination based on filtered results
            const totalPaid = response.data.stats?.withPayment || paidPatients.length;
            setTotalPages(Math.ceil(totalPaid / itemsPerPage));
            setTotalItems(totalPaid);
          } else {
            setTotalPages(1);
            setTotalItems(paidPatients.length);
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
  }, [currentPage, appliedSearch]);

  // Get current assignment for a patient
  const getCurrentAssignment = (patient: any) => {
    return patient.assignment || null;
  };

  // Get doctor name
  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.name || 'Inconnu';
  };

  // Réinitialiser la page quand la recherche appliquée change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch]);

  // Appliquer la recherche
  const handleApplySearch = () => {
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  // Réinitialiser la recherche
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setCurrentPage(1);
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

  const handleAssign = async () => {
    if (!selectedDoctor || !selectedPatient) {
      toast.error('Veuillez sélectionner un médecin');
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatient);
    if (!patient) {
      toast.error('Patient introuvable');
      return;
    }

    const doctor = doctors.find((d) => d.id === selectedDoctor);
    const currentAssignment = getCurrentAssignment(patient);
    const payment = patient.payment;

    if (!payment || !payment.id) {
      toast.error('Erreur', {
        description: 'Paiement introuvable pour ce patient',
      });
      return;
    }

    setIsAssigning(true);
    try {
      if (currentAssignment) {
        // Update existing assignment
        const response = await api.put(`/reception/assignments/${currentAssignment.id}`, {
          doctorId: selectedDoctor,
        });

        if (response.success) {
          toast.success(`Assignation modifiée`, {
            description: `${patient.firstName} ${patient.lastName} assigné à ${doctor?.name}`,
          });
          // Reload patients
          const reloadResponse = await getReceptionPatients({
            page: currentPage,
            limit: itemsPerPage,
            search: appliedSearch || undefined,
          });
          if (reloadResponse.success && reloadResponse.data) {
            const patientsData = Array.isArray(reloadResponse.data.patients) 
              ? reloadResponse.data.patients 
              : reloadResponse.data.patients || [];
            const paidPatients = patientsData.filter((p: any) => {
              const pay = p.payment;
              return pay && pay.status === 'paid' && pay.type === 'consultation';
            });
            setPatients(paidPatients);
          }
        } else {
          toast.error('Erreur', {
            description: response.message || 'Impossible de modifier l\'assignation',
          });
        }
      } else {
        // Create new assignment
        const response = await createAssignment({
          patientId: selectedPatient,
          doctorId: selectedDoctor,
          paymentId: payment.id,
        });

        if (response.success) {
          toast.success(`Patient assigné à ${doctor?.name}`, {
            description: `${patient.firstName} ${patient.lastName} (${patient.vitalisId})`,
          });
          // Reload patients
          const reloadResponse = await getReceptionPatients({
            page: currentPage,
            limit: itemsPerPage,
            search: appliedSearch || undefined,
          });
          if (reloadResponse.success && reloadResponse.data) {
            const patientsData = Array.isArray(reloadResponse.data.patients) 
              ? reloadResponse.data.patients 
              : reloadResponse.data.patients || [];
            const paidPatients = patientsData.filter((p: any) => {
              const pay = p.payment;
              return pay && pay.status === 'paid' && pay.type === 'consultation';
            });
            setPatients(paidPatients);
          }
        } else {
          toast.error('Erreur', {
            description: response.message || 'Impossible d\'assigner le patient',
          });
        }
      }

      setAssignDialogOpen(false);
      setSelectedPatient(null);
      setSelectedDoctor('');
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'assigner le patient',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const openAssignDialog = (patientId: string) => {
    setSelectedPatient(patientId);
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      const currentAssignment = getCurrentAssignment(patient);
      // Pre-select current doctor if already assigned
      if (currentAssignment && currentAssignment.doctor) {
        setSelectedDoctor(currentAssignment.doctor.id);
      } else if (currentAssignment && currentAssignment.doctorId) {
        setSelectedDoctor(currentAssignment.doctorId);
      } else {
        setSelectedDoctor('');
      }
    }
    setAssignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignation médecin"
        description="Assigner les patients ayant payé à un médecin"
      />

      {/* Doctors overview */}
      {isLoadingDoctors ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Chargement des médecins...</p>
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun médecin disponible</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-muted-foreground">{doctor.department || 'Médecine générale'}</p>
                  </div>
                  <Badge variant="outline" className="badge-completed">
                    Disponible
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un patient (ID, nom)..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplySearch();
                  }
                }}
              />
            </div>
            {appliedSearch && (
              <Button
                variant="outline"
                onClick={handleResetSearch}
              >
                Réinitialiser
              </Button>
            )}
            <Button onClick={handleApplySearch}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Patients avec paiement effectué
            <Badge variant="outline" className="ml-2">
              {totalItems || patients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Chargement...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun patient avec paiement effectué</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {patients.map((patient) => {
                const assignment = getCurrentAssignment(patient);
                const assignedDoctor = assignment?.doctor?.name || (assignment?.doctorId ? getDoctorName(assignment.doctorId) : null);
                const isAssigned = !!assignment;

                return (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {patient.vitalisId}
                          </Badge>
                          <span>•</span>
                          <span>{patient.phone}</span>
                          {isAssigned && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Stethoscope className="h-3 w-3" />
                                <span className="font-medium text-foreground">{assignedDoctor}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isAssigned && (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-muted-foreground/20"
                        >
                          Non assigné
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={isAssigned ? 'outline' : 'default'}
                        onClick={() => openAssignDialog(patient.id)}
                      >
                        {isAssigned ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Assigner
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
              </div>

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
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPatient && (() => {
                const patient = patients.find((p) => p.id === selectedPatient);
                return patient && getCurrentAssignment(patient)
                  ? 'Modifier l\'assignation'
                  : 'Assigner à un médecin';
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedPatient && (() => {
                const patient = patients.find((p) => p.id === selectedPatient);
                return patient && getCurrentAssignment(patient) ? 'Modifiez le médecin assigné à ce patient' : 'Sélectionnez le médecin pour ce patient';
              })()}
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-4">
              {/* Patient info */}
              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                {(() => {
                  const patient = patients.find((p) => p.id === selectedPatient);
                  if (!patient) return null;
                  const currentAssignment = getCurrentAssignment(patient);
                  const currentDoctor = currentAssignment?.doctor?.name || (currentAssignment?.doctorId ? getDoctorName(currentAssignment.doctorId) : null);
                  
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {patient?.firstName[0]}{patient?.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient?.vitalisId}
                          </p>
                        </div>
                      </div>
                      {currentAssignment && currentDoctor && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Médecin actuellement assigné</p>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{currentDoctor}</span>
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs"
                            >
                              {currentAssignment?.status === 'completed'
                                ? 'Terminé'
                                : currentAssignment?.status === 'in_consultation'
                                ? 'En consultation'
                                : currentAssignment?.status === 'assigned'
                                ? 'Assigné'
                                : 'Assigné'}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Doctor selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Médecin</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{doctor.name}</span>
                          <span className="text-muted-foreground">
                            ({doctor.department})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAssignDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleAssign} disabled={isAssigning}>
                  {isAssigning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirmer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignDoctor;
