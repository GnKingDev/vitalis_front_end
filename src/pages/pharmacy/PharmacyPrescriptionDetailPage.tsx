import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  User,
  Stethoscope,
  Calendar,
  Pill,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  mockPrescriptions,
  mockPatients,
  mockUsers,
  mockPharmacyProducts,
} from '@/data/mockData';
import { toast } from 'sonner';
import type { PrescriptionItem, PharmacyProduct, PaymentMethod } from '@/types';

const PharmacyPrescriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReference, setPaymentReference] = useState('');

  // Trouver l'ordonnance
  const prescription = useMemo(() => {
    return mockPrescriptions.find((p) => p.id === id);
  }, [id]);

  // Obtenir le patient
  const patient = useMemo(() => {
    if (!prescription) return null;
    return mockPatients.find((p) => p.id === prescription.patientId);
  }, [prescription]);

  // Obtenir le médecin
  const doctor = useMemo(() => {
    if (!prescription) return null;
    return mockUsers.find((u) => u.id === prescription.doctorId);
  }, [prescription]);

  // Trouver un produit dans le stock par nom de médicament
  const findProductInStock = (medicationName: string): PharmacyProduct | null => {
    return mockPharmacyProducts.find(
      (product) => product.name.toLowerCase() === medicationName.toLowerCase()
    ) || null;
  };

  // Vérifier si un produit est disponible en stock
  const isProductAvailable = (item: PrescriptionItem): { available: boolean; product: PharmacyProduct | null; stock: number } => {
    const product = findProductInStock(item.medicationName);
    if (!product) {
      return { available: false, product: null, stock: 0 };
    }
    const available = product.stock >= item.quantity;
    return { available, product, stock: product.stock };
  };

  // Obtenir les médicaments disponibles
  const availableItems = useMemo(() => {
    if (!prescription) return [];
    return prescription.items.filter((item) => {
      const { available } = isProductAvailable(item);
      return available;
    });
  }, [prescription]);

  // Calculer le total des items sélectionnés
  const calculateSelectedTotal = () => {
    if (!prescription) return 0;
    
    return prescription.items
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((total, item) => {
        const product = findProductInStock(item.medicationName);
        if (product) {
          return total + product.price * item.quantity;
        }
        return total;
      }, 0);
  };

  // Vérifier si tous les items sélectionnés sont disponibles
  const areSelectedItemsAvailable = () => {
    if (!prescription) return false;
    
    return prescription.items
      .filter((item) => selectedItemIds.includes(item.id))
      .every((item) => {
        const { available } = isProductAvailable(item);
        return available;
      });
  };

  // Traiter le paiement
  const handleProcessPayment = () => {
    if (!prescription || selectedItemIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un médicament');
      return;
    }

    if (!areSelectedItemsAvailable()) {
      toast.error('Certains médicaments sélectionnés ne sont pas disponibles en stock');
      return;
    }

    setIsPaymentDialogOpen(true);
  };

  // Confirmer le paiement
  const handleConfirmPayment = () => {
    if (!prescription || !user) return;

    const totalAmount = calculateSelectedTotal();
    
    // Créer le paiement (dans un vrai système, cela serait fait via une API)
    const newPayment = {
      id: `pay-pharmacy-${Date.now()}`,
      patientId: prescription.patientId,
      amount: totalAmount,
      method: paymentMethod,
      status: 'paid' as const,
      type: 'pharmacy' as const,
      reference: paymentReference || undefined,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    // Diminuer le stock pour chaque produit sélectionné
    prescription.items
      .filter((item) => selectedItemIds.includes(item.id))
      .forEach((item) => {
        const product = findProductInStock(item.medicationName);
        if (product) {
          // Dans un vrai système, cela serait fait via une API
          product.stock -= item.quantity;
        }
      });

    // Mettre à jour le statut de l'ordonnance
    // Dans un vrai système, cela serait fait via une API
    if (selectedItemIds.length === prescription.items.length) {
      prescription.status = 'delivered';
    } else {
      prescription.status = 'preparing';
    }

    toast.success(`Paiement de ${totalAmount.toLocaleString()} GNF enregistré avec succès`);
    
    // Fermer le dialog et retourner à la liste
    setIsPaymentDialogOpen(false);
    navigate('/pharmacy/prescriptions');
  };

  if (!prescription) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ordonnance introuvable" description="Cette ordonnance n'existe pas" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">L'ordonnance est introuvable.</p>
            <Button onClick={() => navigate('/pharmacy/prescriptions')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader title="Patient introuvable" description="Le patient associé à cette ordonnance n'existe pas" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Le patient associé à cette ordonnance est introuvable.</p>
            <Button onClick={() => navigate('/pharmacy/prescriptions')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/pharmacy/prescriptions')}
          className="gap-2 mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`Ordonnance - ${prescription.id}`}
            description="Détails de l'ordonnance et sélection des médicaments"
          />
        </div>
      </div>

      {/* Section 1: Détails de l'ordonnance */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Informations de l'ordonnance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Patient</Label>
              <div className="mt-1 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{patient.vitalisId}</p>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Médecin</Label>
              <div className="mt-1 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{doctor?.name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date de prescription</Label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Statut</Label>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={
                    prescription.status === 'sent_to_pharmacy'
                      ? 'bg-info/10 text-info border-info'
                      : 'bg-warning/10 text-warning border-warning'
                  }
                >
                  {prescription.status === 'sent_to_pharmacy' ? 'Reçue' : 'En préparation'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes du médecin */}
          {prescription.notes && (
            <div>
              <Label className="text-sm text-muted-foreground">Notes du médecin</Label>
              <div className="mt-1 bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm">{prescription.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Liste des médicaments prescrits (en tags) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Médicaments prescrits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {prescription.items.map((item) => {
              const { available, product, stock } = isProductAvailable(item);
              return (
                <Badge
                  key={item.id}
                  variant="outline"
                  className={
                    available
                      ? 'bg-success/10 text-success border-success'
                      : product
                      ? 'bg-warning/10 text-warning border-warning'
                      : 'bg-destructive/10 text-destructive border-destructive'
                  }
                >
                  {available ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : product ? (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {item.medicationName} - {item.quantity} {product?.unit || 'unité(s)'}
                  {available && ` (Stock: ${stock})`}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Sélection des médicaments disponibles (liste déroulante) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Sélectionner les médicaments disponibles</span>
            <Badge variant="outline" className="text-sm">
              {availableItems.length} disponible(s) sur {prescription.items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="medications-select">Médicaments disponibles</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedItemIds.includes(value)) {
                  setSelectedItemIds([...selectedItemIds, value]);
                }
              }}
            >
              <SelectTrigger id="medications-select" className="mt-2">
                <SelectValue placeholder="Sélectionner un médicament disponible" />
              </SelectTrigger>
              <SelectContent>
                {availableItems
                  .filter((item) => !selectedItemIds.includes(item.id))
                  .map((item) => {
                    const { product, stock } = isProductAvailable(item);
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{item.medicationName}</span>
                          <span className="ml-4 text-sm text-muted-foreground">
                            {product && `${(product.price * item.quantity).toLocaleString()} GNF`}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                {availableItems.filter((item) => !selectedItemIds.includes(item.id)).length === 0 && (
                  <SelectItem value="" disabled>
                    Tous les médicaments disponibles ont été sélectionnés
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des médicaments sélectionnés */}
          {selectedItemIds.length > 0 && (
            <div className="space-y-3">
              <Label>Médicaments sélectionnés</Label>
              <div className="space-y-2">
                {prescription.items
                  .filter((item) => selectedItemIds.includes(item.id))
                  .map((item) => {
                    const { product, stock } = isProductAvailable(item);
                    return (
                      <Card key={item.id} className="border-primary border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{item.medicationName}</p>
                              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium">Dosage:</span> {item.dosage}
                                </p>
                                <p>
                                  <span className="font-medium">Fréquence:</span> {item.frequency}
                                </p>
                                <p>
                                  <span className="font-medium">Durée:</span> {item.duration}
                                </p>
                                <p>
                                  <span className="font-medium">Quantité:</span> {item.quantity} {product?.unit || 'unité(s)'}
                                </p>
                                {item.instructions && (
                                  <p className="italic">
                                    <span className="font-medium">Instructions:</span> {item.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              {product && (
                                <>
                                  <p className="text-sm text-muted-foreground">Prix unitaire</p>
                                  <p className="font-semibold">
                                    {product.price.toLocaleString()} GNF / {product.unit}
                                  </p>
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="font-bold text-lg text-primary">
                                      {(product.price * item.quantity).toLocaleString()} GNF
                                    </p>
                                  </div>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Total */}
          {selectedItemIds.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {selectedItemIds.length} médicament{selectedItemIds.length > 1 ? 's' : ''} sélectionné{selectedItemIds.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-lg font-semibold mt-1">Total à payer</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {calculateSelectedTotal().toLocaleString()} GNF
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bouton de paiement */}
      {selectedItemIds.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItemIds([]);
                }}
              >
                Réinitialiser la sélection
              </Button>
              <Button
                onClick={handleProcessPayment}
                disabled={!areSelectedItemsAvailable()}
                className="gap-2"
                size="lg"
              >
                <CreditCard className="h-4 w-4" />
                Procéder au paiement ({selectedItemIds.length} médicament{selectedItemIds.length > 1 ? 's' : ''})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog Paiement */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paiement</DialogTitle>
            <DialogDescription>
              Confirmez le paiement pour finaliser la transaction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Montant total</Label>
              <div className="mt-1 text-2xl font-bold text-primary">
                {calculateSelectedTotal().toLocaleString()} GNF
              </div>
            </div>

            <div>
              <Label>Méthode de paiement</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'orange_money' && (
              <div>
                <Label>Référence de transaction</Label>
                <Input
                  className="mt-1"
                  placeholder="Ex: OM-20260128-001"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPayment} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyPrescriptionDetailPage;
