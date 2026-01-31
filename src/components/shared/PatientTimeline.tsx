import React from 'react';
import { cn } from '@/lib/utils';
import {
  UserPlus,
  CreditCard,
  UserCheck,
  Stethoscope,
  TestTube2,
  FileCheck,
  Pill,
  Package,
} from 'lucide-react';
import type { TimelineEvent, TimelineEventType } from '@/types';

const eventConfig: Record<TimelineEventType, { icon: React.ElementType; color: string }> = {
  registration: { icon: UserPlus, color: 'bg-info text-info-foreground' },
  payment_consultation: { icon: CreditCard, color: 'bg-success text-success-foreground' },
  doctor_assignment: { icon: UserCheck, color: 'bg-primary text-primary-foreground' },
  consultation_start: { icon: Stethoscope, color: 'bg-info text-info-foreground' },
  consultation_end: { icon: Stethoscope, color: 'bg-success text-success-foreground' },
  lab_request: { icon: TestTube2, color: 'bg-warning text-warning-foreground' },
  lab_payment: { icon: CreditCard, color: 'bg-success text-success-foreground' },
  lab_assigned: { icon: TestTube2, color: 'bg-info text-info-foreground' },
  lab_results: { icon: FileCheck, color: 'bg-success text-success-foreground' },
  prescription_created: { icon: Pill, color: 'bg-primary text-primary-foreground' },
  prescription_sent: { icon: Pill, color: 'bg-info text-info-foreground' },
  pharmacy_prepared: { icon: Package, color: 'bg-warning text-warning-foreground' },
  pharmacy_delivered: { icon: Package, color: 'bg-success text-success-foreground' },
};

interface PatientTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ events, className }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

      <ul className="space-y-6">
        {events.map((event, index) => {
          const config = eventConfig[event.type];
          const Icon = config?.icon || UserPlus;
          const colorClass = config?.color || 'bg-muted text-muted-foreground';

          return (
            <li key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  colorClass
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground flex-shrink-0">
                    <p>{formatDate(event.createdAt)}</p>
                    <p>{formatTime(event.createdAt)}</p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
