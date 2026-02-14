import type { NavItem, UserRole } from '@/types';

export const navigationItems: NavItem[] = [
  // Admin only
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'reception', 'doctor', 'lab', 'pharmacy'],
  },
  
  // Reception
  {
    title: 'Liste des patients',
    href: '/reception/today',
    icon: 'Users',
    roles: ['admin', 'reception'],
  },
  {
    title: 'Enregistrer patient',
    href: '/reception/register',
    icon: 'UserPlus',
    roles: ['admin', 'reception'],
  },
  {
    title: 'Paiement labo et imagerie',
    href: '/reception/lab-payments',
    icon: 'FlaskConical',
    roles: ['admin', 'reception'],
  },
  {
    title: 'Tous les Paiements',
    href: '/reception/payments',
    icon: 'CreditCard',
    roles: ['admin', 'reception'],
  },
  {
    title: 'Assignation médecin',
    href: '/reception/assign',
    icon: 'UserCheck',
    roles: ['reception'],
  },
  
  // Doctor
  {
    title: 'Patients assignés',
    href: '/doctor/patients',
    icon: 'Users',
    roles: ['doctor'],
  },
  {
    title: 'Demandes envoyées au laboratoire et imagerie',
    href: '/doctor/lab-requests',
    icon: 'FlaskConical',
    roles: ['doctor'],
  },
  {
    title: 'Résultats labo et imagerie',
    href: '/doctor/lab-results',
    icon: 'TestTube2',
    roles: ['admin', 'doctor'],
  },
  
  // Laboratory
  {
    title: 'Demandes laboratoire',
    href: '/lab/requests',
    icon: 'FlaskConical',
    roles: ['admin', 'lab'],
  },
  {
    title: 'Demandes imagerie',
    href: '/lab/imaging-requests',
    icon: 'Scan',
    roles: ['admin', 'lab'],
  },
  
  // Pharmacy
  {
    title: 'Pharmacie',
    href: '/pharmacy',
    icon: 'Pill',
    roles: ['admin', 'pharmacy'],
    children: [
      { title: 'Stock produits', href: '/pharmacy/stock', icon: 'Package', roles: ['admin', 'pharmacy'] },
      { title: 'Alertes stock', href: '/pharmacy/alerts', icon: 'AlertTriangle', roles: ['admin', 'pharmacy'] },
      { title: 'Catégories', href: '/pharmacy/categories', icon: 'Tag', roles: ['admin', 'pharmacy'] },
    ],
  },
  {
    title: 'Paiements Pharmacie',
    href: '/pharmacy/payments',
    icon: 'CreditCard',
    roles: ['admin', 'pharmacy'],
  },
  
  // Admin
  {
    title: 'Administration',
    href: '/admin',
    icon: 'Settings',
    roles: ['admin'],
    children: [
      { title: 'Utilisateurs', href: '/admin/users', icon: 'Users', roles: ['admin'] },
      { title: 'Statistiques', href: '/admin/stats', icon: 'BarChart3', roles: ['admin'] },
      { title: 'Tests Labo et Imagerie', href: '/admin/tests', icon: 'TestTube2', roles: ['admin'] },
      { title: 'Gestion des lits', href: '/admin/beds', icon: 'Bed', roles: ['admin'] },
      { title: 'Prix de consultation', href: '/admin/consultation-price', icon: 'DollarSign', roles: ['admin'] },
    ],
  },
  
  // Common
  {
    title: 'Dossiers patients',
    href: '/patients',
    icon: 'FolderOpen',
    roles: ['admin', 'doctor', 'lab'],
    // Note: reception can access but results are hidden
  },
];

export const getNavigationForRole = (role: UserRole | undefined): NavItem[] => {
  if (!role) return [];
  
  return navigationItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.roles.includes(role)),
    }));
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: 'Administrateur',
    reception: 'Accueil',
    doctor: 'Médecin',
    lab: 'Laboratoire',
    pharmacy: 'Pharmacie',
  };
  return labels[role];
};

export const getRoleBadgeClass = (role: UserRole): string => {
  const classes: Record<UserRole, string> = {
    admin: 'badge-admin',
    reception: 'badge-reception',
    doctor: 'badge-doctor',
    lab: 'badge-lab',
    pharmacy: 'badge-pharmacy',
  };
  return classes[role];
};
