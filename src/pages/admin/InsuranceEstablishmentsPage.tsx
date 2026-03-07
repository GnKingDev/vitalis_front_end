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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Power,
} from 'lucide-react';
import {
  getInsuranceEstablishments,
  createInsuranceEstablishment,
  updateInsuranceEstablishment,
  deleteInsuranceEstablishment,
} from '@/services/api/insuranceEstablishmentsService';
import type {
  InsuranceEstablishment,
  InsuranceEstablishmentCreateInput,
} from '@/services/api/insuranceEstablishmentsService';

const InsuranceEstablishmentsPage: React.FC = () => {
  const [establishments, setEstablishments] = useState<InsuranceEstablishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InsuranceEstablishment | null>(null);
  const [itemToDisable, setItemToDisable] = useState<InsuranceEstablishment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    isActive: true,
  });

  const loadEstablishments = async () => {
    try {
      setIsLoading(true);
      const response = await getInsuranceEstablishments({});
      if (response.success && response.data) {
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data as any).establishments ?? [];
        setEstablishments(list);
      }
    } catch (error: any) {
      console.error('Erreur chargement sociétés d’assurance:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de charger les sociétés d’assurance',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstablishments();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', code: '', isActive: true });
    setEditingItem(null);
    setItemToDisable(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormData({ name: '', code: '', isActive: true });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (item: InsuranceEstablishment) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code ?? '',
      isActive: item.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDisable = (item: InsuranceEstablishment) => {
    setItemToDisable(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Veuillez saisir le nom de la société');
      return;
    }
    setConfirmCreateOpen(true);
  };

  const handleCreate = async () => {
    setConfirmCreateOpen(false);
    if (!formData.name.trim()) return;
    try {
      const payload: InsuranceEstablishmentCreateInput = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        isActive: formData.isActive,
      };
      const response = await createInsuranceEstablishment(payload);
      if (response.success) {
        toast.success('Société d’assurance créée');
        setIsCreateDialogOpen(false);
        resetForm();
        loadEstablishments();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible de créer la société',
        });
      }
    } catch (error: any) {
      console.error('Erreur création société:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer la société',
      });
    }
  };

  const handleConfirmUpdate = () => {
    if (!editingItem) return;
    if (!formData.name.trim()) {
      toast.error('Veuillez saisir le nom de la société');
      return;
    }
    setConfirmEditOpen(true);
  };

  const handleUpdate = async () => {
    setConfirmEditOpen(false);
    if (!editingItem) return;
    if (!formData.name.trim()) return;
    try {
      const response = await updateInsuranceEstablishment(editingItem.id, {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        isActive: formData.isActive,
      });
      if (response.success) {
        toast.success('Société d’assurance modifiée');
        setIsEditDialogOpen(false);
        resetForm();
        loadEstablishments();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible de modifier la société',
        });
      }
    } catch (error: any) {
      console.error('Erreur modification société:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de modifier la société',
      });
    }
  };

  const handleDisable = async () => {
    if (!itemToDisable) return;
    try {
      const response = await deleteInsuranceEstablishment(itemToDisable.id);
      if (response.success) {
        toast.success('Société d’assurance désactivée');
        setIsDeleteDialogOpen(false);
        setItemToDisable(null);
        loadEstablishments();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible de désactiver la société',
        });
      }
    } catch (error: any) {
      console.error('Erreur désactivation:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de désactiver la société',
      });
    }
  };

  const handleActivate = async (item: InsuranceEstablishment) => {
    try {
      const response = await updateInsuranceEstablishment(item.id, { isActive: true });
      if (response.success) {
        toast.success('Société d’assurance activée');
        loadEstablishments();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible d’activer la société',
        });
      }
    } catch (error: any) {
      console.error('Erreur activation:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d’activer la société',
      });
    }
  };

  const renderForm = (isEdit: boolean) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nom <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ex. Mutuelle XYZ"
          value={formData.name}
          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Code (optionnel)</Label>
        <Input
          id="code"
          placeholder="Ex. MUT-XYZ"
          value={formData.code}
          onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((p) => ({ ...p, isActive: checked === true }))
          }
        />
        <Label htmlFor="isActive" className="font-normal cursor-pointer">
          Actif
        </Label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() =>
            isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)
          }
        >
          Annuler
        </Button>
        <Button onClick={isEdit ? handleConfirmUpdate : handleConfirmCreate}>
          Enregistrer
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sociétés d’assurance"
        description="Gérer les établissements d’assurance (mutuelles, conventions) utilisés à l’accueil"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Ajouter une société
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle société d’assurance</DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des sociétés d’assurance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : establishments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucune société d’assurance. Cliquez sur « Ajouter une société » pour en créer une.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {establishments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.code || '—'}
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="default" className="bg-success text-success-foreground gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Oui
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Non
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Button>
                        {item.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleOpenDisable(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Désactiver
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-success hover:text-success"
                            onClick={() => handleActivate(item)}
                          >
                            <Power className="h-4 w-4" />
                            Activer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la société d’assurance</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>

      {/* Confirmation création */}
      <AlertDialog open={confirmCreateOpen} onOpenChange={setConfirmCreateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Créer cette société d’assurance ?</AlertDialogTitle>
            <AlertDialogDescription>
              La société « {formData.name.trim() || '…' } » sera ajoutée et pourra être
              sélectionnée à l’accueil pour les patients assurés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation modification */}
      <AlertDialog open={confirmEditOpen} onOpenChange={setConfirmEditOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enregistrer les modifications ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les changements pour la société « {editingItem?.name ?? (formData.name.trim() || '…') } »
              seront enregistrés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation désactivation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver cette société ?</AlertDialogTitle>
            <AlertDialogDescription>
              La société « {itemToDisable?.name} » ne sera plus proposée dans le sélecteur à
              l’accueil. Les patients déjà enregistrés avec cette assurance ne sont pas modifiés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InsuranceEstablishmentsPage;
