import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Tag,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import {
  getPharmacyCategories,
  createPharmacyCategory,
  updatePharmacyCategory,
  deletePharmacyCategory,
} from '@/services/api/pharmacyService';

const PharmacyCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Charger les catégories depuis l'API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getPharmacyCategories();
      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.categories || [];
        setCategories(categoriesData);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les catégories',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Créer une catégorie
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Veuillez saisir un nom de catégorie');
      return;
    }

    try {
      const response = await createPharmacyCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      if (response.success) {
        toast.success('Catégorie créée avec succès');
        setNewCategoryName('');
        setNewCategoryDescription('');
        setIsCreateDialogOpen(false);
        loadCategories();
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la catégorie:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer la catégorie',
      });
    }
  };

  // Modifier une catégorie
  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      return;
    }

    try {
      const response = await updatePharmacyCategory(editingCategory.id, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      if (response.success) {
        toast.success('Catégorie modifiée avec succès');
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setIsCreateDialogOpen(false);
        loadCategories();
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification de la catégorie:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de modifier la catégorie',
      });
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await deletePharmacyCategory(categoryToDelete.id);

      if (response.success) {
        toast.success('Catégorie supprimée avec succès');
        setCategoryToDelete(null);
        loadCategories();
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de supprimer la catégorie',
      });
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setIsCreateDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsCreateDialogOpen(false);
  };

  const handleOpenCreateDialog = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des catégories"
        description="Créer et gérer les catégories de produits"
      >
        <Button onClick={handleOpenCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer une catégorie
        </Button>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Catégories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des catégories */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories de produits</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucune catégorie</p>
              <p className="text-sm mb-4">
                Créez votre première catégorie pour commencer à organiser vos produits
              </p>
              <Button onClick={handleOpenCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer une catégorie
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const cat = typeof category === 'string' 
                  ? { id: category, name: category, description: '' } 
                  : category;
                return (
                  <div
                    key={cat.id || cat.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-lg">{cat.name}</p>
                      </div>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground ml-6">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(cat)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCategoryToDelete(cat)}
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/modification */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Créer une nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nom de la catégorie *</Label>
              <Input
                id="category-name"
                placeholder="Ex: Antalgiques, Antibiotiques..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (optionnel)</Label>
              <Input
                id="category-description"
                placeholder="Description de la catégorie..."
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelEdit}>
                Annuler
              </Button>
              {editingCategory ? (
                <Button onClick={handleUpdateCategory} className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              ) : (
                <Button onClick={handleCreateCategory} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.name}" ? 
              Cette action est irréversible. Les produits associés à cette catégorie ne seront pas supprimés, 
              mais ils n'auront plus de catégorie assignée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PharmacyCategoriesPage;
