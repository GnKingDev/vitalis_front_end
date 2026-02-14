import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TestTube2,
  Search,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Stethoscope,
  X,
  ListChecks,
  CreditCard,
  Scan,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getLabRequests, getLabRequestById } from '@/services/api/labService';
import { getImagingRequests, getImagingRequestById } from '@/services/api/imagingService';
import { toast } from 'sonner';

type LabRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

const DoctorLabRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabRequestStatus | 'all'>('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<LabRequestStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Charger les demandes depuis l'API (labo et imagerie)
  useEffect(() => {
    const loadRequests = async () => {
      if (!user?.id) {
        console.log('DoctorLabRequestsPage: Pas d\'utilisateur, arrêt du chargement');
        return;
      }

      try {
        console.log('DoctorLabRequestsPage: Début du chargement des demandes', {
          page: currentPage,
          limit: itemsPerPage,
          doctorId: user.id,
          status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
          search: appliedSearch || undefined,
        });
        
        setIsLoading(true);
        
        // Charger les demandes de labo et d'imagerie en parallèle
        const [labResponse, imagingResponse] = await Promise.all([
          getLabRequests({
            page: currentPage,
            limit: itemsPerPage,
            doctorId: user.id,
            status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
            search: appliedSearch || undefined,
          }),
          getImagingRequests({
            page: currentPage,
            limit: itemsPerPage,
            doctorId: user.id,
            status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
            search: appliedSearch || undefined,
          }),
        ]);

        console.log('DoctorLabRequestsPage: Réponses reçues', { labResponse, imagingResponse });

        let allRequests: any[] = [];

        // Traiter les demandes de laboratoire
        if (labResponse.success && labResponse.data) {
          const labRequests = Array.isArray(labResponse.data) 
            ? labResponse.data 
            : labResponse.data.requests || labResponse.data || [];
          
          const formattedLabRequests = labRequests.map((req: any) => ({
            ...req,
            type: 'lab',
          }));
          
          allRequests = [...allRequests, ...formattedLabRequests];
        }

        // Traiter les demandes d'imagerie
        if (imagingResponse.success && imagingResponse.data) {
          const imagingRequests = Array.isArray(imagingResponse.data) 
            ? imagingResponse.data 
            : imagingResponse.data.requests || imagingResponse.data || [];
          
          const formattedImagingRequests = imagingRequests.map((req: any) => ({
            ...req,
            type: 'imaging',
          }));
          
          allRequests = [...allRequests, ...formattedImagingRequests];
        }

        // Trier par date de création (plus récent en premier)
        allRequests.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        console.log('DoctorLabRequestsPage: Toutes les demandes formatées', allRequests);
        
        setRequests(allRequests);
        
        // Calculer la pagination combinée
        const totalCombined = allRequests.length;
        setTotalPages(Math.ceil(totalCombined / itemsPerPage));
        setTotalItems(totalCombined);
        
      } catch (error: any) {
        console.error('DoctorLabRequestsPage: Erreur lors du chargement des demandes:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les demandes',
        });
        setRequests([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [currentPage, appliedSearch, appliedStatusFilter, user?.id]);

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedStatusFilter(statusFilter);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setStatusFilter('all');
    setAppliedStatusFilter('all');
    setCurrentPage(1);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending: {
        label: 'En attente',
        variant: 'outline',
        className: 'bg-warning/10 text-warning border-warning',
      },
      in_progress: {
        label: 'En cours',
        variant: 'outline',
        className: 'bg-primary/10 text-primary border-primary',
      },
      completed: {
        label: 'Terminé',
        variant: 'outline',
        className: 'bg-success/10 text-success border-success',
      },
      cancelled: {
        label: 'Annulé',
        variant: 'outline',
        className: 'bg-destructive/10 text-destructive border-destructive',
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Handle view details
  const handleViewDetails = async (requestId: string, requestType: 'lab' | 'imaging') => {
    try {
      setIsLoadingDetail(true);
      setIsDetailDialogOpen(true);
      
      // Find the request in the current list first
      const requestFromList = requests.find(r => r.id === requestId);
      if (requestFromList) {
        setSelectedRequest(requestFromList);
      }
      
      // Fetch full details from API based on type
      const response = requestType === 'lab' 
        ? await getLabRequestById(requestId)
        : await getImagingRequestById(requestId);
        
      if (response.success && response.data) {
        setSelectedRequest({
          ...response.data,
          type: requestType,
        });
      } else {
        toast.error('Erreur', {
          description: 'Impossible de charger les détails de la demande',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des détails:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les détails de la demande',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Calculate age
  const calculateAge = (dateOfBirth: string | null | undefined) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} ans`;
    } catch {
      return 'N/A';
    }
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes envoyées au laboratoire et imagerie"
        description="Consulter l'historique de vos demandes de laboratoire et d'imagerie"
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par patient, ID Vitalis, N° Demande..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LabRequestStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleApplyFilters} className="gap-2">
              <Search className="h-4 w-4" />
              Appliquer les filtres
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Demandes ({totalItems || requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TestTube2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucune demande trouvée</p>
              <p className="text-sm">
                {appliedSearch || appliedStatusFilter !== 'all'
                  ? 'Essayez avec d\'autres termes de recherche ou filtres'
                  : 'Vous n\'avez pas encore envoyé de demandes au laboratoire ou à l\'imagerie'}
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
                    <TableHead>Examens</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const patient = request.patient || {};
                    const exams = request.exams || [];
                    const isLab = request.type === 'lab';
                    
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
                                {patient.firstName?.[0] || 'P'}{patient.lastName?.[0] || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {patient.vitalisId || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {request.id?.substring(0, 8) || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLab ? (
                              <TestTube2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Scan className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">
                              {exams.length} examen{exams.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {request.createdAt ? (
                              new Date(request.createdAt).toLocaleDateString('fr-FR', {
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
                          <span className="font-medium">
                            {request.totalAmount 
                              ? `${parseFloat(request.totalAmount).toLocaleString('fr-FR')} GNF`
                              : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status || 'pending')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(request.id, request.type || 'lab')}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </Button>
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
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || requests.length)} sur {totalItems || requests.length} demande(s)
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest?.type === 'imaging' ? (
                <Scan className="h-5 w-5 text-primary" />
              ) : (
                <TestTube2 className="h-5 w-5 text-primary" />
              )}
              Détails de la demande {selectedRequest?.type === 'imaging' ? 'd\'imagerie' : 'de laboratoire'}
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetail ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement des détails...</p>
            </div>
          ) : selectedRequest ? (
            <div className="space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informations patient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nom du patient</Label>
                      <p className="font-semibold text-lg">
                        {selectedRequest.patient?.firstName || 'N/A'} {selectedRequest.patient?.lastName || ''}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Âge</Label>
                      <p className="font-medium">{calculateAge(selectedRequest.patient?.dateOfBirth)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">ID Patient Vitalis</Label>
                      <Badge variant="outline" className="font-mono mt-1">
                        {selectedRequest.patient?.vitalisId || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">N° Demande</Label>
                      <Badge variant="outline" className="font-mono mt-1">
                        {selectedRequest.id || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date de demande</Label>
                      <p className="font-medium flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {selectedRequest.createdAt ? (
                          new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Statut</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedRequest.status || 'pending')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedRequest.type === 'imaging' ? (
                      <Scan className="h-5 w-5 text-primary" />
                    ) : (
                      <TestTube2 className="h-5 w-5 text-primary" />
                    )}
                    Détails de la demande
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Montant total</Label>
                    <p className="font-semibold text-lg mt-1">
                      {selectedRequest.totalAmount 
                        ? `${parseFloat(selectedRequest.totalAmount).toLocaleString('fr-FR')} GNF`
                        : 'N/A'}
                    </p>
                  </div>
                  
                  {selectedRequest.notes && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <p className="text-sm mt-1 p-3 bg-secondary/50 rounded-md">
                        {selectedRequest.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exams */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedRequest.type === 'imaging' ? (
                      <Scan className="h-5 w-5 text-primary" />
                    ) : (
                      <ListChecks className="h-5 w-5 text-primary" />
                    )}
                    {selectedRequest.type === 'imaging' ? 'Examens d\'imagerie' : 'Examens de laboratoire'} demandés ({selectedRequest.exams?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRequest.exams && selectedRequest.exams.length > 0 ? (
                    <div className="space-y-3">
                      {selectedRequest.exams.map((exam: any, index: number) => (
                        <div
                          key={exam.id || index}
                          className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {exam.name || exam.labExam?.name || exam.imagingExam?.name || 'Examen'}
                            </p>
                            {exam.category || exam.labExam?.category || exam.imagingExam?.category ? (
                              <p className="text-sm text-muted-foreground">
                                {exam.category || exam.labExam?.category || exam.imagingExam?.category}
                              </p>
                            ) : null}
                          </div>
                          {exam.price || exam.labExam?.price || exam.imagingExam?.price ? (
                            <Badge variant="outline" className="font-medium">
                              {parseFloat(exam.price || exam.labExam?.price || exam.imagingExam?.price || '0').toLocaleString('fr-FR')} GNF
                            </Badge>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun examen disponible</p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              {selectedRequest.paymentId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Informations de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">ID Paiement</Label>
                        <Badge variant="outline" className="font-mono mt-1">
                          {selectedRequest.paymentId}
                        </Badge>
                      </div>
                      {selectedRequest.payment?.method && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Méthode de paiement</Label>
                          <p className="font-medium mt-1">
                            {selectedRequest.payment.method === 'cash' ? 'Espèces' : 
                             selectedRequest.payment.method === 'orange_money' ? 'Orange Money' : 
                             selectedRequest.payment.method}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune information disponible</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorLabRequestsPage;
