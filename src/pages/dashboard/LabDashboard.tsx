import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  TestTube2,
  Clock,
  Activity,
  FileCheck,
  ArrowRight,
  User,
  Printer,
  Eye,
} from 'lucide-react';
import { getLabRequests } from '@/services/api/labService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const LabDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [completedToday, setCompletedToday] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        // Charger les demandes en attente (payées)
        const pendingResponse = await getLabRequests({ 
          status: 'pending',
          date: today 
        });
        if (pendingResponse.success && pendingResponse.data) {
          const requests = Array.isArray(pendingResponse.data) 
            ? pendingResponse.data 
            : pendingResponse.data.requests || [];
          // Filtrer uniquement les demandes avec paymentId ET status 'pending'
          const filteredPending = requests.filter((r: any) => 
            r.paymentId && r.status === 'pending'
          );
          setPendingRequests(filteredPending);
        }

        // Charger les résultats envoyés au médecin
        const completedResponse = await getLabRequests({ 
          status: 'sent_to_doctor',
          date: today 
        });
        if (completedResponse.success && completedResponse.data) {
          const requests = Array.isArray(completedResponse.data) 
            ? completedResponse.data 
            : completedResponse.data.requests || [];
          // Filtrer uniquement les demandes avec status 'sent_to_doctor'
          const filteredCompleted = requests.filter((r: any) => 
            r.status === 'sent_to_doctor'
          );
          setCompletedToday(filteredCompleted);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les données du dashboard',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Pagination for completed results
  const totalPages = Math.ceil(completedToday.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompleted = completedToday.slice(startIndex, endIndex);

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
        title="Laboratoire"
        description="Gestion des examens et résultats"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Examens en attente"
          value={pendingRequests.length}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Fini et envoyé au médecin"
          value={completedToday.length}
          icon={FileCheck}
          variant="success"
        />
        <StatsCard
          title="Total aujourd'hui"
          value={pendingRequests.length + completedToday.length}
          icon={TestTube2}
          variant="default"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Examens en attente
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab/pending" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun examen en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => {
                  const patient = request.patient || {};
                  const doctor = request.doctor || {};
                  return (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.vitalisId} • Prescrit par {doctor.name || 'Non assigné'}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(request.exams || []).map((exam: any, idx: number) => (
                          <Badge key={exam.id || idx} variant="outline" className="text-xs">
                            {exam.name || exam}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" className="w-full">
                        Commencer l'analyse
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed results */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-success" />
              Résultats prêts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab/results" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {completedToday.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucun résultat disponible</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Examens</TableHead>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCompleted.map((request) => {
                        const patient = request.patient || {};
                        const doctor = request.doctor || {};
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                  <User className="h-4 w-4 text-success" />
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
                              <div className="flex flex-wrap gap-1">
                                {(request.exams || []).slice(0, 2).map((exam: any, idx: number) => (
                                  <Badge key={exam.id || idx} variant="outline" className="text-xs">
                                    {(exam.name || exam).substring(0, 15)}...
                                  </Badge>
                                ))}
                                {(request.exams || []).length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(request.exams || []).length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {doctor.name || 'Non assigné'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={request.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate(`/lab/requests/${request.id}`)}
                                  className="gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Détail
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {request.status === 'pending' && (
                                  <Button size="sm">
                                    Envoyer au médecin
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {completedToday.length > 0 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Affichage de {startIndex + 1} à {Math.min(endIndex, completedToday.length)} sur {completedToday.length} résultat(s)
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
    </div>
  );
};

export default LabDashboard;
