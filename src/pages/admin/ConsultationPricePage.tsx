import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DollarSign, Save, Edit } from 'lucide-react';
import { getConsultationPrice, updateConsultationPrice } from '@/services/api/consultationPriceService';

const ConsultationPricePage: React.FC = () => {
  const [price, setPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Charger le prix actuel
  useEffect(() => {
    const loadPrice = async () => {
      try {
        setIsLoading(true);
        const response = await getConsultationPrice();
        if (response.success && response.data) {
          const currentPrice = response.data.price || 0;
          setPrice(formatPrice(currentPrice.toString()));
        } else {
          // Si aucun prix n'existe, initialiser à vide
          setPrice('');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du prix:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger le prix de consultation',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrice();
  }, []);

  // Formater un nombre avec des points comme séparateurs de milliers
  const formatPrice = (value: string | number): string => {
    if (!value) return '';
    const numericValue = value.toString().replace(/\./g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parser une valeur formatée en nombre
  const parsePrice = (value: string): number => {
    if (!value) return 0;
    return parseInt(value.replace(/\./g, ''), 10) || 0;
  };

  // Gérer le changement de prix
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Garder uniquement les chiffres
    if (value === '') {
      setPrice('');
      return;
    }
    setPrice(formatPrice(value));
  };

  // Sauvegarder le prix
  const handleSave = async () => {
    const numericPrice = parsePrice(price);
    
    if (numericPrice <= 0) {
      toast.error('Erreur', {
        description: 'Le prix doit être supérieur à 0',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateConsultationPrice({ price: numericPrice });
      if (response.success) {
        toast.success('Prix de consultation mis à jour avec succès');
        setIsEditing(false);
      } else {
        toast.error('Erreur', {
          description: response.message || 'Impossible de mettre à jour le prix',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du prix:', error);
      toast.error('Erreur', {
        description: error?.message || 'Impossible de sauvegarder le prix',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Annuler l'édition
  const handleCancel = async () => {
    // Recharger le prix actuel
    try {
      const response = await getConsultationPrice();
      if (response.success && response.data) {
        const currentPrice = response.data.price || 0;
        setPrice(formatPrice(currentPrice.toString()));
      } else {
        setPrice('');
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du prix:', error);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Prix de consultation"
          description="Gérer le prix de la consultation"
        />
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prix de consultation"
        description="Définir le prix unique de la consultation médicale"
      />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Configuration du prix
          </CardTitle>
          <CardDescription>
            Le prix défini ici sera appliqué à toutes les consultations médicales.
            Vous pouvez le modifier à tout moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="price">Prix de consultation (GNF)</Label>
            <div className="relative">
              <Input
                id="price"
                type="text"
                value={price}
                onChange={handlePriceChange}
                placeholder="Ex: 50.000"
                disabled={!isEditing}
                className="text-lg font-semibold pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                GNF
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Saisissez le montant en GNF (ex: 50000 ou 50.000)
            </p>
          </div>

          {price && !isEditing && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Prix actuel</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(price)} GNF
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="gap-2"
                disabled={isSaving}
              >
                <Edit className="h-4 w-4" />
                Modifier le prix
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  className="gap-2"
                  disabled={isSaving || !price}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationPricePage;
