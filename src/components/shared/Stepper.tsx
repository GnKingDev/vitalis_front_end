import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
  description?: string;
  icon?: React.ElementType;
  status?: 'completed' | 'current' | 'pending' | 'error';
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  showDetails?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  currentStep, 
  className,
  showDetails = true 
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-start justify-between relative">
        {/* Background progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;
          const isLast = index === steps.length - 1;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
              {/* Step circle */}
              <div className="relative">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-sm',
                    isCompleted && 'bg-primary text-primary-foreground shadow-primary/20',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110',
                    isPending && 'bg-muted text-muted-foreground border-2 border-muted-foreground/20'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : isCurrent && StepIcon ? (
                    <StepIcon className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                
                {/* Status indicator */}
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                )}
              </div>

              {/* Step content */}
              <div className="mt-3 text-center w-full max-w-[120px] sm:max-w-[150px]">
                <p
                  className={cn(
                    'text-sm font-semibold mb-1',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-foreground',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className={cn(
                    'text-xs mt-0.5',
                    isCurrent || isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/70'
                  )}>
                    {step.description}
                  </p>
                )}
                
                {/* Status badge */}
                {showDetails && (
                  <div className="mt-2">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/10 text-success border border-success/20">
                        <Check className="h-3 w-3" />
                        Terminé
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                        <Clock className="h-3 w-3" />
                        En cours
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-muted-foreground/20">
                        En attente
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
