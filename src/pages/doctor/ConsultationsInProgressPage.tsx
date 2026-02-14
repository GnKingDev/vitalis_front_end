import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Stethoscope,
  Search,
  Phone,
  Clock,
  Eye,
} from 'lucide-react';
import { getDoctorDossiers } from '@/services/api/doctorService';
import { getConsultations } from '@/services/api/consultationsService';
import { Link } from 'react-router-dom';

const ConsultationsInProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 5;

  // Load dossiers in consultation
  useEffect(() => {
    const loadDossiers = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await getDoctorDossiers({
          page: currentPage,
          limit: itemsPerPage,
          status: 'in_consultation',
          search: searchQuery || undefined,
        });
        
        if (response.success && response.data) {
          const dossiersData = Array.isArray(response.data.dossiers) 
            ? response.data.dossiers 
            : response.data.dossiers || response.data || [];
          // Extract patients from dossiers
          const patientsData = dossiersData.map((dossier: any) => dossier.patient || dossier).filter((p: any) => p);
          setPatients(patientsData);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || 0);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDossiers();
  }, [currentPage, searchQuery, user?.id]);

  // Load consultations
  useEffect(() => {
    const loadConsultations = async () => {
      if (!user?.id || patients.length === 0) return;
      
      try {
        const response = await getConsultations({
          doctorId: user.id,
          status: 'in_progress',
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

  // Get consultation for a patient
  const getConsultation = (patientId: string) => {
    return consultations.find(
      (c) => c.patientId === patientId && c.doctorId === user?.id && c.status === 'in_progress'
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultations en cours"
        description="Liste des patients actuellement en consultation"
      />

      {/* Recherche */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, ID Vitalis ou téléphone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des consultations en cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-warning" />
            Consultations en cours ({totalItems || patients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">
                {searchQuery ? 'Aucune consultation trouvée' : 'Aucune consultation en cours'}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Aucune consultation n\'est actuellement en cours'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID Vitalis</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Consultation</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune consultation trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient: any) => {
                    if (!patient) return null;

                    const assignment = patient.assignment || {};
                    const consultationData = getConsultation(patient.id);
                    const startDate = consultationData 
                      ? new Date(consultationData.createdAt).toLocaleDateString('fr-FR')
                      : assignment.createdAt
                        ? new Date(assignment.createdAt).toLocaleDateString('fr-FR')
                        : 'N/A';
                    const startTime = consultationData
                      ? new Date(consultationData.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : assignment.createdAt
                        ? new Date(assignment.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A';

                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-warning">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {patient.gender === 'M' ? 'Homme' : 'Femme'} • {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
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
                              <p className="text-xs text-muted-foreground">{patient.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {consultationData ? (
                            <div>
                              <Badge
                                variant="outline"
                                className="bg-warning/10 text-warning border-warning"
                              >
                                Consultation en cours
                              </Badge>
                              {consultationData.symptoms && (
                                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                  {consultationData.symptoms}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                              En consultation
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{startDate}</p>
                            <p className="text-xs text-muted-foreground">{startTime}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/doctor/consultation?patient=${patient.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Continuer
                            </Link>
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
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || patients.length)} sur {totalItems || patients.length} consultation(s)
              </div>
              
              {totalPages > 1 && (
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
                    
                    {getPageNumbers().map((page, index) => (
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
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationsInProgressPage;
