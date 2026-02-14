import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Rediriger vers la page de changement de mot de passe si nécessaire
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={cn(
        'lg:ml-64 flex flex-col min-h-screen',
        'transition-all duration-300'
      )}>
        <Topbar />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
