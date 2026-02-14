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
  DialogTrigger,
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bed,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  getBeds,
  createBed,
  updateBed,
  deleteBed,
  freeBed,
} from '@/services/api/bedsService';
import type { Bed as BedType, BedType as BedTypeEnum } from '@/types';

const BedsPage: React.FC = () => {
  const [beds, setBeds] = useState<BedType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'classic' | 'vip' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'occupied' | 'available' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFreeDialogOpen, setIsFreeDialogOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<BedType | null>(null);
  const [bedToDelete, setBedToDelete] = useState<BedType | null>(null);
  const [bedToFree, setBedToFree] = useState<BedType | null>(null);
  const [newBed, setNewBed] = useState({
    number: '',
    type: 'classic' as BedTypeEnum,
    additionalFee: '',
  });

  const itemsPerPage = 10;

  // Formater un nombre avec des points comme séparateurs de milliers
  const formatPrice = (value: string | number): string => {
    if (!value) return '';
    const numericValue = value.toString().replace(/\./g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parser une valeur formatée en nombre
  const parsePrice = (value: string): number => {
    if (!value) return 0;
    return parseInt(value.replace(/\./g, ''), 10) || 0;
  };

  // Gérer le changement de prix avec formatage
  const handleFeeChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const formatted = formatPrice(cleaned);
    setNewBed({ ...newBed, additionalFee: formatted });
  };

  // Charger les lits depuis l'API
  useEffect(() => {
    loadBeds();
  }, [currentPage, typeFilter, statusFilter]);

  const loadBeds = async () => {
    try {
      setIsLoading(true);
      const response = await getBeds({
        page: currentPage,
        limit: itemsPerPage,
        type: typeFilter,
        status: statusFilter,
      });

      if (response.success && response.data) {
        const bedsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.beds || response.data.data || [];
        setBeds(bedsData);

        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.totalItems || bedsData.length);
        } else {
          setTotalPages(1);
          setTotalItems(bedsData.length);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des lits:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les lits',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter]);

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

  // Ouvrir le dialogue de création
  const handleOpenCreate = () => {
    setNewBed({ number: '', type: 'classic', additionalFee: '' });
    setIsCreateDialogOpen(true);
  };

  // Ouvrir le dialogue d'édition
  const handleOpenEdit = (bed: BedType) => {
    setEditingBed(bed);
    setNewBed({
      number: bed.number,
      type: bed.type,
      additionalFee: formatPrice(bed.additionalFee.toString()),
    });
    setIsEditDialogOpen(true);
  };

  // Créer un lit
  const handleCreate = async () => {
    if (!newBed.number.trim()) {
      toast.error('Veuillez saisir le numéro du lit');
      return;
    }

    try {
      const bedData = {
        number: newBed.number.trim(),
        type: newBed.type,
        additionalFee: newBed.type === 'vip' ? (parsePrice(newBed.additionalFee) || 15000) : 0,
      };

      const response = await createBed(bedData);

      if (response.success) {
        toast.success('Lit créé avec succès');
        setNewBed({ number: '', type: 'classic', additionalFee: '' });
        setIsCreateDialogOpen(false);
        loadBeds();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de créer le lit',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du lit:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer le lit',
      });
    }
  };

  // Modifier un lit
  const handleUpdate = async () => {
    if (!editingBed) return;

    if (!newBed.number.trim()) {
      toast.error('Veuillez saisir le numéro du lit');
      return;
    }

    try {
      const bedData = {
        number: newBed.number.trim(),
        type: newBed.type,
        additionalFee: newBed.type === 'vip' ? parsePrice(newBed.additionalFee) : 0,
      };

      const response = await updateBed(editingBed.id, bedData);

      if (response.success) {
        toast.success('Lit modifié avec succès');
        setEditingBed(null);
        setNewBed({ number: '', type: 'classic', additionalFee: '' });
        setIsEditDialogOpen(false);
        loadBeds();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de modifier le lit',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du lit:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de modifier le lit',
      });
    }
  };

  // Ouvrir le dialogue de suppression
  const handleOpenDelete = (bed: BedType) => {
    setBedToDelete(bed);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer un lit
  const handleDelete = async () => {
    if (!bedToDelete) return;

    try {
      const response = await deleteBed(bedToDelete.id);

      if (response.success) {
        toast.success('Lit supprimé avec succès');
        setBedToDelete(null);
        setIsDeleteDialogOpen(false);
        loadBeds();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de supprimer le lit',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du lit:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de supprimer le lit',
      });
    }
  };

  // Ouvrir le dialogue de libération
  const handleOpenFree = (bed: BedType) => {
    setBedToFree(bed);
    setIsFreeDialogOpen(true);
  };

  // Libérer un lit
  const handleFree = async () => {
    if (!bedToFree) return;

    try {
      const response = await freeBed(bedToFree.id);

      if (response.success) {
        toast.success('Lit libéré avec succès');
        setBedToFree(null);
        setIsFreeDialogOpen(false);
        loadBeds();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de libérer le lit',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la libération du lit:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de libérer le lit',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des lits"
        description="Gérer les lits classiques et VIP de la clinique"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un lit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau lit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="number">Numéro du lit *</Label>
                <Input
                  id="number"
                  placeholder="Ex: 101, A1, VIP-1"
                  value={newBed.number}
                  onChange={(e) => setNewBed({ ...newBed, number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={newBed.type}
                  onValueChange={(value) => {
                    setNewBed({ 
                      ...newBed, 
                      type: value as BedTypeEnum,
                      additionalFee: value === 'vip' ? '15.000' : '',
                    });
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classique (Gratuit)</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newBed.type === 'vip' && (
                <div className="space-y-2">
                  <Label htmlFor="fee">Frais supplémentaire (GNF) *</Label>
                  <Input
                    id="fee"
                    type="text"
                    placeholder="Ex: 15.000"
                    value={newBed.additionalFee}
                    onChange={(e) => handleFeeChange(e.target.value)}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewBed({ number: '', type: 'classic', additionalFee: '' });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Filtrer par type</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as 'classic' | 'vip' | 'all')}
              >
                <SelectTrigger id="type-filter" className="w-full">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="classic">Classique</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Filtrer par statut</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'occupied' | 'available' | 'all')}
              >
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Occupé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lits ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : beds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium mb-1">Aucun lit trouvé</p>
              <p className="text-sm">
                {typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Aucun lit pour ces filtres' 
                  : 'Aucun lit dans le système'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Frais supplémentaire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beds.map((bed) => (
                      <TableRow key={bed.id}>
                        <TableCell className="font-medium">{bed.number}</TableCell>
                        <TableCell>
                          <Badge variant={bed.type === 'vip' ? 'default' : 'secondary'}>
                            {bed.type === 'vip' ? 'VIP' : 'Classique'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {bed.additionalFee > 0 
                            ? `${formatPrice(bed.additionalFee.toString())} GNF`
                            : 'Gratuit'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={bed.isOccupied ? 'destructive' : 'default'}
                            className="gap-1"
                          >
                            {bed.isOccupied ? (
                              <>
                                <XCircle className="h-3 w-3" />
                                Occupé
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Disponible
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {bed.isOccupied && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleOpenFree(bed)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Libérer
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleOpenEdit(bed)}
                            >
                              <Edit className="h-4 w-4" />
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDelete(bed)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} lit(s)
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le lit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-number">Numéro du lit *</Label>
              <Input
                id="edit-number"
                placeholder="Ex: 101, A1, VIP-1"
                value={newBed.number}
                onChange={(e) => setNewBed({ ...newBed, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select
                value={newBed.type}
                onValueChange={(value) => {
                  setNewBed({ 
                    ...newBed, 
                    type: value as BedTypeEnum,
                    additionalFee: value === 'vip' && !newBed.additionalFee ? '15.000' : newBed.additionalFee,
                  });
                }}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classique (Gratuit)</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newBed.type === 'vip' && (
              <div className="space-y-2">
                <Label htmlFor="edit-fee">Frais supplémentaire (GNF) *</Label>
                <Input
                  id="edit-fee"
                  type="text"
                  placeholder="Ex: 15.000"
                  value={newBed.additionalFee}
                  onChange={(e) => handleFeeChange(e.target.value)}
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingBed(null);
                  setNewBed({ number: '', type: 'classic', additionalFee: '' });
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdate} className="gap-2">
                <Edit className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le lit</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le lit <strong>{bedToDelete?.number}</strong> ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Free Bed Confirmation Dialog */}
      <AlertDialog open={isFreeDialogOpen} onOpenChange={setIsFreeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Libérer le lit</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir libérer le lit <strong>{bedToFree?.number}</strong> ? 
              Le lit deviendra disponible pour un nouveau patient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFree}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Libérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BedsPage;
