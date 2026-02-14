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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Scan,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Stethoscope,
} from 'lucide-react';
import type { ImagingRequest, ImagingRequestStatus } from '@/types';
import { getImagingRequests } from '@/services/api/imagingService';
import { toast } from 'sonner';

const ImagingRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ImagingRequestStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const itemsPerPage = 10;

  // Charger les demandes depuis l'API
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        
        // Pour le lab, on ne charge que les demandes payées et en attente
        // Pour l'admin, on charge toutes les demandes
        const status = user?.role === 'admin' 
          ? (statusFilter !== 'all' ? statusFilter : undefined)
          : 'pending'; // Lab ne voit que les demandes en attente
        
        const response = await getImagingRequests({
          page: currentPage,
          limit: itemsPerPage,
          status: status,
          date: dateFilter || undefined,
          search: searchQuery || undefined,
        });

        if (response.success && response.data) {
          const requestsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.requests || [];
          
          // Pour le lab, filtrer uniquement les demandes payées
          let filtered = requestsData;
          if (user?.role === 'lab') {
            filtered = requestsData.filter((req: any) => req.paymentId);
          }
          
          setRequests(filtered);
          
          // Calculer les statistiques
          const pending = filtered.filter((r: any) => r.status === 'pending');
          const completed = filtered.filter((r: any) => r.status === 'sent_to_doctor');
          setStats({
            total: filtered.length,
            pending: pending.length,
            completed: completed.length,
          });
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || filtered.length);
          } else {
            setTotalPages(1);
            setTotalItems(filtered.length);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des demandes:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les demandes',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [currentPage, statusFilter, dateFilter, searchQuery, user?.role]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchQuery]);

  // Helper functions
  const getPatient = (request: any) => {
    return request.patient || {};
  };

  const getDoctor = (request: any) => {
    return request.doctor || {};
  };

  // Get status label and color
  const getStatusLabel = (status: ImagingRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'sent_to_doctor':
        return 'Fini et envoyé au médecin';
      default:
        return status;
    }
  };

  const getStatusColor = (status: ImagingRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning';
      case 'sent_to_doctor':
        return 'bg-success/10 text-success border-success';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
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
        title="Demandes d'imagerie"
        description="Gérer les demandes d'examens d'imagerie"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total demandes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Scan className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.pending}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-success">
                  {stats.completed}
                </p>
              </div>
              <Scan className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ImagingRequestStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="sent_to_doctor">Fini et envoyé au médecin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Patient, ID Vitalis, médecin..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des demandes ({totalItems || requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scan className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucune demande trouvée</p>
              <p className="text-sm">
                {searchQuery || dateFilter || statusFilter !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucune demande d\'imagerie à traiter pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Examens</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const patient = getPatient(request);
                    const doctor = getDoctor(request);

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {patient.firstName ? (
                            <div>
                              <p className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {patient.vitalisId}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Patient introuvable</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doctor.name || 'N/A'}</span>
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
                          <div className="flex flex-wrap gap-1">
                            {(request.exams || []).slice(0, 2).map((exam: any, idx: number) => (
                              <Badge key={exam.id || idx} variant="outline" className="text-xs">
                                {(exam.name || exam).substring(0, 20)}...
                              </Badge>
                            ))}
                            {(request.exams || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(request.exams || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">
                            {(request.totalAmount || 0).toLocaleString()} GNF
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {user?.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/lab/imaging-requests/${request.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ouvrir
                            </Button>
                          )}
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
    </div>
  );
};

export default ImagingRequestsPage;
