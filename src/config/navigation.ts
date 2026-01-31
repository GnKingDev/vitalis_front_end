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
    title: 'Accueil Patients',
    href: '/reception',
    icon: 'UserPlus',
    roles: ['admin', 'reception'],
    children: [
      { title: 'Patients du jour', href: '/reception/today', icon: 'Calendar', roles: ['admin', 'reception'] },
      { title: 'Enregistrer patient', href: '/reception/register', icon: 'UserPlus', roles: ['admin', 'reception'] },
      { title: 'Paiements', href: '/reception/payments', icon: 'CreditCard', roles: ['admin', 'reception'] },
      { title: 'Assignation médecin', href: '/reception/assign', icon: 'UserCheck', roles: ['admin', 'reception'] },
    ],
  },
  
  // Doctor
  {
    title: 'Consultations',
    href: '/doctor',
    icon: 'Stethoscope',
    roles: ['admin', 'doctor'],
    children: [
      { title: 'Patients assignés', href: '/doctor/patients', icon: 'Users', roles: ['admin', 'doctor'] },
      { title: 'Consultation en cours', href: '/doctor/consultation', icon: 'ClipboardList', roles: ['admin', 'doctor'] },
      { title: 'Demandes labo', href: '/doctor/lab-requests', icon: 'TestTube2', roles: ['admin', 'doctor'] },
      { title: 'Ordonnances', href: '/doctor/prescriptions', icon: 'Pill', roles: ['admin', 'doctor'] },
    ],
  },
  
  // Laboratory
  {
    title: 'Laboratoire',
    href: '/lab',
    icon: 'FlaskConical',
    roles: ['admin', 'lab'],
    children: [
      { title: 'Examens en attente', href: '/lab/pending', icon: 'Clock', roles: ['admin', 'lab'] },
      { title: 'Examens en cours', href: '/lab/in-progress', icon: 'Activity', roles: ['admin', 'lab'] },
      { title: 'Résultats', href: '/lab/results', icon: 'FileCheck', roles: ['admin', 'lab'] },
    ],
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
      { title: 'Ordonnances reçues', href: '/pharmacy/prescriptions', icon: 'FileText', roles: ['admin', 'pharmacy'] },
    ],
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
      { title: 'Paramètres', href: '/admin/settings', icon: 'Settings', roles: ['admin'] },
    ],
  },
  
  // Common
  {
    title: 'Dossiers patients',
    href: '/patients',
    icon: 'FolderOpen',
    roles: ['admin', 'doctor', 'lab', 'pharmacy'],
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
