import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import vitalisLogo from '@/assets/logo-vitalis.png';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { login as apiLogin } from '@/services/api/authService';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation basique
      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        setIsLoading(false);
        return;
      }

      // Appel API pour la connexion
      const { token, user } = await apiLogin({ email, password });

      // Mettre à jour le contexte d'authentification
      login(user.role);

      // Vérifier si l'utilisateur doit changer son mot de passe
      if (user.mustChangePassword) {
        toast.info('Changement de mot de passe requis', {
          description: 'Veuillez modifier votre mot de passe avant de continuer',
        });
        navigate('/change-password');
      } else {
        toast.success('Connexion réussie', {
          description: `Bienvenue ${user.name}`,
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Email ou mot de passe incorrect';
      setError(errorMessage);
      toast.error('Erreur de connexion', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="mb-8">
          <img 
            src={vitalisLogo} 
            alt="VITALIS Clinique Médicale" 
              className="h-20 w-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-foreground mb-3">
              VITALIS
            </h1>
            <p className="text-xl text-muted-foreground text-center">
              Centre Médical
            </p>
          </div>

          <div className="mt-12 space-y-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Gestion complète</h3>
                <p className="text-sm text-muted-foreground">
                  Système intégré pour la gestion de votre clinique médicale
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Sécurisé</h3>
                <p className="text-sm text-muted-foreground">
                  Vos données sont protégées avec les dernières technologies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src={vitalisLogo} 
              alt="VITALIS Clinique Médicale" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">VITALIS</h1>
            <p className="text-muted-foreground">Centre Médical</p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour accéder à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@vitalis.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <span className="text-muted-foreground">Se souvenir de moi</span>
                  </label>
                  <a
                    href="#"
                    className="text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Fonctionnalité à venir');
                    }}
                  >
                    Mot de passe oublié ?
                  </a>
                    </div>

                    <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Se connecter
                    </>
                  )}
                    </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  Connectez-vous avec vos identifiants VITALIS
                </p>
              </div>
                  </CardContent>
                </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2026 VITALIS Clinique Médicale. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
