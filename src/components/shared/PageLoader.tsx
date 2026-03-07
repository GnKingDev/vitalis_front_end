import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Chargement...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

export default PageLoader;
