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
  DialogFooter,
} from '@/components/ui/dialog';
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
  Pencil,
  Trash2,
  Loader2,
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
  updatePharmacyProduct,
  deletePharmacyProduct,
  getPharmacyCategories,
  getPharmacyUnits,
  createPharmacyUnit,
  updatePharmacyUnit,
  deletePharmacyUnit,
} from '@/services/api/pharmacyService';

const PharmacyStock: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [appliedUnitFilter, setAppliedUnitFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const [unitToDelete, setUnitToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    minStock: '',
    unit: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    customCategory: '',
    price: '',
    salePrice: '',
    stock: '',
    minStock: '',
    unit: '',
  });

  // Charger les catégories et unités depuis l'API
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
      }
    };

    const loadUnits = async () => {
      try {
        const response = await getPharmacyUnits();
        if (response?.success && response.data) {
          const unitsData = Array.isArray(response.data) ? response.data : [];
          setUnits(unitsData);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des unités:', error);
      }
    };

    loadCategories();
    loadUnits();
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
          unit: appliedUnitFilter !== 'all' ? appliedUnitFilter : undefined,
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
  }, [currentPage, appliedSearch, appliedCategoryFilter, appliedUnitFilter]);

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedCategoryFilter(categoryFilter);
    setAppliedUnitFilter(unitFilter);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setCategoryFilter('all');
    setAppliedCategoryFilter('all');
    setUnitFilter('all');
    setAppliedUnitFilter('all');
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

  const handleCreateUnit = async () => {
    if (!newUnitName.trim()) {
      toast.error('Veuillez saisir un nom pour l\'unité');
      return;
    }
    try {
      setIsCreatingUnit(true);
      const response = await createPharmacyUnit(newUnitName.trim());
      if (response?.success && response.data) {
        const unit = response.data;
        setUnits((prev) => [...prev, { id: unit.id, name: unit.name }].sort((a, b) => a.name.localeCompare(b.name)));
        setNewProduct((prev) => ({ ...prev, unit: unit.name }));
        setNewUnitName('');
        toast.success('Unité créée avec succès');
      } else {
        toast.error(response?.message || 'Erreur lors de la création');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Impossible de créer l\'unité');
    } finally {
      setIsCreatingUnit(false);
    }
  };

  const handleUpdateUnit = async () => {
    if (!editingUnitId || !editingUnitName.trim()) return;
    try {
      const response = await updatePharmacyUnit(editingUnitId, editingUnitName.trim());
      if (response?.success && response.data) {
        setUnits((prev) =>
          prev.map((u) => (u.id === editingUnitId ? { ...u, name: response.data.name } : u)).sort((a, b) => a.name.localeCompare(b.name))
        );
        if (newProduct.unit && units.find((u) => u.id === editingUnitId)?.name === newProduct.unit) {
          setNewProduct((prev) => ({ ...prev, unit: response.data.name }));
        }
        setEditingUnitId(null);
        setEditingUnitName('');
        toast.success('Unité modifiée');
      } else {
        toast.error(response?.message || 'Erreur');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Impossible de modifier');
    }
  };

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;
    try {
      setIsDeletingUnit(true);
      await deletePharmacyUnit(unitToDelete.id);
      setUnits((prev) => prev.filter((u) => u.id !== unitToDelete.id));
      if (newProduct.unit === unitToDelete.name) {
        setNewProduct((prev) => ({ ...prev, unit: '' }));
      }
      setUnitToDelete(null);
      toast.success('Unité supprimée');
    } catch (error: any) {
      toast.error(error?.message || 'Impossible de supprimer');
    } finally {
      setIsDeletingUnit(false);
    }
  };

  const loadProductsList = async () => {
    const response = await getPharmacyProducts({
      page: currentPage,
      limit: itemsPerPage,
      search: appliedSearch || undefined,
      category: appliedCategoryFilter !== 'all' ? appliedCategoryFilter : undefined,
      unit: appliedUnitFilter !== 'all' ? appliedUnitFilter : undefined,
    });
    if (response.success && response.data) {
      const productsData = Array.isArray(response.data) ? response.data : response.data.products || [];
      setProducts(productsData);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotalItems(response.data.pagination.totalItems || productsData.length);
      }
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || '',
      category: product.category || '',
      price: String(product.price ?? ''),
      salePrice: String(product.salePrice ?? product.price ?? ''),
      stock: String(product.stock ?? ''),
      minStock: String(product.minStock ?? ''),
      unit: product.unit || '',
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    const { name, category, price, salePrice, stock, minStock, unit } = editFormData;
    if (!name?.trim() || !category?.trim() || !price || !salePrice || !stock || !minStock || !unit?.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    const priceNum = parseFloat(price);
    const salePriceNum = parseFloat(salePrice);
    const stockNum = parseInt(stock, 10);
    const minStockNum = parseInt(minStock, 10);
    if (isNaN(priceNum) || priceNum < 0 || isNaN(salePriceNum) || salePriceNum < 0 || isNaN(stockNum) || stockNum < 0 || isNaN(minStockNum) || minStockNum <= 0) {
      toast.error('Valeurs invalides');
      return;
    }
    try {
      setIsUpdatingProduct(true);
      const response = await updatePharmacyProduct(editingProduct.id, {
        name: name.trim(),
        category: category.trim(),
        price: priceNum,
        salePrice: salePriceNum,
        stock: stockNum,
        minStock: minStockNum,
        unit: unit.trim(),
      });
      if (response?.success) {
        toast.success('Produit modifié avec succès');
        setEditingProduct(null);
        await loadProductsList();
      } else {
        toast.error(response?.message || 'Erreur lors de la modification');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Impossible de modifier le produit');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsDeletingProduct(true);
      await deletePharmacyProduct(productToDelete.id);
      toast.success('Produit supprimé');
      setProductToDelete(null);
      await loadProductsList();
    } catch (error: any) {
      toast.error(error?.message || 'Impossible de supprimer le produit');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Rupture', class: 'badge-cancelled', percent: 0 };
    if (stock < minStock) return { label: 'Stock faible', class: 'badge-pending', percent: (stock / minStock) * 100 };
    return { label: 'En stock', class: 'badge-completed', percent: 100 };
  };


  const handleAddProduct = async () => {
    // Validation
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.salePrice || !newProduct.stock || !newProduct.minStock || !newProduct.unit) {
      toast.error('Veuillez remplir tous les champs obligatoires (nom, catégorie, prix, prix de vente, stock, stock min, unité)');
      return;
    }

    const price = parseFloat(newProduct.price);
    const salePrice = parseFloat(newProduct.salePrice);
    const stock = parseInt(newProduct.stock);
    const minStock = parseInt(newProduct.minStock);

    if (isNaN(price) || price < 0) {
      toast.error('Le prix doit être un nombre positif');
      return;
    }
    if (isNaN(salePrice) || salePrice < 0) {
      toast.error('Le prix de vente doit être un nombre positif');
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
          salePrice: salePrice,
          stock: stock,
          minStock: minStock,
          unit: newProduct.unit,
        });

      if (response.success) {
        toast.success('Produit ajouté avec succès');
        await loadProductsList();
        
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
          salePrice: '',
          stock: '',
          minStock: '',
          unit: '',
        });
        
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
                  {categories.length === 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        Aucune catégorie pour l&apos;instant. Créez-en dans <strong>Gérer les catégories</strong> ou saisissez une catégorie ci-dessous.
                      </p>
                      <Input
                        id="category"
                        placeholder="Ex: Médicaments, Consommables..."
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value.trim() })}
                      />
                    </>
                  ) : (
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id || cat} value={cat.name || cat}>
                            {cat.name || cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                  <Label htmlFor="salePrice">Prix de vente (GNF) *</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    placeholder="Ex: 2000"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newProduct.unit || undefined}
                      onValueChange={(v) => {
                        if (v === '__add__') {
                          setIsAddUnitModalOpen(true);
                        } else {
                          setNewProduct({ ...newProduct, unit: v });
                        }
                      }}
                    >
                      <SelectTrigger id="unit" className="flex-1">
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.name}>
                            {u.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add__" className="text-primary font-medium">
                          + Ajouter une unité
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                      salePrice: '',
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

        {/* Modal unités : créer, modifier, supprimer */}
        <Dialog open={isAddUnitModalOpen} onOpenChange={(open) => {
          setIsAddUnitModalOpen(open);
          if (!open) {
            setNewUnitName('');
            setEditingUnitId(null);
            setEditingUnitName('');
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gestion des unités</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-2">
              {/* Créer une unité */}
              <div className="space-y-2">
                <Label htmlFor="newUnitName">Nouvelle unité</Label>
                <div className="flex gap-2">
                  <Input
                    id="newUnitName"
                    placeholder="Ex: boîte, flacon, comprimé"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateUnit()}
                  />
                  <Button onClick={handleCreateUnit} disabled={isCreatingUnit || !newUnitName.trim()} size="sm">
                    {isCreatingUnit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Liste des unités */}
              <div className="space-y-2">
                <Label>Unités existantes</Label>
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {units.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Aucune unité</p>
                  ) : (
                    units.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-secondary/50"
                      >
                        {editingUnitId === u.id ? (
                          <>
                            <Input
                              value={editingUnitName}
                              onChange={(e) => setEditingUnitName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateUnit();
                                if (e.key === 'Escape') { setEditingUnitId(null); setEditingUnitName(''); }
                              }}
                              className="h-8"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingUnitId(null); setEditingUnitName(''); }}>
                                Annuler
                              </Button>
                              <Button size="sm" onClick={handleUpdateUnit} disabled={!editingUnitName.trim()}>
                                Enregistrer
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{u.name}</span>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => { setEditingUnitId(u.id); setEditingUnitName(u.name); }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setUnitToDelete(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddUnitModalOpen(false); setNewUnitName(''); setEditingUnitId(null); }}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer l&apos;unité</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer l&apos;unité &quot;{unitToDelete?.name}&quot; ?
                Elle ne pourra pas être supprimée si des produits l&apos;utilisent.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUnit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeletingUnit}
              >
                {isDeletingUnit ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal Modifier produit */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier le produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Catégorie *</Label>
                {categories.length === 0 ? (
                  <Input
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  />
                ) : (
                  <Select
                    value={editFormData.category}
                    onValueChange={(v) => setEditFormData({ ...editFormData, category: v })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id || cat} value={cat.name || cat}>
                          {cat.name || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Prix (GNF) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salePrice">Prix vente (GNF) *</Label>
                  <Input
                    id="edit-salePrice"
                    type="number"
                    min="0"
                    value={editFormData.salePrice}
                    onChange={(e) => setEditFormData({ ...editFormData, salePrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unité *</Label>
                <Select
                  value={editFormData.unit || undefined}
                  onValueChange={(v) => {
                    if (v === '__add__') {
                      setIsAddUnitModalOpen(true);
                    } else {
                      setEditFormData({ ...editFormData, unit: v });
                    }
                  }}
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                    ))}
                    <SelectItem value="__add__" className="text-primary font-medium">+ Ajouter une unité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock *</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minStock">Stock min *</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    min="1"
                    value={editFormData.minStock}
                    onChange={(e) => setEditFormData({ ...editFormData, minStock: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>Annuler</Button>
              <Button onClick={handleUpdateProduct} disabled={isUpdatingProduct} className="gap-2">
                {isUpdatingProduct && <Loader2 className="h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le produit &quot;{productToDelete?.name}&quot; ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeletingProduct}
              >
                {isDeletingProduct ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="unit-filter">Unité</Label>
              <Select
                value={unitFilter}
                onValueChange={(value) => {
                  setUnitFilter(value);
                  setAppliedUnitFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="unit-filter">
                  <SelectValue placeholder="Toutes les unités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les unités</SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
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
                    Prix vente
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
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        {appliedSearch || appliedCategoryFilter !== 'all' || appliedUnitFilter !== 'all' ? 'Aucun produit trouvé' : 'Aucun produit enregistré'}
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
                      <td className="py-3 px-4 font-medium">
                        {(product.salePrice ?? 0).toLocaleString()} GNF
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProductToDelete(product)}
                            title="Supprimer"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
          {!isLoading && products.length > 0 && (
            <div className="mt-6 px-4 pb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-muted-foreground">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems || products.length)} sur {totalItems || products.length} produit(s)
              </div>
              {totalPages > 1 && (
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
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default PharmacyStock;
