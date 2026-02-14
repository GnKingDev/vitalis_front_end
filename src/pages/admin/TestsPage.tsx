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
  TestTube2,
  Scan,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  getLabExams,
  createLabExam,
  updateLabExam,
  deleteLabExam,
  getImagingExams,
  createImagingExam,
  updateImagingExam,
  deleteImagingExam,
} from '@/services/api/testsService';
import type { LabExam, ImagingExam } from '@/types';

type ExamType = 'lab' | 'imaging';

interface CombinedExam {
  id: string;
  name: string;
  type: ExamType;
  price: number;
}

const TestsPage: React.FC = () => {
  const [allExams, setAllExams] = useState<CombinedExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ExamType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<CombinedExam | null>(null);
  const [examToDelete, setExamToDelete] = useState<CombinedExam | null>(null);
  const [newExam, setNewExam] = useState({
    name: '',
    type: 'lab' as ExamType,
    price: '',
  });

  const itemsPerPage = 10;

  // Formater un nombre avec des points comme séparateurs de milliers
  const formatPrice = (value: string | number): string => {
    if (!value) return '';
    // Retirer tous les points existants
    const numericValue = value.toString().replace(/\./g, '');
    // Formater avec des points tous les 3 chiffres
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parser une valeur formatée en nombre
  const parsePrice = (value: string): number => {
    if (!value) return 0;
    // Retirer tous les points et convertir en nombre
    return parseInt(value.replace(/\./g, ''), 10) || 0;
  };

  // Gérer le changement de prix avec formatage
  const handlePriceChange = (value: string) => {
    // Retirer tous les caractères non numériques sauf les points
    const cleaned = value.replace(/[^\d.]/g, '');
    // Formater avec des points
    const formatted = formatPrice(cleaned);
    setNewExam({ ...newExam, price: formatted });
  };

  // Charger les tests depuis l'API
  useEffect(() => {
    loadExams();
  }, [currentPage, typeFilter]);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const combinedExams: CombinedExam[] = [];
      let totalLab = 0;
      let totalImaging = 0;

      // Charger les tests selon le filtre
      if (typeFilter === 'all' || typeFilter === 'lab') {
        const labResponse = await getLabExams({
          page: currentPage,
          limit: itemsPerPage,
        });

        if (labResponse.success && labResponse.data) {
          const labExamsData = Array.isArray(labResponse.data) 
            ? labResponse.data 
            : labResponse.data.exams || labResponse.data.data || [];
          
          labExamsData.forEach((exam: LabExam) => {
            combinedExams.push({
              id: exam.id,
              name: exam.name,
              type: 'lab',
              price: exam.price,
            });
          });

          // Récupérer les métadonnées de pagination
          if (labResponse.data.pagination) {
            totalLab = labResponse.data.pagination.totalItems || labExamsData.length;
          } else {
            totalLab = labExamsData.length;
          }
        }
      }

      if (typeFilter === 'all' || typeFilter === 'imaging') {
        const imagingResponse = await getImagingExams({
          page: currentPage,
          limit: itemsPerPage,
        });

        if (imagingResponse.success && imagingResponse.data) {
          const imagingExamsData = Array.isArray(imagingResponse.data) 
            ? imagingResponse.data 
            : imagingResponse.data.exams || imagingResponse.data.data || [];
          
          imagingExamsData.forEach((exam: ImagingExam) => {
            combinedExams.push({
              id: exam.id,
              name: exam.name,
              type: 'imaging',
              price: exam.price,
            });
          });

          // Récupérer les métadonnées de pagination
          if (imagingResponse.data.pagination) {
            totalImaging = imagingResponse.data.pagination.totalItems || imagingExamsData.length;
          } else {
            totalImaging = imagingExamsData.length;
          }
        }
      }

      setAllExams(combinedExams);
      
      // Calculer le total et les pages
      const total = typeFilter === 'all' ? totalLab + totalImaging : (typeFilter === 'lab' ? totalLab : totalImaging);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error: any) {
      console.error('Erreur lors du chargement des tests:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les tests',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser la page quand le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter]);

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
    setNewExam({ name: '', type: 'lab', price: '' });
    setIsCreateDialogOpen(true);
  };

  // Ouvrir le dialogue d'édition
  const handleOpenEdit = (exam: CombinedExam) => {
    setEditingExam(exam);
    setNewExam({
      name: exam.name,
      type: exam.type,
      price: formatPrice(exam.price.toString()),
    });
    setIsEditDialogOpen(true);
  };

  // Créer un test
  const handleCreate = async () => {
    if (!newExam.name.trim()) {
      toast.error('Veuillez saisir le nom du test');
      return;
    }
    const parsedPrice = parsePrice(newExam.price);
    if (!newExam.price || parsedPrice <= 0) {
      toast.error('Veuillez saisir un prix valide');
      return;
    }

    try {
      const examData = {
        name: newExam.name.trim(),
        category: newExam.type === 'lab' ? 'Laboratoire' : 'Imagerie',
        price: parsedPrice,
      };

      let response;
      if (newExam.type === 'lab') {
        response = await createLabExam(examData);
      } else {
        response = await createImagingExam(examData);
      }

      if (response.success) {
        toast.success('Test créé avec succès');
        setNewExam({ name: '', type: 'lab', price: '' });
        setIsCreateDialogOpen(false);
        loadExams();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de créer le test',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du test:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer le test',
      });
    }
  };

  // Modifier un test
  const handleUpdate = async () => {
    if (!editingExam) return;

    if (!newExam.name.trim()) {
      toast.error('Veuillez saisir le nom du test');
      return;
    }
    const parsedPrice = parsePrice(newExam.price);
    if (!newExam.price || parsedPrice <= 0) {
      toast.error('Veuillez saisir un prix valide');
      return;
    }

    try {
      const examData = {
        name: newExam.name.trim(),
        category: newExam.type === 'lab' ? 'Laboratoire' : 'Imagerie',
        price: parsedPrice,
      };

      let response;
      if (newExam.type === 'lab') {
        response = await updateLabExam(editingExam.id, examData);
      } else {
        response = await updateImagingExam(editingExam.id, examData);
      }

      if (response.success) {
        toast.success('Test modifié avec succès');
        setEditingExam(null);
        setNewExam({ name: '', type: 'lab', price: '' });
        setIsEditDialogOpen(false);
        loadExams();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de modifier le test',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du test:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de modifier le test',
      });
    }
  };

  // Ouvrir le dialogue de suppression
  const handleOpenDelete = (exam: CombinedExam) => {
    setExamToDelete(exam);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer un test
  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      let response;
      if (examToDelete.type === 'lab') {
        response = await deleteLabExam(examToDelete.id);
      } else {
        response = await deleteImagingExam(examToDelete.id);
      }

      if (response.success) {
        toast.success('Test supprimé avec succès');
        setExamToDelete(null);
        setIsDeleteDialogOpen(false);
        loadExams();
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de supprimer le test',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du test:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de supprimer le test',
      });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Tests Laboratoire et Imagerie"
        description="Gérer les tests de laboratoire et d'imagerie avec leurs prix"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du test *</Label>
                <Input
                  id="name"
                  placeholder="Ex: NFS, Échographie abdominale"
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={newExam.type}
                  onValueChange={(value) => setNewExam({ ...newExam, type: value as ExamType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab">Laboratoire</SelectItem>
                    <SelectItem value="imaging">Imagerie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix (GNF) *</Label>
                <Input
                  id="price"
                  type="text"
                  placeholder="Ex: 50.000"
                  value={newExam.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewExam({ name: '', type: 'lab', price: '' });
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

      {/* Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Filtrer par type</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as ExamType | 'all')}
            >
              <SelectTrigger id="type-filter" className="w-full md:w-[300px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="lab">Laboratoire</SelectItem>
                <SelectItem value="imaging">Imagerie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tests ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : allExams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium mb-1">Aucun test trouvé</p>
              <p className="text-sm">
                {typeFilter !== 'all' ? 'Aucun test pour ce type' : 'Aucun test dans le système'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>
                        <Badge variant={exam.type === 'lab' ? 'default' : 'secondary'} className="gap-1">
                          {exam.type === 'lab' ? (
                            <TestTube2 className="h-3 w-3" />
                          ) : (
                            <Scan className="h-3 w-3" />
                          )}
                          {exam.type === 'lab' ? 'Laboratoire' : 'Imagerie'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(exam.price.toString())} GNF
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleOpenEdit(exam)}
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(exam)}
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
                    Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} test(s)
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
            <DialogTitle>Modifier le test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du test *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: NFS, Échographie abdominale"
                value={newExam.name}
                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select
                value={newExam.type}
                onValueChange={(value) => setNewExam({ ...newExam, type: value as ExamType })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab">Laboratoire</SelectItem>
                  <SelectItem value="imaging">Imagerie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Prix (GNF) *</Label>
              <Input
                id="edit-price"
                type="text"
                placeholder="Ex: 50.000"
                value={newExam.price}
                onChange={(e) => handlePriceChange(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingExam(null);
                  setNewExam({ name: '', type: 'lab', price: '' });
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
            <AlertDialogTitle>Supprimer le test</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le test <strong>{examToDelete?.name}</strong> ? 
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
    </div>
  );
};

export default TestsPage;
