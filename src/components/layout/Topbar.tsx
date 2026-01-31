import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleLabel, getRoleBadgeClass } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserRole } from '@/types';

const allRoles: UserRole[] = ['admin', 'reception', 'doctor', 'lab', 'pharmacy'];

export const Topbar: React.FC = () => {
  const { user, switchRole } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Search */}
      <div className="flex-1 max-w-md ml-12 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un patient (ID, nom)..."
            className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Role switcher (demo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Badge className={getRoleBadgeClass(user?.role || 'admin')}>
                {getRoleLabel(user?.role || 'admin')}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Changer de rôle (Demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allRoles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => switchRole(role)}
                className="cursor-pointer"
              >
                <Badge className={`mr-2 ${getRoleBadgeClass(role)}`}>
                  {getRoleLabel(role)}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name || 'Utilisateur'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
