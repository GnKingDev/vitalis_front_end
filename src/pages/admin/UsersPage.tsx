import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  UserCircle,
  Building2,
  Ban,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { User, UserRole } from '@/types';
import { getRoleLabel, getRoleBadgeClass } from '@/config/navigation';
import { getUsers, createUser, updateUser, suspendUser, deleteUser } from '@/services/api/usersService';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [appliedRoleFilter, setAppliedRoleFilter] = useState<UserRole | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'reception' as UserRole,
    department: '',
    customDepartment: '',
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'reception' as UserRole,
    department: '',
    customDepartment: '',
  });

  const itemsPerPage = 10;

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: appliedRoleFilter !== 'all' ? appliedRoleFilter : undefined,
          search: appliedSearch || undefined,
        });

        if (response.success && response.data) {
          const usersData = Array.isArray(response.data) 
            ? response.data 
            : response.data.users || [];
          setUsers(usersData);
          
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1);
            setTotalItems(response.data.pagination.totalItems || usersData.length);
          } else {
            setTotalPages(1);
            setTotalItems(usersData.length);
          }
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les utilisateurs',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentPage, appliedSearch, appliedRoleFilter]);

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedRoleFilter(roleFilter);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setRoleFilter('all');
    setAppliedRoleFilter('all');
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

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalItems,
      admin: users.filter((u) => u.role === 'admin').length,
      reception: users.filter((u) => u.role === 'reception').length,
      doctor: users.filter((u) => u.role === 'doctor').length,
      lab: users.filter((u) => u.role === 'lab').length,
      pharmacy: users.filter((u) => u.role === 'pharmacy').length,
    };
  }, [users, totalItems]);

  // Open edit dialog
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    const deptSuggestions = getDepartmentSuggestions(user.role);
    const isCustomDept = user.department && !deptSuggestions.includes(user.department);
    
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: isCustomDept ? 'other' : (user.department || ''),
      customDepartment: isCustomDept ? (user.department || '') : '',
    });
    setIsEditDialogOpen(true);
  };

  // Create user
  const handleCreateUser = async () => {
    // Validation
    if (!newUser.name.trim()) {
      toast.error('Veuillez saisir le nom');
      return;
    }

    if (!newUser.email.trim()) {
      toast.error('Veuillez saisir l\'email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error('Email invalide');
      return;
    }

    try {
      // Le backend génère automatiquement un mot de passe si password n'est pas fourni
      const response = await createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        // Ne pas envoyer de password, le backend le génère automatiquement
        role: newUser.role,
        department: newUser.department === 'other' ? newUser.customDepartment : (newUser.department || undefined),
      });

      if (response.success) {
        // Le backend retourne le mot de passe généré dans response.data.password
        const generatedPassword = response.data?.password || '';
        const userEmail = newUser.email.trim();
        
        // Afficher le mot de passe dans une modal
        setGeneratedPassword(generatedPassword);
        setNewUserEmail(userEmail);
        setIsPasswordDialogOpen(true);
        
        // Recharger les utilisateurs
        const usersResponse = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: appliedRoleFilter !== 'all' ? appliedRoleFilter : undefined,
          search: appliedSearch || undefined,
        });

        if (usersResponse.success && usersResponse.data) {
          const usersData = Array.isArray(usersResponse.data) 
            ? usersResponse.data 
            : usersResponse.data.users || [];
          setUsers(usersData);
          
          if (usersResponse.data.pagination) {
            setTotalPages(usersResponse.data.pagination.totalPages || 1);
            setTotalItems(usersResponse.data.pagination.totalItems || usersData.length);
          }
        }

        // Reset form
        setNewUser({
          name: '',
          email: '',
          role: 'reception',
          department: '',
          customDepartment: '',
        });
        setIsCreateDialogOpen(false);
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de créer l\'utilisateur',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de créer l\'utilisateur',
      });
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Validation
    if (!editUser.name.trim()) {
      toast.error('Veuillez saisir le nom');
      return;
    }

    if (!editUser.email.trim()) {
      toast.error('Veuillez saisir l\'email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUser.email)) {
      toast.error('Email invalide');
      return;
    }

    try {
      const response = await updateUser(editingUser.id, {
        name: editUser.name.trim(),
        email: editUser.email.trim(),
        role: editUser.role,
        department: editUser.department === 'other' ? editUser.customDepartment : (editUser.department || undefined),
      });

      if (response.success) {
        toast.success('Utilisateur modifié avec succès');
        
        // Recharger les utilisateurs
        const usersResponse = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: appliedRoleFilter !== 'all' ? appliedRoleFilter : undefined,
          search: appliedSearch || undefined,
        });

        if (usersResponse.success && usersResponse.data) {
          const usersData = Array.isArray(usersResponse.data) 
            ? usersResponse.data 
            : usersResponse.data.users || [];
          setUsers(usersData);
        }

        // Reset form
        setEditingUser(null);
        setEditUser({
          name: '',
          email: '',
          role: 'reception',
          department: '',
          customDepartment: '',
        });
        setIsEditDialogOpen(false);
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de modifier l\'utilisateur',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de modifier l\'utilisateur',
      });
    }
  };

  // Open suspend confirmation dialog
  const handleOpenSuspendDialog = () => {
    if (!editingUser) return;
    if (editingUser.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas suspendre votre propre compte');
      return;
    }
    setIsSuspendDialogOpen(true);
  };

  // Suspend user (confirmed)
  const handleSuspendUser = async () => {
    if (!editingUser) return;

    try {
      const response = await suspendUser(editingUser.id);

      if (response.success) {
        toast.success(`L'utilisateur ${editingUser.name} a été suspendu`);
        
        // Recharger les utilisateurs
        const usersResponse = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: appliedRoleFilter !== 'all' ? appliedRoleFilter : undefined,
          search: appliedSearch || undefined,
        });

        if (usersResponse.success && usersResponse.data) {
          const usersData = Array.isArray(usersResponse.data) 
            ? usersResponse.data 
            : usersResponse.data.users || [];
          setUsers(usersData);
        }
        
        // Close dialogs
        setIsSuspendDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingUser(null);
        setEditUser({
          name: '',
          email: '',
          role: 'reception',
          department: '',
          customDepartment: '',
        });
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de suspendre l\'utilisateur',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la suspension de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de suspendre l\'utilisateur',
      });
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Delete user (confirmed)
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await deleteUser(userToDelete.id);

      if (response.success) {
        toast.success(`L'utilisateur ${userToDelete.name} a été supprimé`);
        
        // Recharger les utilisateurs
        const usersResponse = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          role: appliedRoleFilter !== 'all' ? appliedRoleFilter : undefined,
          search: appliedSearch || undefined,
        });

        if (usersResponse.success && usersResponse.data) {
          const usersData = Array.isArray(usersResponse.data) 
            ? usersResponse.data 
            : usersResponse.data.users || [];
          setUsers(usersData);
          
          if (usersResponse.data.pagination) {
            setTotalPages(usersResponse.data.pagination.totalPages || 1);
            setTotalItems(usersResponse.data.pagination.totalItems || usersData.length);
          }
        }
        
        // Close dialog
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de supprimer l\'utilisateur',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de supprimer l\'utilisateur',
      });
    }
  };

  // Get role badge color
  const getRoleBadge = (role: UserRole) => {
    return (
      <Badge variant="outline" className={getRoleBadgeClass(role)}>
        {getRoleLabel(role)}
      </Badge>
    );
  };

  // Department suggestions based on role
  const getDepartmentSuggestions = (role: UserRole): string[] => {
    switch (role) {
      case 'admin':
        return ['Administration', 'Direction'];
      case 'reception':
        return ['Accueil', 'Réception'];
      case 'doctor':
        return ['Médecine Générale', 'Cardiologie', 'Pédiatrie', 'Gynécologie', 'Chirurgie'];
      case 'lab':
        return ['Laboratoire', 'Biologie Médicale'];
      case 'pharmacy':
        return ['Pharmacie'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        description="Créer et gérer les utilisateurs du système"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Dr. Amadou Diallo"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex: amadou.diallo@vitalis.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => {
                    setNewUser({ ...newUser, role: value as UserRole, department: '', customDepartment: '' });
                  }}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="reception">Accueil</SelectItem>
                    <SelectItem value="doctor">Médecin</SelectItem>
                    <SelectItem value="lab">Laboratoire</SelectItem>
                    <SelectItem value="pharmacy">Pharmacie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Département (optionnel)</Label>
                <Select
                  value={newUser.department}
                  onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDepartmentSuggestions(newUser.role).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {newUser.department === 'other' && (
                  <Input
                    placeholder="Saisir le nom du département"
                    value={newUser.customDepartment}
                    onChange={(e) => setNewUser({ ...newUser, customDepartment: e.target.value })}
                    className="mt-2"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewUser({
                      name: '',
                      email: '',
                      role: 'reception',
                      department: '',
                      customDepartment: '',
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateUser} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admin}</p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reception}</p>
                <p className="text-sm text-muted-foreground">Accueil</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.doctor}</p>
                <p className="text-sm text-muted-foreground">Médecins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lab}</p>
                <p className="text-sm text-muted-foreground">Laboratoire</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pharmacy}</p>
                <p className="text-sm text-muted-foreground">Pharmacie</p>
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
                  placeholder="Nom, email, département..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-filter" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Rôle
              </Label>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}
              >
                <SelectTrigger id="role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="reception">Accueil</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="lab">Laboratoire</SelectItem>
                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des utilisateurs ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chargement...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium mb-1">Aucun utilisateur trouvé</p>
              <p className="text-sm">
                {appliedSearch || appliedRoleFilter !== 'all'
                  ? 'Essayez avec d\'autres filtres'
                  : 'Aucun utilisateur dans le système'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-secondary/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              {user.id === currentUser?.id && (
                                <p className="text-xs text-muted-foreground">Vous</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {user.department || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleOpenEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                              Modifier
                            </Button>
                            {user.id !== currentUser?.id && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => handleOpenDeleteDialog(user)}
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
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} utilisateur(s)
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom complet *</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Dr. Amadou Diallo"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Ex: amadou.diallo@vitalis.com"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle *</Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => {
                  setEditUser({ ...editUser, role: value as UserRole, department: '', customDepartment: '' });
                }}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="reception">Accueil</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="lab">Laboratoire</SelectItem>
                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Département (optionnel)</Label>
              <Select
                value={editUser.department}
                onValueChange={(value) => setEditUser({ ...editUser, department: value })}
              >
                <SelectTrigger id="edit-department">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {getDepartmentSuggestions(editUser.role).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              {editUser.department === 'other' && (
                <Input
                  placeholder="Saisir le nom du département"
                  value={editUser.customDepartment}
                  onChange={(e) => setEditUser({ ...editUser, customDepartment: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleOpenSuspendDialog}
                className="gap-2 text-destructive hover:text-destructive"
                disabled={editingUser?.id === currentUser?.id}
              >
                <Ban className="h-4 w-4" />
                Suspendre
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingUser(null);
                    setEditUser({
                      name: '',
                      email: '',
                      role: 'reception',
                      department: '',
                      customDepartment: '',
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdateUser} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend User Confirmation Dialog */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir suspendre l'utilisateur <strong>{editingUser?.name}</strong> ? 
              Cette action empêchera l'utilisateur de se connecter au système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Suspendre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ? 
              Cette action est irréversible et toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Display Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mot de passe généré</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Le mot de passe a été généré automatiquement pour <strong>{newUserEmail}</strong>.
                Veuillez le copier et le communiquer à l'utilisateur. Ce mot de passe ne sera plus affiché après la fermeture de cette fenêtre.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  className="font-mono text-sm"
                  id="generated-password"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generatedPassword);
                      toast.success('Mot de passe copié');
                    } catch (error) {
                      // Fallback pour les navigateurs qui ne supportent pas clipboard API
                      const input = document.getElementById('generated-password') as HTMLInputElement;
                      if (input) {
                        input.select();
                        document.execCommand('copy');
                        toast.success('Mot de passe copié');
                      }
                    }
                  }}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copier
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsPasswordDialogOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
