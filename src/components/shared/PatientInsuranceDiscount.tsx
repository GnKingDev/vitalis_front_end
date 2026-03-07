import React from 'react';
import { ShieldCheck, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/types';

interface PatientInsuranceDiscountProps {
  patient: Patient | (Patient & {
    insuranceEstablishmentName?: string;
    insuranceCoveragePercent?: number;
    discountPercent?: number;
    payment?: { coveragePercent?: number | null; discountPercent?: number | null };
  });
  /** 'inline' pour une ligne (listes), 'block' pour détail, 'column' pour une seule colonne tableau */
  variant?: 'inline' | 'block';
  /** En mode colonne tableau : n'affiche que l'assurance ou que la remise */
  column?: 'assurance' | 'remise';
  /** Si true (ex: liste réception), utilise les % du paiement de la ligne au lieu du profil patient */
  usePaymentPercent?: boolean;
  className?: string;
}

/**
 * Affiche l'assurance (nom + %) et la remise (%) du patient.
 * Toujours visible : affiche "—" quand le backend n'envoie pas encore les données.
 */
export const PatientInsuranceDiscount: React.FC<PatientInsuranceDiscountProps> = ({
  patient,
  variant = 'inline',
  column,
  usePaymentPercent = false,
  className = '',
}) => {
  const p = patient as Patient & {
    insuranceEstablishmentName?: string;
    insuranceCoveragePercent?: number;
    discountPercent?: number;
    payment?: { coveragePercent?: number | null; discountPercent?: number | null };
  };
  const payment = p.payment;
  // En mode usePaymentPercent : ne jamais utiliser le profil patient, uniquement les % du paiement/dossier
  const coveragePercent = usePaymentPercent && payment
    ? (payment.coveragePercent ?? 0)
    : (p.insuranceCoveragePercent != null ? p.insuranceCoveragePercent : 0);
  const discountPercent = usePaymentPercent && payment
    ? (payment.discountPercent ?? 0)
    : (p.discountPercent != null ? p.discountPercent : 0);
  const hasInsurance = usePaymentPercent && payment
    ? (coveragePercent != null && coveragePercent > 0)
    : (p.insuranceEstablishmentName != null || (coveragePercent != null && coveragePercent > 0));
  const hasDiscount =
    discountPercent != null && discountPercent > 0;

  if (column === 'assurance') {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {hasInsurance
          ? (p.insuranceEstablishmentName || 'Assurance') +
            (coveragePercent != null && coveragePercent > 0
              ? ` (${coveragePercent}%)`
              : '')
          : '—'}
      </div>
    );
  }
  if (column === 'remise') {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {hasDiscount ? `${discountPercent}%` : '—'}
      </div>
    );
  }

  const content = (
    <>
      <span className="flex items-center gap-1 flex-wrap">
        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground text-xs">
          {hasInsurance
            ? (p.insuranceEstablishmentName || 'Assurance') +
              (coveragePercent != null && coveragePercent > 0
                ? ` (${coveragePercent}%)`
                : '')
            : '—'}
        </span>
      </span>
      <span className="text-muted-foreground/60 mx-1">•</span>
      <span className="flex items-center gap-1 flex-wrap">
        <Percent className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-muted-foreground text-xs">
          {hasDiscount ? `Remise ${discountPercent}%` : '—'}
        </span>
      </span>
    </>
  );

  if (variant === 'block') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="text-xs font-normal gap-1">
          <ShieldCheck className="h-3 w-3" />
          {hasInsurance
            ? (p.insuranceEstablishmentName || 'Assurance') +
              (coveragePercent != null && coveragePercent > 0
                ? ` ${coveragePercent}%`
                : '')
            : 'Assurance —'}
        </Badge>
        <Badge variant="outline" className="text-xs font-normal gap-1">
          <Percent className="h-3 w-3" />
          {hasDiscount ? `Remise ${discountPercent}%` : 'Remise —'}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 text-xs ${className}`}>
      {content}
    </div>
  );
};
