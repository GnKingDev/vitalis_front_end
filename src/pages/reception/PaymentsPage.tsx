import React, { useState, useMemo, useEffect } from 'react';
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
  Calendar as CalendarIcon,
  Search,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Shield,
  Percent,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Payment, PaymentType } from '@/types';
import { getReceptionPayments, exportReceptionPayments } from '@/services/api/receptionService';
import { getInsuranceEstablishments } from '@/services/api/insuranceEstablishmentsService';
import type { InsuranceEstablishment } from '@/services/api/insuranceEstablishmentsService';
import { toast } from 'sonner';
import { PatientInsuranceDiscount } from '@/components/shared/PatientInsuranceDiscount';

const PaymentsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PaymentType | 'all'>('all');
  const [insuranceFilter, setInsuranceFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [establishmentFilter, setEstablishmentFilter] = useState<string>('');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedDate, setAppliedDate] = useState<string>('');
  const [appliedMonth, setAppliedMonth] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [appliedType, setAppliedType] = useState<PaymentType | 'all'>('all');
  const [appliedInsuranceFilter, setAppliedInsuranceFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedEstablishmentFilter, setAppliedEstablishmentFilter] = useState<string>('');
  const [appliedDiscountFilter, setAppliedDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [insuranceEstablishments, setInsuranceEstablishments] = useState<InsuranceEstablishment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;

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

  // Charger les paiements depuis l'API
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        
        const monthRange = appliedMonth ? (() => {
          const [y, m] = appliedMonth.split('-').map(Number);
          const first = new Date(y, m - 1, 1);
          const last = new Date(y, m, 0);
          return { dateFrom: first.toISOString().split('T')[0], dateTo: last.toISOString().split('T')[0] };
        })() : null;

        const response = await getReceptionPayments({
          page: currentPage,
          limit: itemsPerPage,
          date: !monthRange && appliedDate ? appliedDate : undefined,
          dateFrom: monthRange?.dateFrom,
          dateTo: monthRange?.dateTo,
          type: appliedType !== 'all' ? appliedType : undefined,
          search: appliedSearch || undefined,
          isInsured: appliedInsuranceFilter === 'yes' ? true : appliedInsuranceFilter === 'no' ? false : undefined,
          hasDiscount: appliedDiscountFilter === 'yes' ? true : appliedDiscountFilter === 'no' ? false : undefined,
          insuranceEstablishmentId: appliedInsuranceFilter === 'yes' && appliedEstablishmentFilter ? appliedEstablishmentFilter : undefined,
        });

        if (response.success && response.data) {
          const paymentsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.payments || [];
          setPayments(paymentsData);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || 0);
          } else {
            setTotalPages(1);
            setTotalItems(paymentsData.length);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des paiements:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les paiements',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, [currentPage, appliedDate, appliedMonth, appliedType, appliedSearch, appliedInsuranceFilter, appliedEstablishmentFilter, appliedDiscountFilter]);

  // Obtenir le patient pour un paiement (depuis les données du paiement)
  const getPatient = (payment: any) => {
    return payment.patient || {};
  };

  // Patient avec assurance/remise du paiement (ce dossier), pas du profil
  const getPatientWithPaymentPercent = (payment: any) => {
    const patient = getPatient(payment);
    const baseNum = payment.amountBase != null ? Number(payment.amountBase) : 0;
    const coveragePercent = baseNum > 0 && payment.insuranceDeduction != null && Number(payment.insuranceDeduction) !== 0
      ? Math.round((Number(payment.insuranceDeduction) / baseNum) * 100)
      : 0;
    const discountPercent = baseNum > 0 && payment.discountDeduction != null && Number(payment.discountDeduction) !== 0
      ? Math.round((Number(payment.discountDeduction) / baseNum) * 100)
      : 0;
    return {
      ...patient,
      payment: { coveragePercent, discountPercent },
    };
  };

  // Réinitialiser la page quand les filtres appliqués changent
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedDate, appliedMonth, appliedType, appliedInsuranceFilter, appliedEstablishmentFilter, appliedDiscountFilter]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedDate(selectedMonth ? '' : selectedDate);
    setAppliedMonth(selectedMonth);
    setAppliedSearch(searchQuery);
    setAppliedType(selectedType);
    setAppliedInsuranceFilter(insuranceFilter);
    setAppliedEstablishmentFilter(insuranceFilter === 'yes' ? establishmentFilter : '');
    setAppliedDiscountFilter(discountFilter);
    setCurrentPage(1);
  };

  // Options mois (24 derniers mois)
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: '', label: 'Tous les mois' }];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      opts.push({ value: val, label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) });
    }
    return opts;
  }, []);

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSelectedDate('');
    setAppliedDate('');
    setSelectedMonth('');
    setAppliedMonth('');
    setSearchQuery('');
    setAppliedSearch('');
    setSelectedType('all');
    setAppliedType('all');
    setInsuranceFilter('all');
    setEstablishmentFilter('');
    setDiscountFilter('all');
    setAppliedInsuranceFilter('all');
    setAppliedEstablishmentFilter('');
    setAppliedDiscountFilter('all');
    setCurrentPage(1);
  };

  // Exporter en Excel
  const handleExportExcel = async () => {
    try {
      const monthRange = appliedMonth ? (() => {
        const [y, m] = appliedMonth.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const last = new Date(y, m, 0);
        return { dateFrom: first.toISOString().split('T')[0], dateTo: last.toISOString().split('T')[0] };
      })() : null;

      const blob = await exportReceptionPayments({
        date: !monthRange && appliedDate ? appliedDate : undefined,
        dateFrom: monthRange?.dateFrom,
        dateTo: monthRange?.dateTo,
        type: appliedType !== 'all' ? appliedType : undefined,
        search: appliedSearch || undefined,
        isInsured: appliedInsuranceFilter === 'yes' ? true : appliedInsuranceFilter === 'no' ? false : undefined,
        hasDiscount: appliedDiscountFilter === 'yes' ? true : appliedDiscountFilter === 'no' ? false : undefined,
        insuranceEstablishmentId: appliedInsuranceFilter === 'yes' && appliedEstablishmentFilter ? appliedEstablishmentFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paiements_${appliedMonth || appliedDate || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Export réussi', { description: 'Le fichier Excel a été téléchargé' });
    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur', { description: error?.message || 'Impossible d\'exporter les paiements' });
    }
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

  // Calculer les statistiques
  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid');
    const pending = payments.filter((p) => p.status === 'pending');
    const totalAmount = paid.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return {
      total: totalItems || payments.length,
      paid: paid.length,
      pending: pending.length,
      totalAmount,
    };
  }, [payments, totalItems]);

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

  const isToday = appliedDate === today;
  const isAllPayments = !appliedDate;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description={isAllPayments ? "Tous les paiements" : isToday ? "Liste des paiements d'aujourd'hui" : `Liste des paiements du ${formatDisplayDate(appliedDate)}`}
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total paiements</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payés</p>
                <p className="text-2xl font-bold text-success">{stats.paid}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Filtre par mois */}
            <div className="space-y-2">
              <Label htmlFor="month-select" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Mois
              </Label>
              <Select
                value={selectedMonth || '__all__'}
                onValueChange={(v) => {
                  setSelectedMonth(v === '__all__' ? '' : v);
                  if (v && v !== '__all__') setSelectedDate('');
                }}
              >
                <SelectTrigger id="month-select">
                  <SelectValue placeholder="Tous les mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((opt) => (
                    <SelectItem key={opt.value || '__all__'} value={opt.value || '__all__'}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélecteur de date */}
            <div className="space-y-2">
              <Label htmlFor="date-select" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
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
                        new Date(selectedDate).toLocaleDateString('fr-FR')
                      ) : (
                        <span>Tous les paiements</span>
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
                          setSelectedMonth('');
                        } else {
                          setSelectedDate('');
                        }
                      }}
                      disabled={(date) => date > new Date()}
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
                      setCurrentPage(1);
                    }}
                    className="whitespace-nowrap"
                  >
                    Jour
                  </Button>
                )}
              </div>
            </div>

            {/* Filtre par type */}
            <div className="space-y-2">
              <Label htmlFor="type-select" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Type de paiement
              </Label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as PaymentType | 'all')}>
                <SelectTrigger id="type-select">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="lab">Laboratoire</SelectItem>
                  <SelectItem value="imaging">Imagerie</SelectItem>
                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre assurance */}
            <div className="space-y-2">
              <Label htmlFor="insurance-filter" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Assurance
              </Label>
              <Select value={insuranceFilter} onValueChange={(v) => { setInsuranceFilter(v as 'all' | 'yes' | 'no'); if (v !== 'yes') setEstablishmentFilter(''); }}>
                <SelectTrigger id="insurance-filter">
                  <SelectValue placeholder="Tous" />
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
                <Label htmlFor="establishment-filter" className="flex items-center gap-2">
                  Assureur
                </Label>
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

            {/* Filtre remise */}
            <div className="space-y-2">
              <Label htmlFor="discount-filter" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Remise
              </Label>
              <Select value={discountFilter} onValueChange={(v) => setDiscountFilter(v as 'all' | 'yes' | 'no')}>
                <SelectTrigger id="discount-filter">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Avec remise</SelectItem>
                  <SelectItem value="no">Sans remise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recherche par ID Vitalis */}
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Rechercher par numéro client (ID Vitalis)
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Ex: VTL-2026-00001"
                  className="pl-10 font-mono"
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
          <div className="flex flex-wrap gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter en Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!appliedDate && !appliedSearch && appliedType === 'all' && appliedInsuranceFilter === 'all' && !appliedEstablishmentFilter && appliedDiscountFilter === 'all'}
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

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liste des paiements ({totalItems || payments.length})</span>
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
                Tous les paiements
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">
                {searchQuery ? 'Aucun paiement trouvé' : 'Aucun paiement enregistré'}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? 'Aucun paiement trouvé pour ce numéro de client'
                  : `Aucun paiement n'a été enregistré le ${formatDisplayDate(appliedDate)}`}
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
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Montant de base</TableHead>
                  <TableHead className="text-right">Déduction assurance</TableHead>
                  <TableHead className="text-right">Déduction remise</TableHead>
                  <TableHead className="text-right">Montant payé</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      Aucun paiement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => {
                    const patient = getPatient(payment);
                    const patientWithPayment = getPatientWithPaymentPercent(payment);

                    return (
                      <TableRow key={payment.id}>
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
                          <Badge variant="outline">
                            {payment.type === 'consultation' ? 'Consultation' : 
                             payment.type === 'lab' ? 'Laboratoire' : 
                             payment.type === 'imaging' ? 'Imagerie' :
                             payment.type === 'pharmacy' ? 'Pharmacie' : payment.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {(payment.amountBase != null && payment.amountBase !== '')
                            ? Number(payment.amountBase).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' GNF'
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {(payment.insuranceDeduction != null && Number(payment.insuranceDeduction) !== 0)
                            ? Number(payment.insuranceDeduction).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' GNF'
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {(payment.discountDeduction != null && Number(payment.discountDeduction) !== 0)
                            ? Number(payment.discountDeduction).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' GNF'
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-semibold text-success">
                            {(payment.amount != null ? Number(payment.amount) : 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} GNF
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {payment.method === 'orange_money' ? (
                              <>
                                <Smartphone className="h-4 w-4 text-warning" />
                                <span className="text-sm">Orange Money</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="h-4 w-4 text-success" />
                                <span className="text-sm">Espèces</span>
                              </>
                            )}
                          </div>
                          {payment.reference && (
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {payment.reference}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={payment.status === 'paid' ? 'default' : 'secondary'}
                            className={
                              payment.status === 'paid'
                                ? 'bg-success text-success-foreground'
                                : payment.status === 'pending'
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-destructive text-destructive-foreground'
                            }
                          >
                            {payment.status === 'paid' ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Payé
                              </>
                            ) : payment.status === 'pending' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                En attente
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Annulé
                              </>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {payments.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || payments.length)} sur {totalItems || payments.length} paiement(s)
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
    </div>
  );
};

export default PaymentsPage;
