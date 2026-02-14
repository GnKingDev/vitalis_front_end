import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  CreditCard,
  Search,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  FlaskConical,
  Calendar as CalendarIcon,
  User,
  FileText,
  UserCheck,
  Filter,
  RotateCcw,
  Download,
  Eye,
  TestTube2,
  Scan,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import type { LabRequest, Payment } from '@/types';
import { getReceptionLabPayments, payLabRequest, exportReceptionLabPayments } from '@/services/api/receptionService';
import { getLabRequests } from '@/services/api/labService';
import { getImagingRequests } from '@/services/api/imagingService';
import { getUsers } from '@/services/api/usersService';

const LabPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [appliedDateFilter, setAppliedDateFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'orange_money'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [assignToLab, setAssignToLab] = useState(true);
  const [selectedLabId, setSelectedLabId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignLabId, setAssignLabId] = useState<string>('');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [labUsers, setLabUsers] = useState<any[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Charger les utilisateurs de type "lab"
  useEffect(() => {
    const loadLabUsers = async () => {
      try {
        setIsLoadingLabs(true);
        const response = await getUsers({ role: 'lab' });
        
        if (response.success && response.data) {
          const users = Array.isArray(response.data) 
            ? response.data 
            : response.data.users || response.data || [];
          
          setLabUsers(users);
          
          // Définir le premier utilisateur lab comme sélection par défaut
          if (users.length > 0 && !selectedLabId) {
            setSelectedLabId(users[0].id);
            setAssignLabId(users[0].id);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des utilisateurs lab:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les laboratoires',
        });
      } finally {
        setIsLoadingLabs(false);
      }
    };

    loadLabUsers();
  }, []);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les demandes labo et imagerie
        const [labResponse, imagingResponse] = await Promise.all([
          getReceptionLabPayments({
            date: appliedDateFilter || undefined,
            status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
            search: appliedSearch || undefined,
            page: currentPage,
            limit: itemsPerPage,
          }),
          getImagingRequests({
            date: appliedDateFilter || undefined,
            status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
            search: appliedSearch || undefined,
            page: currentPage,
            limit: itemsPerPage,
          }),
        ]);

        let allRequests: any[] = [];

        let labPagination: any = null;
        let imagingPagination: any = null;

        if (labResponse.success && labResponse.data) {
          // Le backend peut retourner les données dans data.requests ou directement dans data
          const labRequests = Array.isArray(labResponse.data) 
            ? labResponse.data 
            : (labResponse.data.requests || labResponse.data || []);
          console.log('LabPaymentsPage: Demandes labo reçues', labRequests);
          console.log('LabPaymentsPage: Structure de labResponse.data', labResponse.data);
          allRequests = [...allRequests, ...labRequests.map((r: any) => ({ ...r, type: 'lab' }))];
          
          // Extraire les informations de pagination
          if (labResponse.data.pagination) {
            labPagination = labResponse.data.pagination;
          }
        }

        if (imagingResponse.success && imagingResponse.data) {
          const imagingRequests = Array.isArray(imagingResponse.data) 
            ? imagingResponse.data 
            : imagingResponse.data.requests || [];
          console.log('LabPaymentsPage: Demandes imagerie reçues', imagingRequests);
          allRequests = [...allRequests, ...imagingRequests.map((r: any) => ({ ...r, type: 'imaging' }))];
          
          // Extraire les informations de pagination
          if (imagingResponse.data.pagination) {
            imagingPagination = imagingResponse.data.pagination;
          }
        }

        // Le filtrage par statut est déjà fait par le backend via les paramètres de requête
        // On ne filtre plus côté frontend pour la réception, le backend gère déjà cela
        // Si le backend retourne des données, on les affiche

        console.log('LabPaymentsPage: Toutes les demandes avant affichage', allRequests);
        setRequests(allRequests);

        // Mettre à jour la pagination (utiliser la pagination de lab si disponible, sinon celle d'imagerie)
        // Si les deux réponses ont une pagination, on prend celle qui a le plus d'éléments
        if (labPagination && imagingPagination) {
          // Prendre la pagination avec le plus grand totalItems
          const labTotal = labPagination.totalItems || 0;
          const imagingTotal = imagingPagination.totalItems || 0;
          if (labTotal >= imagingTotal) {
            setTotalPages(labPagination.totalPages || 1);
            setTotalItems(labPagination.totalItems || allRequests.length);
            setItemsPerPage(labPagination.itemsPerPage || 10);
          } else {
            setTotalPages(imagingPagination.totalPages || 1);
            setTotalItems(imagingPagination.totalItems || allRequests.length);
            setItemsPerPage(imagingPagination.itemsPerPage || 10);
          }
        } else if (labPagination) {
          setTotalPages(labPagination.totalPages || 1);
          setTotalItems(labPagination.totalItems || allRequests.length);
          setItemsPerPage(labPagination.itemsPerPage || 10);
        } else if (imagingPagination) {
          setTotalPages(imagingPagination.totalPages || 1);
          setTotalItems(imagingPagination.totalItems || allRequests.length);
          setItemsPerPage(imagingPagination.itemsPerPage || 10);
        } else {
          // Si aucune pagination n'est fournie, calculer à partir des données
          setTotalPages(1);
          setTotalItems(allRequests.length);
          setItemsPerPage(10);
        }
        
        console.log('LabPaymentsPage: Pagination mise à jour', {
          totalPages: labPagination?.totalPages || imagingPagination?.totalPages || 1,
          totalItems: labPagination?.totalItems || imagingPagination?.totalItems || allRequests.length,
          itemsPerPage: labPagination?.itemsPerPage || imagingPagination?.itemsPerPage || 10,
        });

        // Calculer les statistiques
        const pending = allRequests.filter((r) => !r.paymentId && r.status === 'pending');
        const totalAmount = allRequests.reduce((sum, r) => {
          const amount = typeof r.totalAmount === 'string' 
            ? parseFloat(r.totalAmount) 
            : (r.totalAmount || 0);
          return sum + amount;
        }, 0);
        const pendingAmount = pending.reduce((sum, r) => {
          const amount = typeof r.totalAmount === 'string' 
            ? parseFloat(r.totalAmount) 
            : (r.totalAmount || 0);
          return sum + amount;
        }, 0);

        setStats({
          total: allRequests.length,
          pending: pending.length,
          totalAmount,
          pendingAmount,
        });
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les demandes',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [appliedSearch, appliedStatusFilter, appliedDateFilter, currentPage, itemsPerPage, user?.role]);

  // Get patient for a request (depuis les données de la requête)
  const getPatient = (request: any) => {
    return request.patient || {};
  };

  // Get doctor for a request (depuis les données de la requête)
  const getDoctor = (request: any) => {
    return request.doctor || {};
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedStatusFilter(statusFilter);
    setAppliedDateFilter(dateFilter);
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Show first few pages
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last few pages
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current
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

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('');
    setAppliedSearch('');
    setAppliedStatusFilter('all');
    setAppliedDateFilter('');
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      const blob = await exportReceptionLabPayments({
        date: appliedDateFilter || undefined,
        status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
        search: appliedSearch || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paiements_labo_imagerie_${appliedDateFilter || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        description: error?.message || 'Impossible d\'exporter les données',
      });
    }
  };

  // Handle payment and assignment
  const handlePayment = async () => {
    if (!selectedRequest) return;

    try {
      await payLabRequest(selectedRequest.id, {
        method: paymentMethod,
        reference: paymentReference || undefined,
        assignToLab: assignToLab,
        labTechnicianId: assignToLab ? selectedLabId : undefined,
        type: selectedRequest.type || 'lab', // Inclure le type (lab ou imaging)
      });

      if (assignToLab) {
        const selectedLab = labUsers.find(lab => lab.id === selectedLabId);
        toast.success(`Paiement enregistré et demande assignée à ${selectedLab?.name || 'le laboratoire'}.`);
      } else {
        toast.success('Paiement enregistré avec succès.');
      }
      
      setIsPaymentDialogOpen(false);
      setSelectedRequest(null);
      setPaymentReference('');
      setAssignToLab(true);
      // Réinitialiser avec le premier utilisateur lab si disponible
      if (labUsers.length > 0) {
        setSelectedLabId(labUsers[0].id);
      }
      
      // Recharger les données
      setAppliedSearch('');
      setAppliedStatusFilter('all');
      setAppliedDateFilter('');
      setSearchQuery('');
      setStatusFilter('all');
      setDateFilter('');
    } catch (error: any) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'enregistrer le paiement',
      });
    }
  };

  // Open payment dialog
  const openPaymentDialog = (request: any) => {
    setSelectedRequest(request);
    setIsPaymentDialogOpen(true);
    setPaymentMethod('cash');
    setPaymentReference('');
    setAssignToLab(true);
    // Utiliser le premier utilisateur lab comme sélection par défaut
    if (labUsers.length > 0) {
      setSelectedLabId(labUsers[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements Labo et Imagerie"
        description="Gérer les paiements des demandes d'examens de laboratoire et d'imagerie"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total demandes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GNF
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold text-success">
                  {stats.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GNF
                </p>
              </div>
              <Banknote className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom patient, ID Vitalis ou N° demande"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date-filter" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Statut
              </Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-4 justify-end">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter en Excel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!appliedSearch && appliedStatusFilter === 'all' && !appliedDateFilter}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleApplyFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Appliquer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de laboratoire et imagerie ({requests.length})</CardTitle>
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
                {searchQuery
                  ? 'Aucune demande ne correspond à votre recherche'
                  : 'Aucune demande de laboratoire enregistrée'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID Vitalis</TableHead>
                  <TableHead>N° Demande</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const patient = getPatient(request);
                  const doctor = getDoctor(request);
                  // Le bouton s'affiche si le statut est "pending", indépendamment de paymentId
                  const isPending = request.status === 'pending';

                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        {patient.firstName ? (
                          <div>
                            <p className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Patient inconnu</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.vitalisId ? (
                          <Badge variant="outline" className="font-mono">
                            {patient.vitalisId}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {request.id}
                        </Badge>
                        {request.type && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {request.type === 'imaging' ? 'Imagerie' : 'Labo'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.name ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doctor.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-success">
                          {(() => {
                            const amount = typeof request.totalAmount === 'string' 
                              ? parseFloat(request.totalAmount) 
                              : (request.totalAmount || 0);
                            return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()} GNF
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={
                          // Utiliser paymentStatus en priorité s'il existe, sinon requestStatus, sinon status
                          request.paymentStatus === 'paid' || request.status === 'paid'
                            ? 'paid'
                            : request.requestStatus === 'pending' || request.status === 'pending'
                            ? 'pending'
                            : request.paymentStatus || request.requestStatus || request.status || 'pending'
                        } />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => openPaymentDialog(request)}
                              className="gap-2"
                            >
                              <CreditCard className="h-4 w-4" />
                              Encaisser et assigner
                            </Button>
                          )}
                          {(request.status === 'paid' || request.paymentStatus === 'paid' || request.paymentId) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDetailRequest(request);
                                setIsDetailDialogOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Détail
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} demande(s)
              </div>
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
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
                              handlePageChange(page as number);
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
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enregistrer le paiement</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Patient: {getPatient(selectedRequest).firstName}{' '}
                  {getPatient(selectedRequest).lastName}
                  <br />
                  Montant: <strong>{(() => {
                    const amount = typeof selectedRequest.totalAmount === 'string' 
                      ? parseFloat(selectedRequest.totalAmount) 
                      : (selectedRequest.totalAmount || 0);
                    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  })()} GNF</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Mode de paiement</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: 'cash' | 'orange_money') => setPaymentMethod(value)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                  <Label
                    htmlFor="cash"
                    className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Espèces</p>
                      <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="orange_money"
                    id="orange_money"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="orange_money"
                    className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">Orange Money</p>
                      <p className="text-sm text-muted-foreground">Paiement mobile</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reference (for Orange Money) */}
            {paymentMethod === 'orange_money' && (
              <div className="space-y-2">
                <Label htmlFor="reference">Numéro de transaction (optionnel)</Label>
                <Input
                  id="reference"
                  placeholder="Ex: OM-20260128-001"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            {/* Assign to lab option */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assign-lab"
                  checked={assignToLab}
                  onCheckedChange={(checked) => setAssignToLab(checked === true)}
                />
                <Label
                  htmlFor="assign-lab"
                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-primary" />
                  Assigner au laboratoire après paiement
                </Label>
              </div>
              
              {assignToLab && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="lab-select" className="text-sm">
                    Choisir le laboratoire
                  </Label>
                  <Select
                    value={selectedLabId}
                    onValueChange={setSelectedLabId}
                  >
                    <SelectTrigger id="lab-select">
                      <SelectValue placeholder="Sélectionner un laboratoire" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLabs ? (
                        <SelectItem value="loading" disabled>Chargement...</SelectItem>
                      ) : labUsers.length > 0 ? (
                        labUsers.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-lab" disabled>Aucun laboratoire disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePayment} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {assignToLab ? 'Encaisser et assigner' : 'Encaisser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailRequest?.type === 'imaging' ? (
                <Scan className="h-5 w-5 text-primary" />
              ) : (
                <TestTube2 className="h-5 w-5 text-primary" />
              )}
              Détails de la demande - {detailRequest?.type === 'imaging' ? 'Imagerie' : 'Laboratoire'}
            </DialogTitle>
            <DialogDescription>
              N° Demande: <strong>{detailRequest?.id}</strong>
            </DialogDescription>
          </DialogHeader>

          {detailRequest && (
            <div className="space-y-6 py-4">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Informations du patient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nom complet</Label>
                      <p className="font-semibold">
                        {getPatient(detailRequest).firstName || ''} {getPatient(detailRequest).lastName || ''}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">ID Vitalis</Label>
                      <p className="font-semibold">{getPatient(detailRequest).vitalisId || '-'}</p>
                    </div>
                    {getPatient(detailRequest).phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Téléphone
                        </Label>
                        <p className="font-semibold">{getPatient(detailRequest).phone}</p>
                      </div>
                    )}
                    {getPatient(detailRequest).email && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Label>
                        <p className="font-semibold">{getPatient(detailRequest).email}</p>
                      </div>
                    )}
                    {getPatient(detailRequest).age && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Âge</Label>
                        <p className="font-semibold">{getPatient(detailRequest).age} ans</p>
                      </div>
                    )}
                    {getPatient(detailRequest).gender && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Sexe</Label>
                        <p className="font-semibold">
                          {getPatient(detailRequest).gender === 'M' ? 'Masculin' : 'Féminin'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Informations du médecin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nom du médecin</Label>
                      <p className="font-semibold">{getDoctor(detailRequest).name || '-'}</p>
                    </div>
                    {getDoctor(detailRequest).email && (
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </Label>
                        <p className="font-semibold">{getDoctor(detailRequest).email}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lab Assignment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    Assignation au laboratoire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detailRequest.labTechnician ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{detailRequest.labTechnician.name || '-'}</p>
                          {detailRequest.labTechnician.email && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {detailRequest.labTechnician.email}
                            </p>
                          )}
                          {detailRequest.labTechnician.id && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {detailRequest.labTechnician.id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : detailRequest.labTechnicianId ? (
                    (() => {
                      // Fallback: chercher dans labUsers si labTechnician n'est pas disponible
                      const assignedLab = labUsers.find((lab) => lab.id === detailRequest.labTechnicianId);
                      return assignedLab ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{assignedLab.name}</p>
                              {assignedLab.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {assignedLab.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Laboratoire assigné (ID: {detailRequest.labTechnicianId})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Les informations du laboratoire ne sont pas disponibles
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-4">
                      <UserCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">Aucun laboratoire assigné</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Informations de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Montant total</Label>
                      <p className="font-semibold text-lg text-primary">
                        {(() => {
                          const amount = typeof detailRequest.totalAmount === 'string' 
                            ? parseFloat(detailRequest.totalAmount) 
                            : (detailRequest.totalAmount || 0);
                          return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()} GNF
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Statut du paiement</Label>
                      <div className="mt-1">
                        <StatusBadge status={
                          detailRequest.paymentStatus === 'paid' || detailRequest.status === 'paid'
                            ? 'paid'
                            : 'pending'
                        } />
                      </div>
                    </div>
                    {detailRequest.paymentId && (
                      <div>
                        <Label className="text-xs text-muted-foreground">ID Paiement</Label>
                        <p className="font-semibold font-mono text-xs">{detailRequest.paymentId}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Statut de la demande</Label>
                      <div className="mt-1">
                        <StatusBadge status={detailRequest.requestStatus || detailRequest.status || 'pending'} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Date de création
                      </Label>
                      <p className="font-semibold">
                        {new Date(detailRequest.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Lab Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assigner au laboratoire</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Patient: {getPatient(selectedRequest).firstName}{' '}
                  {getPatient(selectedRequest).lastName}
                  <br />
                  N° Demande: <strong>{selectedRequest.id}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-lab-select">Choisir le laboratoire</Label>
              <Select
                value={assignLabId}
                onValueChange={setAssignLabId}
              >
                <SelectTrigger id="assign-lab-select">
                  <SelectValue placeholder="Sélectionner un laboratoire" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingLabs ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : labUsers.length > 0 ? (
                    labUsers.map((lab) => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-lab" disabled>Aucun laboratoire disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                const selectedLab = labUsers.find(lab => lab.id === assignLabId);
                toast.success(`Demande assignée à ${selectedLab?.name || 'le laboratoire'}`);
                setIsAssignDialogOpen(false);
                setSelectedRequest(null);
                // Réinitialiser avec le premier utilisateur lab si disponible
                if (labUsers.length > 0) {
                  setAssignLabId(labUsers[0].id);
                }
              }}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Confirmer l'assignation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabPaymentsPage;
