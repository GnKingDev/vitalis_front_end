import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from 'lucide-react';
import { mockPharmacyProducts, mockStockAlerts } from '@/data/mockData';

const PharmacyStock: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = Array.from(
    new Set(mockPharmacyProducts.map((p) => p.category))
  );

  const filteredProducts = mockPharmacyProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Rupture', class: 'badge-cancelled', percent: 0 };
    if (stock < minStock) return { label: 'Stock faible', class: 'badge-pending', percent: (stock / minStock) * 100 };
    return { label: 'En stock', class: 'badge-completed', percent: 100 };
  };

  const totalProducts = mockPharmacyProducts.length;
  const outOfStock = mockPharmacyProducts.filter((p) => p.stock === 0).length;
  const lowStock = mockPharmacyProducts.filter(
    (p) => p.stock > 0 && p.stock < p.minStock
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Pharmacie"
        description="Gestion des produits et inventaire"
      >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter produit
        </Button>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Tous
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardContent className="p-0">
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
                {filteredProducts.map((product) => {
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
                        {product.price.toLocaleString()} F
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
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyStock;
