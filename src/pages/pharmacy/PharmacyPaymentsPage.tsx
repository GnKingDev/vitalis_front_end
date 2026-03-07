import React, { useState, useMemo, useEffect } from 'react';
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
  CreditCard,
  Calendar as CalendarIcon,
  Search,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Plus,
  X,
  Package,
  Download,
  Shield,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Payment, PaymentMethod, PaymentStatus, PharmacyProduct } from '@/types';
import { getPharmacyPayments, getPharmacyProducts, createPharmacyPayment, exportPharmacyPayments } from '@/services/api/pharmacyService';
import { getInsuranceEstablishments } from '@/services/api/insuranceEstablishmentsService';
import type { InsuranceEstablishment } from '@/services/api/insuranceEstablishmentsService';
import { getPatients } from '@/services/api/patientsService';
import { PatientInsuranceDiscount } from '@/components/shared/PatientInsuranceDiscount';

interface SelectedProduct {
  product: PharmacyProduct;
  quantity: number;
}

const PharmacyPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [establishmentFilter, setEstablishmentFilter] = useState<string>('');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState<PaymentStatus | 'all'>('all');
  const [appliedDate, setAppliedDate] = useState('');
  const [appliedInsuranceFilter, setAppliedInsuranceFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedEstablishmentFilter, setAppliedEstablishmentFilter] = useState<string>('');
  const [appliedDiscountFilter, setAppliedDiscountFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [insuranceEstablishments, setInsuranceEstablishments] = useState<InsuranceEstablishment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Create payment dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [patientId, setPatientId] = useState('');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [availableProducts, setAvailableProducts] = useState<PharmacyProduct[]>([]);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
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

  const itemsPerPage = 10;

  // Pré-remplir assurance/remise depuis le patient quand il est sélectionné
  useEffect(() => {
    if (!patientInfo || !isCreateDialogOpen) return;
    const p = patientInfo as any;
    if (p.isInsured && p.insuranceEstablishmentId) {
      setPaymentInsuranceData((prev) => ({
        ...prev,
        isInsured: true,
        establishmentId: p.insuranceEstablishmentId || prev.establishmentId,
        coveragePercent: p.insuranceCoveragePercent ?? prev.coveragePercent,
      }));
    }
    if (p.hasDiscount && p.discountPercent != null) {
      setPaymentDiscountData((prev) => ({
        ...prev,
        hasDiscount: true,
        discountPercent: p.discountPercent ?? prev.discountPercent,
      }));
    }
  }, [patientInfo?.id, isCreateDialogOpen]);

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
        const response = await getPharmacyPayments({
          page: currentPage,
          limit: itemsPerPage,
          date: appliedDate || undefined,
          status: appliedStatus !== 'all' ? appliedStatus : undefined,
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
            setTotalItems(response.data.pagination.totalItems || paymentsData.length);
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
  }, [currentPage, appliedSearch, appliedStatus, appliedDate, appliedInsuranceFilter, appliedEstablishmentFilter, appliedDiscountFilter]);

  // Charger les produits disponibles pour la création de paiement
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getPharmacyProducts({
          limit: 1000, // Charger tous les produits disponibles
        });

        if (response.success && response.data) {
          const productsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.products || [];
          setAvailableProducts(productsData.filter((p: any) => p.stock > 0));
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des produits:', error);
      }
    };

    if (isCreateDialogOpen) {
      loadProducts();
    }
  }, [isCreateDialogOpen]);

  // Rechercher un patient par ID Vitalis
  useEffect(() => {
    const searchPatient = async () => {
      if (!patientId.trim()) {
        setPatientInfo(null);
        return;
      }

      try {
        const response = await getPatients({
          search: patientId,
          limit: 1,
        });

        if (response.success && response.data?.patients?.length > 0) {
          const foundPatient = response.data.patients.find(
            (p: any) => p.vitalisId?.toLowerCase() === patientId.toLowerCase()
          );
          setPatientInfo(foundPatient || response.data.patients[0]);
        } else {
          setPatientInfo(null);
        }
      } catch (error: any) {
        console.error('Erreur lors de la recherche du patient:', error);
        setPatientInfo(null);
      }
    };

    const timeoutId = setTimeout(searchPatient, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [patientId]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedDate(dateFilter);
    setAppliedStatus(statusFilter);
    setAppliedSearch(searchQuery);
    setAppliedInsuranceFilter(insuranceFilter);
    setAppliedEstablishmentFilter(insuranceFilter === 'yes' ? establishmentFilter : '');
    setAppliedDiscountFilter(discountFilter);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setDateFilter('');
    setStatusFilter('all');
    setSearchQuery('');
    setInsuranceFilter('all');
    setEstablishmentFilter('');
    setDiscountFilter('all');
    setAppliedDate('');
    setAppliedStatus('all');
    setAppliedSearch('');
    setAppliedInsuranceFilter('all');
    setAppliedEstablishmentFilter('');
    setAppliedDiscountFilter('all');
    setCurrentPage(1);
  };

  // Exporter en Excel
  const handleExportExcel = async () => {
    try {
      const blob = await exportPharmacyPayments({
        date: appliedDate || undefined,
        status: appliedStatus !== 'all' ? appliedStatus : undefined,
        search: appliedSearch || undefined,
        isInsured: appliedInsuranceFilter === 'yes' ? true : appliedInsuranceFilter === 'no' ? false : undefined,
        hasDiscount: appliedDiscountFilter === 'yes' ? true : appliedDiscountFilter === 'no' ? false : undefined,
        insuranceEstablishmentId: appliedInsuranceFilter === 'yes' && appliedEstablishmentFilter ? appliedEstablishmentFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paiements_pharmacie_${appliedDate || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  // Gérer la touche Entrée pour la recherche
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
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

  // Statistiques
  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid');
    const pending = payments.filter((p) => p.status === 'pending');
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidAmount = paid.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      total: payments.length,
      paid: paid.length,
      pending: pending.length,
      totalAmount,
      paidAmount,
    };
  }, [payments]);

  // Obtenir l'icône de méthode de paiement
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    return method === 'orange_money' ? Smartphone : Banknote;
  };

  // Obtenir le label de méthode de paiement
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    return method === 'orange_money' ? 'Orange Money' : 'Espèces';
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Payé
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        );
    }
  };

  // Filter products for selection
  const filteredAvailableProducts = useMemo(() => {
    if (!productSearch) return availableProducts;
    const query = productSearch.toLowerCase();
    return availableProducts.filter(
      p => (
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
      )
    );
  }, [productSearch, availableProducts]);

  // Calculate total amount (base) and final amount (after assurance + remise)
  const totalAmount = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }, [selectedProducts]);

  const { finalAmount, insuranceDeduction, discountDeduction } = useMemo(() => {
    const base = totalAmount;
    const insPercent = paymentInsuranceData.isInsured ? (paymentInsuranceData.coveragePercent || 0) : 0;
    const discPercent = paymentDiscountData.hasDiscount ? (paymentDiscountData.discountPercent || 0) : 0;
    const insDed = base * (insPercent / 100);
    const afterIns = base - insDed;
    const discDed = afterIns * (discPercent / 100);
    const final = Math.max(0, Math.round((afterIns - discDed) * 100) / 100);
    return {
      finalAmount: final,
      insuranceDeduction: insDed,
      discountDeduction: discDed,
    };
  }, [totalAmount, paymentInsuranceData.isInsured, paymentInsuranceData.coveragePercent, paymentDiscountData.hasDiscount, paymentDiscountData.discountPercent]);

  // Add product to selection
  const handleAddProduct = (product: PharmacyProduct) => {
    const existing = selectedProducts.find(sp => sp.product.id === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.map(sp =>
        sp.product.id === product.id
          ? { ...sp, quantity: sp.quantity + 1 }
          : sp
      ));
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }]);
    }
    setProductSearch('');
  };

  // Remove product from selection
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(sp => sp.product.id !== productId));
  };

  // Update quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setSelectedProducts(selectedProducts.map(sp =>
      sp.product.id === productId
        ? { ...sp, quantity }
        : sp
    ));
  };

  // Create payment
  const handleCreatePayment = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Veuillez sélectionner au moins un produit');
      return;
    }

    if (paymentMethod === 'orange_money' && !reference.trim()) {
      toast.error('Veuillez saisir la référence Orange Money');
      return;
    }

    if (paymentInsuranceData.isInsured && !paymentInsuranceData.memberNumber?.trim()) {
      toast.error('Numéro identifiant assureur requis', {
        description: "Veuillez saisir le numéro d'identifiant chez l'assureur.",
      });
      return;
    }

    try {
      setIsCreatingPayment(true);

      const paymentData = {
        patientId: patientInfo?.id || undefined,
        items: selectedProducts.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        method: paymentMethod,
        reference: paymentMethod === 'orange_money' ? reference : undefined,
        insurance: {
          isInsured: paymentInsuranceData.isInsured,
          establishmentId: paymentInsuranceData.isInsured ? paymentInsuranceData.establishmentId || undefined : undefined,
          coveragePercent: paymentInsuranceData.isInsured ? (paymentInsuranceData.coveragePercent || 0) : undefined,
          memberNumber: paymentInsuranceData.isInsured ? paymentInsuranceData.memberNumber?.trim() : undefined,
        },
        discount: {
          hasDiscount: paymentDiscountData.hasDiscount,
          discountPercent: paymentDiscountData.hasDiscount ? (paymentDiscountData.discountPercent || 0) : 0,
        },
      };

      const response = await createPharmacyPayment(paymentData);

      if (response.success) {
        toast.success('Paiement créé avec succès');
        
        // Recharger les paiements
        const paymentsResponse = await getPharmacyPayments({
          page: currentPage,
          limit: itemsPerPage,
          date: appliedDate || undefined,
          status: appliedStatus !== 'all' ? appliedStatus : undefined,
          search: appliedSearch || undefined,
        });

        if (paymentsResponse.success && paymentsResponse.data) {
          const paymentsData = Array.isArray(paymentsResponse.data) 
            ? paymentsResponse.data 
            : paymentsResponse.data.payments || [];
          setPayments(paymentsData);
          
          if (paymentsResponse.data.pagination) {
            setTotalPages(paymentsResponse.data.pagination.totalPages || 1);
            setTotalItems(paymentsResponse.data.pagination.totalItems || paymentsData.length);
          }
        }

        // Recharger les produits disponibles
        const productsResponse = await getPharmacyProducts({
          limit: 1000,
        });
        if (productsResponse.success && productsResponse.data) {
          const productsData = Array.isArray(productsResponse.data) 
            ? productsResponse.data 
            : productsResponse.data.products || [];
          setAvailableProducts(productsData.filter((p: any) => p.stock > 0));
        }
        
        // Reset form
        setSelectedProducts([]);
        setPatientId('');
        setPatientInfo(null);
        setPaymentMethod('cash');
        setReference('');
        setProductSearch('');
        setPaymentInsuranceData({ isInsured: false, establishmentId: '', coveragePercent: 0, memberNumber: '' });
        setPaymentDiscountData({ hasDiscount: false, discountPercent: 0 });
        setIsCreateDialogOpen(false);
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de créer le paiement',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du paiement:', error);
      toast.error('Erreur', {
        description: 'Impossible de créer le paiement',
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements Pharmacie"
        description="Gérer les paiements des ordonnances"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un Paiement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau paiement</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Patient ID (optional) */}
              <div className="space-y-2">
                <Label htmlFor="patient-id">ID Client (optionnel)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patient-id"
                    placeholder="Rechercher par ID Vitalis..."
                    className="pl-10"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
                {patientId && (
                  <p className={`text-xs ${patientInfo ? 'text-success' : 'text-destructive'}`}>
                    {patientInfo
                      ? `Patient trouvé: ${patientInfo.firstName} ${patientInfo.lastName}`
                      : 'Patient non trouvé'}
                  </p>
                )}
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product-search">Sélectionner des produits</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product-search"
                    placeholder="Rechercher un produit..."
                    className="pl-10"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                {productSearch && filteredAvailableProducts.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                    {filteredAvailableProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 border-b last:border-b-0 hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.category} • Stock: {product.stock} {product.unit}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-medium">
                            {product.price.toLocaleString()} GNF
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {productSearch && filteredAvailableProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">Aucun produit trouvé</p>
                )}
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <Label>Produits sélectionnés</Label>
                  <div className="border rounded-lg divide-y">
                    {selectedProducts.map((item) => (
                      <div key={item.product.id} className="p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.product.price.toLocaleString()} GNF / {item.product.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                              disabled={item.quantity >= item.product.stock}
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-medium w-24 text-right">
                            {(item.product.price * item.quantity).toLocaleString()} GNF
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(item.product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Amount */}
              {selectedProducts.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Montant de base</span>
                    <span>{totalAmount.toLocaleString()} GNF</span>
                  </div>
                  {(insuranceDeduction > 0 || discountDeduction > 0) && (
                    <>
                      {insuranceDeduction > 0 && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Déduction assurance</span>
                          <span>-{insuranceDeduction.toLocaleString()} GNF</span>
                        </div>
                      )}
                      {discountDeduction > 0 && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Déduction remise</span>
                          <span>-{discountDeduction.toLocaleString()} GNF</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-lg font-semibold">Montant à payer</span>
                    <span className="text-2xl font-bold text-primary">
                      {finalAmount.toLocaleString()} GNF
                    </span>
                  </div>
                </div>
              )}

              {/* Assurance - toujours visible */}
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

              {/* Remise - toujours visible */}
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
                <Label>Méthode de paiement</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-4 w-4" />
                      Espèces
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50">
                    <RadioGroupItem value="orange_money" id="orange_money" />
                    <Label htmlFor="orange_money" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-4 w-4" />
                      Orange Money
                    </Label>
                  </div>
                </RadioGroup>
                {paymentMethod === 'orange_money' && (
                  <div className="space-y-2">
                    <Label htmlFor="reference">Référence Orange Money *</Label>
                    <Input
                      id="reference"
                      placeholder="Ex: OM-20260201-001"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setSelectedProducts([]);
                    setPatientId('');
                    setPatientInfo(null);
                    setPaymentMethod('cash');
                    setReference('');
                    setProductSearch('');
                    setPaymentInsuranceData({ isInsured: false, establishmentId: '', coveragePercent: 0, memberNumber: '' });
                    setPaymentDiscountData({ hasDiscount: false, discountPercent: 0 });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreatePayment} disabled={selectedProducts.length === 0 || isCreatingPayment}>
                  {isCreatingPayment ? 'Création...' : 'Créer le paiement'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
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
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paiements reçus</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} GNF</p>
              </div>
              <Banknote className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
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
            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Shield className="h-4 w-4" /> Assurance
              </label>
              <Select value={insuranceFilter} onValueChange={(v) => { setInsuranceFilter(v as 'all' | 'yes' | 'no'); if (v !== 'yes') setEstablishmentFilter(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Assurés</SelectItem>
                  <SelectItem value="no">Non assurés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {insuranceFilter === 'yes' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Assureur</label>
                <Select value={establishmentFilter || 'all'} onValueChange={(v) => setEstablishmentFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
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
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Percent className="h-4 w-4" /> Remise
              </label>
              <Select value={discountFilter} onValueChange={(v) => setDiscountFilter(v as 'all' | 'yes' | 'no')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Avec remise</SelectItem>
                  <SelectItem value="no">Sans remise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Patient, ID Vitalis, N° paiement..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter en Excel
            </Button>
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Appliquer les filtres
            </Button>
            <Button variant="outline" onClick={handleResetFilters} className="gap-2">
              <XCircle className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des paiements ({totalItems})
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
              <p className="text-lg font-medium mb-1">Aucun paiement trouvé</p>
              <p className="text-sm">
                {appliedSearch || appliedStatus !== 'all' || appliedDate
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucun paiement de pharmacie pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Assurance</TableHead>
                    <TableHead>Remise</TableHead>
                    <TableHead>N° Paiement</TableHead>
                    <TableHead className="text-right">Montant de base</TableHead>
                    <TableHead className="text-right">Déduction assurance</TableHead>
                    <TableHead className="text-right">Déduction remise</TableHead>
                    <TableHead className="text-right">Montant payé</TableHead>
                    <TableHead>Méthode</TableHead> 
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const MethodIcon = getPaymentMethodIcon(payment.method);
                    // Assurance/remise du paiement (ce dossier), pas du profil patient
                    const baseNum = payment.amountBase != null ? Number(payment.amountBase) : 0;
                    const coveragePercent = baseNum > 0 && payment.insuranceDeduction != null && Number(payment.insuranceDeduction) !== 0
                      ? Math.round((Number(payment.insuranceDeduction) / baseNum) * 100)
                      : 0;
                    const discountPercent = baseNum > 0 && payment.discountDeduction != null && Number(payment.discountDeduction) !== 0
                      ? Math.round((Number(payment.discountDeduction) / baseNum) * 100)
                      : 0;
                    const patientWithPayment = payment.patient
                      ? { ...payment.patient, payment: { coveragePercent, discountPercent } }
                      : null;
                    return (
                      <TableRow key={payment.id}> 
                        <TableCell>
                          {payment.patient ? ( 
                            <div>
                              <p className="font-medium">
                                {payment.patient.firstName} {payment.patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.patient.vitalisId}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Client anonyme</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patientWithPayment ? (
                            <PatientInsuranceDiscount patient={patientWithPayment} column="assurance" usePaymentPercent />
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patientWithPayment ? (
                            <PatientInsuranceDiscount patient={patientWithPayment} column="remise" usePaymentPercent />
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono"> 
                            {payment.id}
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
                        <TableCell className="text-right font-semibold text-success">
                          {(payment.amount != null ? Number(payment.amount) : 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} GNF
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MethodIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getPaymentMethodLabel(payment.method)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell> 
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} paiement(s)
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

export default PharmacyPaymentsPage ; 
