import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import type { StockAlertType } from '@/types';
import { getPharmacyAlerts, getPharmacyAlertsStats } from '@/services/api/pharmacyService';
import { toast } from 'sonner';

const PharmacyAlertsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<StockAlertType | 'all'>('all');
  const [appliedTypeFilter, setAppliedTypeFilter] = useState<StockAlertType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    outOfStock: 0,
    lowStock: 0,
    expiringSoon: 0,
  });
  const itemsPerPage = 10;

  // Charger les alertes depuis l'API
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setIsLoading(true);
        
        const [alertsResponse, statsResponse] = await Promise.all([
          getPharmacyAlerts({
            page: currentPage,
            limit: itemsPerPage,
            type: appliedTypeFilter !== 'all' ? appliedTypeFilter : undefined,
            search: appliedSearch || undefined,
          }),
          getPharmacyAlertsStats(),
        ]);

        if (alertsResponse.success && alertsResponse.data) {
          const alertsData = Array.isArray(alertsResponse.data) 
            ? alertsResponse.data 
            : alertsResponse.data.alerts || [];
          setAlerts(alertsData);
          
          if (alertsResponse.data.pagination) {
            setTotalPages(alertsResponse.data.pagination.totalPages || 1);
            setTotalItems(alertsResponse.data.pagination.totalItems || alertsData.length);
          } else {
            setTotalPages(1);
            setTotalItems(alertsData.length);
          }
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des alertes:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les alertes',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, [currentPage, appliedSearch, appliedTypeFilter]);

  // Get product details for alerts (depuis les données de l'alerte)
  const getProduct = (alert: any) => {
    return alert.product || {};
  };

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedTypeFilter(typeFilter);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setTypeFilter('all');
    setAppliedTypeFilter('all');
    setCurrentPage(1);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
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

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedTypeFilter]);

  const getAlertIcon = (type: StockAlertType) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'low_stock':
        return <TrendingDown className="h-5 w-5 text-warning" />;
      case 'expiring_soon':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
  };

  const getAlertColor = (type: StockAlertType) => {
    switch (type) {
      case 'out_of_stock':
        return 'bg-destructive/5 border-destructive/20';
      case 'low_stock':
        return 'bg-warning/5 border-warning/20';
      case 'expiring_soon':
        return 'bg-warning/5 border-warning/20';
    }
  };

  const getStatusLabel = (type: StockAlertType) => {
    switch (type) {
      case 'out_of_stock':
        return 'Rupture de stock';
      case 'low_stock':
        return 'Stock faible';
      case 'expiring_soon':
        return 'Expiration proche';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes stock"
        description="Gérer les alertes de stock et les ruptures"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total alertes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-sm text-muted-foreground">Ruptures</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-sm text-muted-foreground">Stock faible</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                <p className="text-sm text-muted-foreground">Expiration proche</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Rechercher
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom produit, catégorie..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Type d'alerte
              </Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as StockAlertType | 'all');
                  setAppliedTypeFilter(value as StockAlertType | 'all');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                  <SelectItem value="low_stock">Stock faible</SelectItem>
                  <SelectItem value="expiring_soon">Expiration proche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="flex-1 gap-2">
                <Search className="h-4 w-4" />
                Appliquer les filtres
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Liste des alertes ({totalItems || alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucune alerte trouvée</p>
              <p className="text-sm">
                {appliedSearch || appliedTypeFilter !== 'all'
                  ? 'Essayez avec d\'autres filtres'
                  : 'Aucune alerte de stock pour le moment'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Stock actuel</TableHead>
                      <TableHead>Stock minimum</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Date d'alerte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => {
                      const product = getProduct(alert);
                      const stockPercentage = alert.currentStock === 0 
                        ? 0 
                        : Math.min((alert.currentStock / alert.minStock) * 100, 100);
                      
                      return (
                        <TableRow key={alert.id} className="hover:bg-secondary/20">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.type)}
                              <StatusBadge status={alert.type} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{alert.productName || product.name}</p>
                                {product.unit && (
                                  <p className="text-xs text-muted-foreground">
                                    {product.unit}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {product.category || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              alert.currentStock === 0 
                                ? 'text-destructive' 
                                : alert.currentStock < alert.minStock
                                ? 'text-warning'
                                : 'text-success'
                            }`}>
                              {alert.currentStock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {alert.minStock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress
                                value={stockPercentage}
                                className={`h-2 ${
                                  alert.currentStock === 0
                                    ? '[&>div]:bg-destructive'
                                    : alert.currentStock < alert.minStock
                                    ? '[&>div]:bg-warning'
                                    : '[&>div]:bg-success'
                                }`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || alerts.length)} sur {totalItems || alerts.length} alerte(s)
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

export default PharmacyAlertsPage;
