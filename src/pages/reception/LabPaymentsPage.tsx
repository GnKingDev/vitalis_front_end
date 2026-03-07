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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Switch } from '@/components/ui/switch';
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
  Shield,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import type { LabRequest, Payment } from '@/types';
import { getReceptionLabPayments, payLabRequest, exportReceptionLabPayments } from '@/services/api/receptionService';
import { getInsuranceEstablishments } from '@/services/api/insuranceEstablishmentsService';
import type { InsuranceEstablishment } from '@/services/api/insuranceEstablishmentsService';
import { getLabRequests } from '@/services/api/labService';
import { getUsers } from '@/services/api/usersService';
import { PatientInsuranceDiscount } from '@/components/shared/PatientInsuranceDiscount';

const LabPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [establishmentFilter, setEstablishmentFilter] = useState<string>('');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [appliedDateFilter, setAppliedDateFilter] = useState('');
  const [appliedInsuranceFilter, setAppliedInsuranceFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedEstablishmentFilter, setAppliedEstablishmentFilter] = useState<string>('');
  const [appliedDiscountFilter, setAppliedDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [insuranceEstablishments, setInsuranceEstablishments] = useState<InsuranceEstablishment[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'orange_money'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [assignToLab, setAssignToLab] = useState(true);
  const [selectedLabId, setSelectedLabId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [confirmAssignLabOpen, setConfirmAssignLabOpen] = useState(false);
  const [confirmPaymentLabOpen, setConfirmPaymentLabOpen] = useState(false);
  const [paymentInsuranceData, setPaymentInsuranceData] = useState({
    isInsured: false,
    establishmentId: '',
    coveragePercent: 0,
    memberNumber: '',
  });
  const [paymentDiscountData, setPaymentDiscountData] = useState({
    hasDiscount: false,
    discountPercent: 0,
  });
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
  const [itemsPerPage] = useState(10);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // Charger les établissements d'assurance (pour le filtre Assureur)
  useEffect(() => {
    const loadEstablishments = async () => {
      try {
        const res = await getInsuranceEstablishments({ isActive: true });
        if (res.success && res.data) setInsuranceEstablishments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setInsuranceEstablishments([]);
      }
    };
    loadEstablishments();
  }, []);

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
        
        // Charger les demandes labo et imagerie (API unique, pagination 10 par page)
        const labResponse = await getReceptionLabPayments({
          date: appliedDateFilter || undefined,
          status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
          search: appliedSearch || undefined,
          page: currentPage,
          limit: 10,
          type: 'all',
          isInsured: appliedInsuranceFilter === 'yes' ? true : appliedInsuranceFilter === 'no' ? false : undefined,
          hasDiscount: appliedDiscountFilter === 'yes' ? true : appliedDiscountFilter === 'no' ? false : undefined,
          insuranceEstablishmentId: appliedInsuranceFilter === 'yes' && appliedEstablishmentFilter ? appliedEstablishmentFilter : undefined,
        });

        let allRequests: any[] = [];
        const pagination = labResponse?.data?.pagination;

        if (labResponse.success && labResponse.data) {
          const requestsData = Array.isArray(labResponse.data)
            ? labResponse.data
            : (labResponse.data.requests || labResponse.data || []);
          allRequests = requestsData.map((r: any) => (r.type ? r : { ...r, type: r.type || 'lab' }));
        }

        setRequests(allRequests);

        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setTotalItems(pagination.totalItems || allRequests.length);
        } else {
          setTotalPages(1);
          setTotalItems(allRequests.length);
        }
        
        console.log('LabPaymentsPage: Pagination mise à jour', {
          totalPages: pagination?.totalPages || 1,
          totalItems: pagination?.totalItems || allRequests.length,
          itemsPerPage: 10,
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
  }, [appliedSearch, appliedStatusFilter, appliedDateFilter, appliedInsuranceFilter, appliedEstablishmentFilter, appliedDiscountFilter, currentPage, itemsPerPage, user?.role, dataRefreshKey]);

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
    setAppliedInsuranceFilter(insuranceFilter);
    setAppliedEstablishmentFilter(insuranceFilter === 'yes' ? establishmentFilter : '');
    setAppliedDiscountFilter(discountFilter);
    setCurrentPage(1);
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
    setInsuranceFilter('all');
    setEstablishmentFilter('');
    setDiscountFilter('all');
    setAppliedSearch('');
    setAppliedStatusFilter('all');
    setAppliedDateFilter('');
    setAppliedInsuranceFilter('all');
    setAppliedEstablishmentFilter('');
    setAppliedDiscountFilter('all');
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      const blob = await exportReceptionLabPayments({
        date: appliedDateFilter || undefined,
        status: appliedStatusFilter !== 'all' ? appliedStatusFilter : undefined,
        search: appliedSearch || undefined,
        isInsured: appliedInsuranceFilter === 'yes' ? true : appliedInsuranceFilter === 'no' ? false : undefined,
        hasDiscount: appliedDiscountFilter === 'yes' ? true : appliedDiscountFilter === 'no' ? false : undefined,
        insuranceEstablishmentId: appliedInsuranceFilter === 'yes' && appliedEstablishmentFilter ? appliedEstablishmentFilter : undefined,
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
    if (paymentInsuranceData.isInsured && !paymentInsuranceData.memberNumber?.trim()) {
      toast.error('Numéro identifiant assureur requis', {
        description: 'Veuillez saisir le numéro d\'identifiant chez l\'assureur lorsque l\'assurance est activée.',
      });
      return;
    }

    try {
      await payLabRequest(selectedRequest.id, {
        method: paymentMethod,
        reference: paymentReference || undefined,
        assignToLab: assignToLab,
        labTechnicianId: assignToLab ? selectedLabId : undefined,
        type: selectedRequest.type || 'lab',
        insurance: paymentInsuranceData.isInsured
          ? {
              isInsured: true,
              establishmentId: paymentInsuranceData.establishmentId || undefined,
              coveragePercent: paymentInsuranceData.coveragePercent,
              memberNumber: paymentInsuranceData.memberNumber?.trim() || undefined,
            }
          : { isInsured: false },
        discount: {
          hasDiscount: paymentDiscountData.hasDiscount,
          discountPercent: paymentDiscountData.hasDiscount ? paymentDiscountData.discountPercent : 0,
        },
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
      setConfirmPaymentLabOpen(false);
      setAssignToLab(true);
      // Réinitialiser avec le premier utilisateur lab si disponible
      if (labUsers.length > 0) {
        setSelectedLabId(labUsers[0].id);
      }
      
      // Forcer le rechargement des données (statut mis à jour)
      setDataRefreshKey((k) => k + 1);
      
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
    const patient = request?.patient || {};
    setPaymentInsuranceData({
      isInsured: !!patient.isInsured,
      establishmentId: patient.insuranceEstablishmentId || patient.insuranceEstablishment?.id || '',
      coveragePercent: patient.insuranceCoveragePercent ?? 0,
      memberNumber: patient.insuranceMemberNumber || '',
    });
    setPaymentDiscountData({
      hasDiscount: !!(patient.hasDiscount && (patient.discountPercent ?? 0) > 0),
      discountPercent: patient.discountPercent ?? 0,
    });
    if (labUsers.length > 0) {
      setSelectedLabId(labUsers[0].id);
    }
  };

  // Calcul montant avec assurance et remise (modal paiement labo/imagerie)
  const paymentAmountBreakdown = useMemo(() => {
    if (!selectedRequest) return { baseAmount: 0, insuranceDeduction: 0, discountDeduction: 0, totalAmount: 0 };
    const base = typeof selectedRequest.totalAmount === 'string'
      ? parseFloat(selectedRequest.totalAmount)
      : Number(selectedRequest.totalAmount) || 0;
    const insDed = paymentInsuranceData.isInsured && paymentInsuranceData.coveragePercent > 0
      ? base * (paymentInsuranceData.coveragePercent / 100)
      : 0;
    const afterInsurance = base - insDed;
    const discDed = paymentDiscountData.hasDiscount && paymentDiscountData.discountPercent > 0
      ? afterInsurance * (paymentDiscountData.discountPercent / 100)
      : 0;
    return {
      baseAmount: base,
      insuranceDeduction: insDed,
      discountDeduction: discDed,
      totalAmount: Math.max(0, afterInsurance - discDed),
    };
  }, [selectedRequest, paymentInsuranceData, paymentDiscountData]);

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
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-filter"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? (
                        new Date(dateFilter).toLocaleDateString('fr-FR')
                      ) : (
                        <span>Tous les paiements</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter ? new Date(dateFilter) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setDateFilter(date.toISOString().split('T')[0]);
                        } else {
                          setDateFilter('');
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateFilter('')}
                    className="whitespace-nowrap"
                  >
                    Tous
                  </Button>
                )}
              </div>
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

            {/* Assurance Filter */}
            <div className="space-y-2">
              <Label htmlFor="insurance-filter" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Assurance
              </Label>
              <Select value={insuranceFilter} onValueChange={(v: any) => { setInsuranceFilter(v); if (v !== 'yes') setEstablishmentFilter(''); }}>
                <SelectTrigger id="insurance-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Assurés</SelectItem>
                  <SelectItem value="no">Non assurés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assureur (visible quand Assurance = Assurés) */}
            {insuranceFilter === 'yes' && (
              <div className="space-y-2">
                <Label htmlFor="establishment-filter">Assureur</Label>
                <Select value={establishmentFilter || 'all'} onValueChange={(v) => setEstablishmentFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger id="establishment-filter">
                    <SelectValue placeholder="Tous les assureurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les assureurs</SelectItem>
                    {insuranceEstablishments.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Remise Filter */}
            <div className="space-y-2">
              <Label htmlFor="discount-filter" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Remise
              </Label>
              <Select value={discountFilter} onValueChange={(v: any) => setDiscountFilter(v)}>
                <SelectTrigger id="discount-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Avec remise</SelectItem>
                  <SelectItem value="no">Sans remise</SelectItem>
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
              disabled={!appliedSearch && appliedStatusFilter === 'all' && !appliedDateFilter && appliedInsuranceFilter === 'all' && !appliedEstablishmentFilter && appliedDiscountFilter === 'all'}
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
                  <TableHead>Assurance</TableHead>
                  <TableHead>Remise</TableHead>
                  <TableHead>N° Demande</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead className="text-right">Montant de base</TableHead>
                  <TableHead className="text-right">Déduction assurance</TableHead>
                  <TableHead className="text-right">Déduction remise</TableHead>
                  <TableHead className="text-right">Montant payé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const amountBase = request.amountBase ?? request.payment?.amountBase ?? request.totalAmount;
                  const insuranceDed = request.insuranceDeduction ?? request.payment?.insuranceDeduction;
                  const discountDed = request.discountDeduction ?? request.payment?.discountDeduction;
                  const amountPaid = request.amount ?? request.payment?.amount ?? request.totalAmount;
                  const patient = getPatient(request);
                  const doctor = getDoctor(request);
                  const isPending = request.status === 'pending';
                  // Assurance / remise du dossier (demande), pas du profil patient
                  const baseNum = amountBase != null ? Number(amountBase) : 0;
                  const paymentForRow = baseNum > 0 ? {
                    coveragePercent: insuranceDed != null && Number(insuranceDed) !== 0
                      ? Math.round((Number(insuranceDed) / baseNum) * 100)
                      : null,
                    discountPercent: discountDed != null && Number(discountDed) !== 0
                      ? Math.round((Number(discountDed) / baseNum) * 100)
                      : null,
                  } : null;
                  const patientWithPayment = paymentForRow
                    ? { ...patient, payment: paymentForRow }
                    : patient;

                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        {patient.firstName ? (
                          <p className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
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
                        <PatientInsuranceDiscount patient={patientWithPayment} column="assurance" usePaymentPercent />
                      </TableCell>
                      <TableCell>
                        <PatientInsuranceDiscount patient={patientWithPayment} column="remise" usePaymentPercent />
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
                      <TableCell className="text-right text-muted-foreground">
                        {amountBase != null && amountBase !== ''
                          ? (typeof amountBase === 'string' ? parseFloat(amountBase) : amountBase).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' GNF'
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {(insuranceDed != null && Number(insuranceDed) !== 0)
                          ? Number(insuranceDed).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' GNF'
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {(discountDed != null && Number(discountDed) !== 0)
                          ? Number(discountDed).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' GNF'
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-semibold text-success">
                          {(amountPaid != null ? (typeof amountPaid === 'string' ? parseFloat(amountPaid) : amountPaid) : 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} GNF
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enregistrer le paiement</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Patient: {getPatient(selectedRequest).firstName}{' '}
                  {getPatient(selectedRequest).lastName}
                  <br />
                  Montant de base: <strong>{paymentAmountBreakdown.baseAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GNF</strong>
                  {paymentAmountBreakdown.insuranceDeduction > 0 && (
                    <> — Déduction assurance: -{paymentAmountBreakdown.insuranceDeduction.toLocaleString('fr-FR')} GNF</>
                  )}
                  {paymentAmountBreakdown.discountDeduction > 0 && (
                    <> — Remise: -{paymentAmountBreakdown.discountDeduction.toLocaleString('fr-FR')} GNF</>
                  )}
                  <br />
                  <strong>Total à payer: {paymentAmountBreakdown.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GNF</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Assurance */}
            <div className="space-y-4 rounded-lg border p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">Patient assuré</span>
                </div>
                <Switch
                  checked={paymentInsuranceData.isInsured}
                  onCheckedChange={(checked) =>
                    setPaymentInsuranceData((prev) => ({
                      ...prev,
                      isInsured: checked,
                      establishmentId: checked ? prev.establishmentId : '',
                      coveragePercent: checked ? prev.coveragePercent : 0,
                      memberNumber: checked ? prev.memberNumber : '',
                    }))
                  }
                />
              </div>
              {paymentInsuranceData.isInsured && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Établissement d'assurance</Label>
                      <Select
                        value={paymentInsuranceData.establishmentId}
                        onValueChange={(value) =>
                          setPaymentInsuranceData((prev) => ({ ...prev, establishmentId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir l'établissement" />
                        </SelectTrigger>
                        <SelectContent>
                          {insuranceEstablishments.map((est) => (
                            <SelectItem key={est.id} value={est.id}>
                              {est.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Couverture (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Ex: 80"
                        value={paymentInsuranceData.coveragePercent || ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                          setPaymentInsuranceData((prev) => ({ ...prev, coveragePercent: v }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>N° identifiant assureur <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Ex. numéro de contrat, matricule..."
                      value={paymentInsuranceData.memberNumber}
                      onChange={(e) =>
                        setPaymentInsuranceData((prev) => ({ ...prev, memberNumber: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Remise */}
            <div className="space-y-4 rounded-lg border p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  <span className="font-medium">Bénéficie d'une remise</span>
                </div>
                <Switch
                  checked={paymentDiscountData.hasDiscount}
                  onCheckedChange={(checked) =>
                    setPaymentDiscountData((prev) => ({
                      ...prev,
                      hasDiscount: checked,
                      discountPercent: checked ? prev.discountPercent : 0,
                    }))
                  }
                />
              </div>
              {paymentDiscountData.hasDiscount && (
                <div className="pt-2 border-t space-y-2">
                  <Label>Pourcentage de remise (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Ex: 10"
                    value={paymentDiscountData.discountPercent || ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value)));
                      setPaymentDiscountData((prev) => ({ ...prev, discountPercent: v }));
                    }}
                  />
                </div>
              )}
            </div>

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
                <Button
                  onClick={() => {
                    if (paymentInsuranceData.isInsured && !paymentInsuranceData.memberNumber?.trim()) {
                      toast.error('Numéro identifiant assureur requis', {
                        description: 'Veuillez saisir le numéro d\'identifiant chez l\'assureur lorsque l\'assurance est activée.',
                      });
                      return;
                    }
                    setConfirmPaymentLabOpen(true);
                  }}
                  className="gap-2"
                >
              <CheckCircle2 className="h-4 w-4" />
              {assignToLab ? 'Encaisser et assigner' : 'Encaisser'}
            </Button>
          </DialogFooter>

          {/* Confirmation encaissement paiement labo */}
          <AlertDialog open={confirmPaymentLabOpen} onOpenChange={setConfirmPaymentLabOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'encaissement</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedRequest && (
                    <>
                      Êtes-vous sûr de vouloir enregistrer le paiement de la demande{' '}
                      <strong>{selectedRequest.id}</strong> —{' '}
                      <strong>{paymentAmountBreakdown.totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GNF</strong> par{' '}
                      <strong>{paymentMethod === 'cash' ? 'Espèces' : 'Orange Money'}</strong>
                      {paymentInsuranceData.isInsured && ` (assurance ${paymentInsuranceData.coveragePercent}%)`}
                      {paymentDiscountData.hasDiscount && ` (remise ${paymentDiscountData.discountPercent}%)`} ?
                      {assignToLab && (
                        <>
                          <br /><br />
                          La demande sera également assignée au laboratoire{' '}
                          <strong>{labUsers.find(l => l.id === selectedLabId)?.name || 'sélectionné'}</strong>.
                        </>
                      )}
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmPaymentLabOpen(false);
                    handlePayment();
                  }}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {assignToLab ? 'Encaisser et assigner' : 'Encaisser'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
              onClick={() => setConfirmAssignLabOpen(true)}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Confirmer l'assignation
            </Button>
          </DialogFooter>

          {/* Confirmation assignation labo */}
          <AlertDialog open={confirmAssignLabOpen} onOpenChange={setConfirmAssignLabOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'assignation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir assigner cette demande au laboratoire{' '}
                  <strong>{labUsers.find(lab => lab.id === assignLabId)?.name || 'sélectionné'}</strong> ?
                  {selectedRequest && (
                    <>
                      <br /><br />
                      Patient: {getPatient(selectedRequest).firstName} {getPatient(selectedRequest).lastName}
                      <br />
                      N° Demande: <strong>{selectedRequest.id}</strong>
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmAssignLabOpen(false);
                    const selectedLab = labUsers.find(lab => lab.id === assignLabId);
                    toast.success(`Demande assignée à ${selectedLab?.name || 'le laboratoire'}`);
                    setIsAssignDialogOpen(false);
                    setSelectedRequest(null);
                    if (labUsers.length > 0) {
                      setAssignLabId(labUsers[0].id);
                    }
                  }}
                  className="gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Confirmer l'assignation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabPaymentsPage;
