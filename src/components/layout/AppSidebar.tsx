import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole, getRoleLabel } from '@/config/navigation';
import vitalisLogo from '@/assets/logo-vitalis.png';
import {
  LayoutDashboard,
  UserPlus,
  Calendar,
  CreditCard,
  UserCheck,
  Stethoscope,
  Users,
  ClipboardList,
  TestTube2,
  Pill,
  FlaskConical,
  Clock,
  Activity,
  FileCheck,
  Package,
  AlertTriangle,
  FileText,
  Settings,
  BarChart3,
  FolderOpen,
  Scan,
  Tag,
  Bed,
  DollarSign,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  UserPlus,
  Calendar,
  CreditCard,
  UserCheck,
  Stethoscope,
  Users,
  ClipboardList,
  TestTube2,
  Pill,
  FlaskConical,
  Clock,
  Activity,
  FileCheck,
  Package,
  AlertTriangle,
  FileText,
  Settings,
  BarChart3,
  FolderOpen,
  Scan,
  Tag,
  Bed,
  DollarSign,
};

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems = getNavigationForRole(user?.role);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (href: string, children?: { href: string }[]) => {
    if (isActive(href)) return true;
    return children?.some((child) => location.pathname.startsWith(child.href));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 w-64 bg-sidebar text-sidebar-foreground',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center">
            <img 
              src={vitalisLogo} 
              alt="VITALIS" 
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-accent-foreground">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.href) || isParentActive(item.href, item.children);

              if (hasChildren) {
                return (
                  <li key={item.href}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.href)}>
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
                            'transition-colors duration-150',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            isParentActive(item.href, item.children) && 'bg-sidebar-accent text-sidebar-accent-foreground'
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.title}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                          {item.children?.map((child) => {
                            const ChildIcon = iconMap[child.icon] || LayoutDashboard;
                            return (
                              <li key={child.href}>
                                <Link
                                  to={child.href}
                                  className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                                    'transition-colors duration-150',
                                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    isActive(child.href) && 'bg-sidebar-primary text-sidebar-primary-foreground'
                                  )}
                                >
                                  <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                  <span>{child.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
                      'transition-colors duration-150',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive(item.href) && 'bg-sidebar-primary text-sidebar-primary-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'fixed top-3 left-3 z-40 lg:hidden',
          'bg-card shadow-md hover:bg-accent',
          isOpen && 'hidden'
        )}
        onClick={onToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};
