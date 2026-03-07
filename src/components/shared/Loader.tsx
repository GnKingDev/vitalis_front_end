import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => (
  <Loader2
    className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
    aria-hidden
  />
);

export default Loader;
