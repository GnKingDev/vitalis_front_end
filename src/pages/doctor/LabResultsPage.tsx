import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TestTube2,
  Search,
  Eye,
  Printer,
  Calendar,
  List,
  Scan,
} from 'lucide-react';
import type { LabRequest, ImagingRequest } from '@/types';
import { getDoctorResults } from '@/services/api/doctorService';
import { toast } from 'sonner';

const LabResultsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [examsDialogOpen, setExamsDialogOpen] = useState(false);
  const [selectedRequestForExams, setSelectedRequestForExams] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Charger les résultats depuis l'API
  useEffect(() => {
    const loadResults = async () => {
      if (!user?.id) {
        console.log('LabResultsPage: Pas d\'utilisateur, arrêt du chargement');
        return;
      }

      try {
        console.log('LabResultsPage: Début du chargement des résultats', {
          page: currentPage,
          limit: itemsPerPage,
          search: appliedSearch,
          userId: user.id,
        });
        
        setIsLoading(true);
        
        const response = await getDoctorResults({
          page: currentPage,
          limit: itemsPerPage,
          search: appliedSearch || undefined,
        });

        console.log('LabResultsPage: Réponse reçue', response);

        if (response.success && response.data) {
          const resultsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.results || [];
          
          console.log('LabResultsPage: Données formatées', resultsData);
          
          // Formater les résultats pour avoir le même format que l'ancien code
          const formattedResults = resultsData.map((result: any) => ({
            type: result.type || (result.labRequestId ? 'lab' : 'imaging'),
            data: result,
          }));

          setResults(formattedResults);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || 0);
          } else {
            setTotalPages(1);
            setTotalItems(formattedResults.length);
          }
        } else {
          console.warn('LabResultsPage: Réponse sans succès ou sans données', response);
          setResults([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error: any) {
        console.error('LabResultsPage: Erreur lors du chargement des résultats:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les résultats',
        });
        setResults([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [currentPage, appliedSearch, user?.id]);

  // Helper functions
  const getPatient = (result: any) => {
    return result.patient || result.data?.patient || {};
  };

  const getDoctor = (result: any) => {
    return result.doctor || result.data?.doctor || {};
  };

  // Apply search
  const handleApplySearch = () => {
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplySearch();
    }
  };

  // Réinitialiser la page quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch]);

  // Generate page numbers
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

  const handlePrint = (requestId: string, type: 'lab' | 'imaging') => {
    // Navigate to detail page and trigger print
    navigate(`/doctor/lab-results/${requestId}`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Résultats labo et imagerie"
        description="Consulter et imprimer les résultats de laboratoire et d'imagerie"
      />

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par patient, ID Vitalis, N° Labo..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleApplySearch} className="gap-2">
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Résultats ({totalItems || results.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TestTube2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucun résultat reçu</p>
              <p className="text-sm">
                {appliedSearch
                  ? 'Essayez avec d\'autres termes de recherche'
                  : 'Aucun résultat de laboratoire ou d\'imagerie n\'a été envoyé pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>N° Demande</TableHead>
                    <TableHead>Date réception</TableHead>
                    <TableHead>Examens</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item) => {
                    const patient = getPatient(item);
                    if (!patient.firstName) return null;

                    const isLab = item.type === 'lab';
                    const request = item.data || item;

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isLab
                                ? 'bg-warning/10 text-warning border-warning'
                                : 'bg-primary/10 text-primary border-primary'
                            }
                          >
                            <div className="flex items-center gap-2">
                              {isLab ? (
                                <TestTube2 className="h-3 w-3" />
                              ) : (
                                <Scan className="h-3 w-3" />
                              )}
                              {isLab ? 'Laboratoire' : 'Imagerie'}
                            </div>
                          </Badge>
                        </TableCell>
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
                                {patient.vitalisId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {request.id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {request.updatedAt || request.createdAt ? (
                              new Date(request.updatedAt || request.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequestForExams(request.id);
                              setExamsDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <List className="h-4 w-4" />
                            {(request.exams?.length || request.examIds?.length || 0)} examen{(request.exams?.length || request.examIds?.length || 0) > 1 ? 's' : ''}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success border-success"
                          >
                            Fini et envoyé au médecin
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/doctor/lab-results/${request.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Consulter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(request.id, item.type)}
                              className="gap-2"
                            >
                              <Printer className="h-4 w-4" />
                              Imprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || results.length)} sur {totalItems || results.length} résultat(s)
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
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour afficher les examens demandés */}
      <Dialog open={examsDialogOpen} onOpenChange={setExamsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Examens demandés</DialogTitle>
          </DialogHeader>
          {selectedRequestForExams && (
            <div className="space-y-3">
              {(() => {
                const request = results.find((r) => (r.data?.id || r.id) === selectedRequestForExams);
                if (!request) return null;
                
                const exams = request.data?.exams || request.exams || [];
                if (exams.length === 0) {
                  return <p className="text-sm text-muted-foreground">Aucun examen disponible</p>;
                }
                
                return exams.map((exam: any, idx: number) => (
                  <div
                    key={exam.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20"
                  >
                    <div>
                      <p className="font-medium">{exam.name || exam}</p>
                      {exam.category && (
                        <p className="text-sm text-muted-foreground">{exam.category}</p>
                      )}
                    </div>
                    {exam.price && (
                      <Badge variant="outline" className="font-medium">
                        {exam.price.toLocaleString()} GNF
                      </Badge>
                    )}
                  </div>
                ));
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabResultsPage;
