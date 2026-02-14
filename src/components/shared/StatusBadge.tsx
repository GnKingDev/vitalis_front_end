import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { 
  PaymentStatus, 
  ConsultationStatus, 
  LabRequestStatus, 
  PrescriptionStatus,
  StockAlertType 
} from '@/types';

type StatusType = PaymentStatus | ConsultationStatus | LabRequestStatus | PrescriptionStatus | StockAlertType;

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Payment
  pending: { label: 'En attente', className: 'badge-pending' },
  paid: { label: 'Payé', className: 'badge-completed' },
  cancelled: { label: 'Annulé', className: 'badge-cancelled' },
  
  // Consultation
  waiting: { label: 'En attente', className: 'badge-pending' },
  in_progress: { label: 'En cours', className: 'badge-active' },
  completed: { label: 'Terminé', className: 'badge-completed' },
  
  // Lab Request
  pending: { label: 'En attente', className: 'badge-pending' },
  sent_to_doctor: { label: 'Fini et envoyé au médecin', className: 'badge-completed' },
  
  // Prescription
  created: { label: 'Créée', className: 'badge-pending' },
  sent_to_pharmacy: { label: 'Envoyée pharmacie', className: 'badge-active' },
  preparing: { label: 'En préparation', className: 'badge-active' },
  ready: { label: 'Prête', className: 'badge-completed' },
  delivered: { label: 'Délivrée', className: 'badge-completed' },
  
  // Stock
  low_stock: { label: 'Stock faible', className: 'badge-pending' },
  out_of_stock: { label: 'Rupture', className: 'badge-cancelled' },
  expiring_soon: { label: 'Expiration proche', className: 'badge-pending' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: 'badge-pending' };
  
  return (
    <Badge 
      variant="outline" 
      className={cn('border font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
