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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FlaskConical, Plus, Trash2, UserPlus } from 'lucide-react';
import {
  getLabNumbers,
  createLabNumber,
  assignLabNumber,
  deleteLabNumber,
} from '@/services/api/labNumbersService';
import { getUsers } from '@/services/api/usersService';
import type { LabNumber } from '@/services/api/labNumbersService';
import type { User } from '@/types';

const LabNumbersPage: React.FC = () => {
  const [labNumbers, setLabNumbers] = useState<LabNumber[]>([]);
  const [labUsers, setLabUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LabNumber | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningLabNumber, setAssigningLabNumber] = useState<LabNumber | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const loadLabNumbers = async () => {
    try {
      setIsLoading(true);
      const response = await getLabNumbers({});
      if (response.success && response.data) {
        const list = Array.isArray(response.data)
          ? response.data
          : [];
        setLabNumbers(list);
      }
    } catch (error: any) {
      console.error('Erreur chargement numéros lab:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de charger les numéros lab',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLabUsers = async () => {
    try {
      const response = await getUsers({ role: 'lab', limit: 200 });
      if (response.success && response.data) {
        const usersData = Array.isArray(response.data)
          ? response.data
          : (response.data as any).users || [];
        setLabUsers(usersData);
      }
    } catch (error: any) {
      console.error('Erreur chargement utilisateurs lab:', error);
    }
  };

  useEffect(() => {
    loadLabNumbers();
    loadLabUsers();
  }, []);

  const handleCreate = async () => {
    if (!newNumber.trim()) {
      toast.error('Veuillez saisir un numéro');
      return;
    }
    try {
      const response = await createLabNumber(newNumber.trim());
      if (response.success) {
        toast.success('Numéro lab créé');
        setIsCreateDialogOpen(false);
        setNewNumber('');
        loadLabNumbers();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible de créer le numéro',
        });
      }
    } catch (error: any) {
      console.error('Erreur création numéro lab:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer le numéro',
      });
    }
  };

  const handleOpenAssign = (item: LabNumber) => {
    setAssigningLabNumber(item);
    setSelectedUserId(item.userId || '');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!assigningLabNumber) return;
    try {
      const response = await assignLabNumber(
        assigningLabNumber.id,
        selectedUserId || null
      );
      if (response.success) {
        toast.success(selectedUserId ? 'Numéro assigné' : 'Numéro désassigné');
        setAssignDialogOpen(false);
        setAssigningLabNumber(null);
        setSelectedUserId('');
        loadLabNumbers();
        loadLabUsers();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible d\'assigner',
        });
      }
    } catch (error: any) {
      console.error('Erreur assignation:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible d\'assigner',
      });
    }
  };

  const handleOpenDelete = (item: LabNumber) => {
    if (item.isAssigned) {
      toast.error('Impossible de supprimer un numéro assigné. Désassignez-le d\'abord.');
      return;
    }
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await deleteLabNumber(itemToDelete.id);
      if (response.success) {
        toast.success('Numéro lab supprimé');
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        loadLabNumbers();
      } else {
        toast.error('Erreur', {
          description: (response as any).message || 'Impossible de supprimer',
        });
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de supprimer',
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Numéros de laboratoire"
        description="Gérer les numéros de labo/imagerie et les assigner aux techniciens"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un numéro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau numéro de laboratoire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="number">Numéro</Label>
                <Input
                  id="number"
                  placeholder="Ex. LAB-001, IMG-001"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Liste des numéros lab ({labNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : labNumbers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Aucun numéro de laboratoire. Cliquez sur « Ajouter un numéro » pour en créer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labNumbers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.number}</TableCell>
                    <TableCell>
                      {item.isAssigned ? (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Assigné
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disponible</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.user ? (
                        <span>{item.user.name} ({item.user.email})</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenAssign(item)}
                        >
                          <UserPlus className="h-4 w-4" />
                          {item.isAssigned ? 'Modifier' : 'Assigner'}
                        </Button>
                        {!item.isAssigned && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
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

      {/* Dialog assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {assigningLabNumber?.isAssigned ? 'Modifier l\'assignation' : 'Assigner le numéro'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Numéro : <strong>{assigningLabNumber?.number}</strong>
            </p>
            <div className="space-y-2">
              <Label>Technicien Laboratoire / Imagerie</Label>
              <Select value={selectedUserId || '__none__'} onValueChange={(v) => setSelectedUserId(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un technicien (ou vide pour désassigner)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Aucun (désassigner) —</SelectItem>
                  {labUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAssign}>
                {selectedUserId ? 'Assigner' : 'Désassigner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce numéro ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le numéro « {itemToDelete?.number} » sera définitivement supprimé.
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

export default LabNumbersPage;
