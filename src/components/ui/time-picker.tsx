import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';

const MINUTES = ['00', '15', '30', '45'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07 à 20

export interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Choisir l\'heure',
  disabled = false,
  className,
  id,
}: TimePickerProps) {
  const [hourStr, minuteStr] = value ? value.split(':') : [null, null];
  const hour = hourStr ? String(Number(hourStr)) : '';
  const minute = minuteStr ?? '';

  const handleHour = (h: string) => {
    onChange(`${h.padStart(2, '0')}:${(minuteStr || '00').padStart(2, '0')}`);
  };
  const handleMinute = (m: string) => {
    onChange(`${(hourStr || '09').padStart(2, '0')}:${m.padStart(2, '0')}`);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Select
        value={hour ?? ''}
        onValueChange={handleHour}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="flex-1">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {String(h).padStart(2, '0')} h
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={minute ?? ''}
        onValueChange={handleMinute}
        disabled={disabled}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="min" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
