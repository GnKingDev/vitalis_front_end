import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import {
  getConsultationTypes,
  createConsultationType,
  updateConsultationType,
  deleteConsultationType,
  type ConsultationTypeItem,
} from '@/services/api/consultationTypesService';

const formatPrice = (value: number | string) => {
  return Number(value).toLocaleString('fr-FR');
};
const parsePrice = (value: string) => {
  return parseInt(value.replace(/\s/g, ''), 10) || 0;
};

const ConsultationTypesPage: React.FC = () => {
  const [types, setTypes] = useState<ConsultationTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingType, setEditingType] = useState<ConsultationTypeItem | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<ConsultationTypeItem | null>(null);
  const [form, setForm] = useState({ name: '', price: '' });
  const [isSaving, setIsSaving] = useState(false);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const res = await getConsultationTypes({ activeOnly: false });
      if (res.success && Array.isArray(res.data)) setTypes(res.data);
    } catch (e) {
      toast.error('Erreur', { description: 'Impossible de charger les types de consultation' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const openCreate = () => {
    setEditingType(null);
    setForm({ name: '', price: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (t: ConsultationTypeItem) => {
    setEditingType(t);
    setForm({ name: t.name, price: String(t.price) });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const price = parsePrice(form.price);
    if (!name) {
      toast.error('Le nom est requis');
      return;
    }
    if (price < 0) {
      toast.error('Le prix doit être >= 0');
      return;
    }
    setIsSaving(true);
    try {
      if (editingType) {
        const res = await updateConsultationType(editingType.id, { name, price });
        if (res.success) {
          toast.success('Type modifié');
          setIsDialogOpen(false);
          loadTypes();
        } else toast.error(res.message || 'Erreur');
      } else {
        const res = await createConsultationType({ name, price });
        if (res.success) {
          toast.success('Type créé');
          setIsDialogOpen(false);
          loadTypes();
        } else toast.error(res.message || 'Erreur');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (t: ConsultationTypeItem) => {
    setTypeToDelete(t);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    try {
      const res = await deleteConsultationType(typeToDelete.id);
      if (res.success) {
        toast.success('Type supprimé');
        setIsDeleteOpen(false);
        setTypeToDelete(null);
        loadTypes();
      } else toast.error(res.message || 'Erreur');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Types de consultation"
        description="Créer et gérer les types de consultation et leurs prix"
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Types et tarifs
          </CardTitle>
          <CardDescription>
            Vous créez vous-même les types : vous saisissez le nom et vous fixez le prix (GNF) pour chacun. Aucun type ni aucun montant ne sont imposés. Ces types sont proposés à l&apos;accueil ; le total est la somme des types cochés.
          </CardDescription>
          <Button onClick={openCreate} className="gap-2 w-fit">
            <Plus className="h-4 w-4" />
            Ajouter un type
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : types.length === 0 ? (
            <p className="text-muted-foreground">Aucun type. Ajoutez-en un pour que la réception puisse les proposer.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix (GNF)</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{formatPrice(t.price)}</TableCell>
                    <TableCell>{t.isActive ? 'Oui' : 'Non'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(t)}>
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={() => confirmDelete(t)}>
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Modifier le type' : 'Nouveau type de consultation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du type (libre)</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Saisir le nom (ex: Consultation, Échographie, Radio…)"
              />
              <p className="text-xs text-muted-foreground">L&apos;administrateur choisit l&apos;intitulé ; aucun type prédéfini.</p>
            </div>
            <div className="space-y-2">
              <Label>Prix (GNF) — vous le fixez</Label>
              <Input
                type="text"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, '') }))}
                placeholder="Ex: 50000"
              />
              <p className="text-xs text-muted-foreground">Montant libre, défini par l&apos;administrateur.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce type ?</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer « {typeToDelete?.name} » ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConsultationTypesPage;
