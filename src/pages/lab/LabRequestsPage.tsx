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
  FlaskConical,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Stethoscope,
} from 'lucide-react';
import type { LabRequest, LabRequestStatus } from '@/types';
import { getLabRequests } from '@/services/api/labService';
import { toast } from 'sonner';

const LabRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabRequestStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
        
        const response = await getLabRequests({
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

  // Helper functions
  const getPatient = (request: any) => {
    return request.patient || {};
  };

  const getDoctor = (request: any) => {
    return request.doctor || {};
  };

  // Get status label and color
  const getStatusLabel = (status: LabRequestStatus) => {
    const labels: Record<LabRequestStatus, string> = {
      pending: 'En attente',
      sent_to_doctor: 'Fini et envoyé au médecin',
    };
    return labels[status];
  };

  const getStatusColor = (status: LabRequestStatus) => {
    const colors: Record<LabRequestStatus, string> = {
      requested: 'bg-muted text-muted-foreground border-muted-foreground/20',
      pending_payment: 'bg-warning/10 text-warning border-warning',
      paid: 'bg-info/10 text-info border-info',
      assigned: 'bg-primary/10 text-primary border-primary',
      in_progress: 'bg-warning/10 text-warning border-warning',
      result_ready: 'bg-success/10 text-success border-success',
      sent_to_doctor: 'bg-success/10 text-success border-success',
    };
    return colors[status];
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
        title="Demandes de laboratoire"
        description="Gérer les demandes d'examens de laboratoire"
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par patient, ID Vitalis, médecin..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as LabRequestStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="sent_to_doctor">Fini et envoyé au médecin</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('');
                setCurrentPage(1);
              }}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Réinitialiser
            </Button>
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
              <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucune demande trouvée</p>
              <p className="text-sm">
                {searchQuery || statusFilter !== 'all' || dateFilter
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucune demande de laboratoire pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>N° Labo</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Examens</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const patient = getPatient(request);
                    const doctor = getDoctor(request);

                    if (!patient.firstName) return null;

                    return (
                      <TableRow key={request.id}>
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
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doctor.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(request.exams || []).slice(0, 2).map((exam: any, idx: number) => (
                              <Badge key={exam.id || idx} variant="outline" className="text-xs">
                                {exam.name || exam}
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
                          <Badge
                            variant="outline"
                            className={getStatusColor(request.status)}
                          >
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {user?.role !== 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/lab/requests/${request.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ouvrir dossier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabRequestsPage;
