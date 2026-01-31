import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  AlertTriangle,
  FileText,
  Pill,
  ArrowRight,
  TrendingDown,
  Check,
} from 'lucide-react';
import {
  mockPharmacyProducts,
  mockStockAlerts,
  mockPrescriptions,
  mockPatients,
  mockUsers,
} from '@/data/mockData';
import { Link } from 'react-router-dom';

const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();

  // Stock alerts
  const outOfStock = mockStockAlerts.filter(a => a.type === 'out_of_stock');
  const lowStock = mockStockAlerts.filter(a => a.type === 'low_stock');

  // Prescriptions
  const pendingPrescriptions = mockPrescriptions.filter(
    p => p.status === 'sent_to_pharmacy' || p.status === 'preparing'
  );
  const readyPrescriptions = mockPrescriptions.filter(p => p.status === 'ready');

  const getPatient = (patientId: string) => mockPatients.find(p => p.id === patientId);
  const getDoctor = (doctorId: string) => mockUsers.find(u => u.id === doctorId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacie"
        description="Gestion du stock et des ordonnances"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Produits en stock"
          value={mockPharmacyProducts.length}
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title="Ruptures de stock"
          value={outOfStock.length}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Stock faible"
          value={lowStock.length}
          icon={TrendingDown}
          variant="warning"
        />
        <StatsCard
          title="Ordonnances à préparer"
          value={pendingPrescriptions.length}
          icon={FileText}
          variant="default"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertes stock
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pharmacy/alerts" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mockStockAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-3 text-success opacity-50" />
                <p>Stock optimal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockStockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'out_of_stock'
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-warning/5 border-warning/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{alert.productName}</p>
                      <StatusBadge status={alert.type} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Stock: {alert.currentStock}</span>
                      <span>•</span>
                      <span>Min: {alert.minStock}</span>
                    </div>
                    <Progress
                      value={(alert.currentStock / alert.minStock) * 100}
                      className="h-1.5 mt-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending prescriptions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Ordonnances à traiter
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pharmacy/prescriptions" className="flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune ordonnance en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPrescriptions.map((prescription) => {
                  const patient = getPatient(prescription.patientId);
                  const doctor = getDoctor(prescription.doctorId);
                  return (
                    <div
                      key={prescription.id}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient?.vitalisId} • Prescrit par {doctor?.name}
                          </p>
                        </div>
                        <StatusBadge status={prescription.status} />
                      </div>
                      <div className="space-y-2 mb-3">
                        {prescription.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm bg-background/50 p-2 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-muted-foreground" />
                              <span>{item.medicationName}</span>
                            </div>
                            <span className="text-muted-foreground">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {prescription.status === 'sent_to_pharmacy' ? (
                          <Button size="sm" className="flex-1">
                            Préparer
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="flex-1">
                              Imprimer
                            </Button>
                            <Button size="sm" className="flex-1">
                              Marquer prête
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ready prescriptions */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Check className="h-5 w-5 text-success" />
              Ordonnances prêtes à délivrer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readyPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune ordonnance prête</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médicaments</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Médecin</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readyPrescriptions.map((prescription) => {
                      const patient = getPatient(prescription.patientId);
                      const doctor = getDoctor(prescription.doctorId);
                      return (
                        <tr key={prescription.id} className="border-b hover:bg-secondary/30">
                          <td className="py-3 px-4">
                            <p className="font-medium">
                              {patient?.firstName} {patient?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {patient?.vitalisId}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {prescription.items.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item.medicationName.substring(0, 12)}...
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {doctor?.name}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={prescription.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button size="sm">
                              Délivrer + Paiement
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
