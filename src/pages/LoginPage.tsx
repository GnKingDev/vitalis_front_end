import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleLabel } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { UserRole } from '@/types';
import {
  Shield,
  UserPlus,
  Stethoscope,
  FlaskConical,
  Pill,
} from 'lucide-react';

const roleConfig: Record<UserRole, { icon: React.ElementType; color: string; description: string }> = {
  admin: {
    icon: Shield,
    color: 'from-violet-500 to-purple-600',
    description: 'Accès complet au système',
  },
  reception: {
    icon: UserPlus,
    color: 'from-blue-500 to-cyan-600',
    description: 'Enregistrement et paiements',
  },
  doctor: {
    icon: Stethoscope,
    color: 'from-emerald-500 to-green-600',
    description: 'Consultations et prescriptions',
  },
  lab: {
    icon: FlaskConical,
    color: 'from-amber-500 to-orange-600',
    description: 'Examens et résultats',
  },
  pharmacy: {
    icon: Pill,
    color: 'from-teal-500 to-cyan-600',
    description: 'Stock et délivrance',
  },
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">V</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">VITALIS</h1>
            <p className="text-sm text-muted-foreground">Clinique Médicale</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
              Bienvenue sur VITALIS
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Système de gestion de clinique médicale. Sélectionnez votre profil pour accéder au tableau de bord.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;

              return (
                <Card
                  key={role}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50"
                  onClick={() => handleLogin(role)}
                >
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                        config.color
                      )}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {getRoleLabel(role)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                    <Button
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                      variant="outline"
                    >
                      Se connecter
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Mode démonstration — Sélectionnez un rôle pour explorer l'interface
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 sm:px-6 text-center text-sm text-muted-foreground">
        <p>© 2026 VITALIS Clinique Médicale. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

// Helper for cn in this file
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

export default LoginPage;
