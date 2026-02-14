import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { toast } from 'sonner';
import {
  Search,
  Package,
  Plus,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import type { PharmacyProduct } from '@/types';
import { 
  getPharmacyProducts, 
  createPharmacyProduct,
  getPharmacyCategories,
} from '@/services/api/pharmacyService';

const PharmacyStock: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    customCategory: '',
    price: '',
    stock: '',
    minStock: '',
    unit: '',
  });

  // Charger les catégories depuis l'API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getPharmacyCategories();
        if (response.success && response.data) {
          const categoriesData = Array.isArray(response.data) 
            ? response.data 
            : response.data.categories || [];
          setCategories(categoriesData);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des catégories:', error);
        // En cas d'erreur, on peut extraire les catégories des produits comme fallback
      }
    };

    loadCategories();
  }, []);

  // Charger les produits depuis l'API avec pagination
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getPharmacyProducts({
          page: currentPage,
          limit: itemsPerPage,
          search: appliedSearch || undefined,
          category: appliedCategoryFilter !== 'all' ? appliedCategoryFilter : undefined,
        });
        
        if (response.success && response.data) {
          const productsData = Array.isArray(response.data) 
            ? response.data 
            : response.data.products || [];
          setProducts(productsData);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || productsData.length);
          } else {
            setTotalPages(1);
            setTotalItems(productsData.length);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des produits:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les produits',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, appliedSearch, appliedCategoryFilter]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedCategoryFilter(categoryFilter);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setCategoryFilter('all');
    setAppliedCategoryFilter('all');
    setCurrentPage(1);
  };

  // Handle Enter key
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

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Rupture', class: 'badge-cancelled', percent: 0 };
    if (stock < minStock) return { label: 'Stock faible', class: 'badge-pending', percent: (stock / minStock) * 100 };
    return { label: 'En stock', class: 'badge-completed', percent: 100 };
  };


  const handleAddProduct = async () => {
    // Validation
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock || !newProduct.minStock || !newProduct.unit) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock);
    const minStock = parseInt(newProduct.minStock);

    if (isNaN(price) || price <= 0) {
      toast.error('Le prix doit être un nombre positif');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error('Le stock doit être un nombre positif ou zéro');
      return;
    }

    if (isNaN(minStock) || minStock <= 0) {
      toast.error('Le stock minimum doit être un nombre positif');
      return;
    }

    try {
      const response = await createPharmacyProduct({
        name: newProduct.name,
        category: newProduct.category,
        price: price,
        stock: stock,
        minStock: minStock,
        unit: newProduct.unit,
      });

      if (response.success) {
        toast.success('Produit ajouté avec succès');
        
        // Recharger les produits
        const productsResponse = await getPharmacyProducts({
          page: currentPage,
          limit: itemsPerPage,
          search: appliedSearch || undefined,
          category: appliedCategoryFilter !== 'all' ? appliedCategoryFilter : undefined,
        });
        if (productsResponse.success && productsResponse.data) {
          const productsData = Array.isArray(productsResponse.data) 
            ? productsResponse.data 
            : productsResponse.data.products || [];
          setProducts(productsData);
          
          if (productsResponse.data.pagination) {
            setTotalPages(productsResponse.data.pagination.totalPages || 1);
            setTotalItems(productsResponse.data.pagination.totalItems || productsData.length);
          }
        }
        
        // Recharger les catégories
        const categoriesResponse = await getPharmacyCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          const categoriesData = Array.isArray(categoriesResponse.data) 
            ? categoriesResponse.data 
            : categoriesResponse.data.categories || [];
          setCategories(categoriesData);
        }
        
        // Reset form
        setNewProduct({
          name: '',
          category: '',
          customCategory: '',
          price: '',
          stock: '',
          minStock: '',
          unit: '',
        });
        
        setIsAddDialogOpen(false);
        
        setIsAddDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'ajouter le produit',
      });
    }
  };

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock < p.minStock
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Pharmacie"
        description="Gestion des produits et inventaire"
      >
        <div className="flex gap-2">
          <Link to="/pharmacy/categories">
            <Button variant="outline" className="gap-2">
              <Tag className="h-4 w-4" />
              Catégories
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter produit
        </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Paracétamol 500mg"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Link to="/pharmacy/categories">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Gérer les catégories
                      </Button>
                    </Link>
                  </div>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="" disabled>
                          Aucune catégorie disponible
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id || cat} value={cat.name || cat}>
                            {cat.name || cat}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (GNF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Ex: 1500"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité *</Label>
                  <Input
                    id="unit"
                    placeholder="Ex: boîte, flacon, comprimé"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock initial *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Ex: 100"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Stock minimum *</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="Ex: 20"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewProduct({
                      name: '',
                      category: '',
                      customCategory: '',
                      price: '',
                      stock: '',
                      minStock: '',
                      unit: '',
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleAddProduct} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalProducts - outOfStock - lowStock}
                </p>
                <p className="text-sm text-muted-foreground">En stock</p>
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
                <p className="text-2xl font-bold">{lowStock}</p>
                <p className="text-sm text-muted-foreground">Stock faible</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStock}</p>
                <p className="text-sm text-muted-foreground">Ruptures</p>
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
              <Label htmlFor="category-filter" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Catégorie
              </Label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setAppliedCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => {
                    const categoryName = typeof cat === 'string' ? cat : cat.name;
                    const categoryId = typeof cat === 'string' ? cat : cat.id;
                    return (
                      <SelectItem key={categoryId || categoryName} value={categoryName}>
                        {categoryName}
                      </SelectItem>
                    );
                  })}
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

      {/* Products table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Produit
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Catégorie
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Prix
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        {appliedSearch || appliedCategoryFilter !== 'all' ? 'Aucun produit trouvé' : 'Aucun produit enregistré'}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock);
                  return (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.unit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {(product.price || 0).toLocaleString()} GNF
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {product.stock}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              min: {product.minStock}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(
                              (product.stock / product.minStock) * 100,
                              100
                            )}
                            className={`h-1.5 ${
                              product.stock === 0
                                ? '[&>div]:bg-destructive'
                                : product.stock < product.minStock
                                ? '[&>div]:bg-warning'
                                : '[&>div]:bg-success'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={stockStatus.class}
                        >
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                  })
                  )}
              </tbody>
            </table>
          </div>
          )}
          
          {/* Pagination */}
          {!isLoading && products.length > 0 && totalPages > 1 && (
            <div className="mt-6 px-4 pb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || products.length)} sur {totalItems || products.length} produit(s)
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
        </CardContent>
      </Card>

    </div>
  );
};

export default PharmacyStock;
