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
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Payment, PaymentType } from '@/types';
import { getReceptionPayments } from '@/services/api/receptionService';
import { toast } from 'sonner';

const PaymentsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PaymentType | 'all'>('all');
  const [appliedDate, setAppliedDate] = useState<string>(today);
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [appliedType, setAppliedType] = useState<PaymentType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const itemsPerPage = 10;

  // Charger les paiements depuis l'API
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true);
        
        const response = await getReceptionPayments({
          page: currentPage,
          limit: itemsPerPage,
          date: appliedDate || undefined,
          type: appliedType !== 'all' ? appliedType : undefined,
          search: appliedSearch || undefined,
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
  }, [currentPage, appliedDate, appliedType, appliedSearch]);

  // Obtenir le patient pour un paiement (depuis les données du paiement)
  const getPatient = (payment: any) => {
    return payment.patient || {};
  };

  // Réinitialiser la page quand les filtres appliqués changent
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedDate, appliedType]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedDate(selectedDate);
    setAppliedSearch(searchQuery);
    setAppliedType(selectedType);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSelectedDate(today);
    setAppliedDate(today);
    setSearchQuery('');
    setAppliedSearch('');
    setSelectedType('all');
    setAppliedType('all');
    setCurrentPage(1);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description={isToday ? "Liste des paiements d'aujourd'hui" : `Liste des paiements du ${formatDisplayDate(selectedDate)}`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sélecteur de date */}
            <div className="space-y-2">
              <Label htmlFor="date-select" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={today}
                className="w-full"
              />
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
          <div className="flex gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={appliedDate === today && !appliedSearch && appliedType === 'all'}
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
            {appliedDate !== today && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(today);
                  setAppliedDate(today);
                  setCurrentPage(1);
                }}
              >
                Aujourd'hui
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
                  : `Aucun paiement n'a été enregistré le ${formatDisplayDate(selectedDate)}`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID Vitalis</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date/Heure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun paiement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => {
                    const patient = getPatient(payment);
                    const paymentTime = new Date(payment.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const paymentDate = new Date(payment.createdAt).toLocaleDateString('fr-FR');

                    return (
                      <TableRow key={payment.id}>
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
                          <Badge variant="outline">
                            {payment.type === 'consultation' ? 'Consultation' : 
                             payment.type === 'lab' ? 'Laboratoire' : 
                             payment.type === 'imaging' ? 'Imagerie' :
                             payment.type === 'pharmacy' ? 'Pharmacie' : payment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-success">
                            {(payment.amount || 0).toLocaleString()} GNF
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
                        <TableCell>
                          <div>
                            <p className="text-sm">{paymentDate}</p>
                            <p className="text-xs text-muted-foreground">{paymentTime}</p>
                          </div>
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
