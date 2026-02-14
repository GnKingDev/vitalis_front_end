import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Check,
} from 'lucide-react';
import { getPharmacyAlerts, getPharmacyAlertsStats, getPharmacyProducts } from '@/services/api/pharmacyService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les alertes
        const alertsResponse = await getPharmacyAlerts();
        if (alertsResponse.success && alertsResponse.data) {
          const alertsData = Array.isArray(alertsResponse.data) 
            ? alertsResponse.data 
            : alertsResponse.data.alerts || [];
          setAlerts(alertsData);
        }

        // Charger les statistiques
        const statsResponse = await getPharmacyAlertsStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

        // Charger le nombre total de produits
        const productsResponse = await getPharmacyProducts();
        if (productsResponse.success && productsResponse.data) {
          const products = Array.isArray(productsResponse.data) 
            ? productsResponse.data 
            : productsResponse.data.products || [];
          setStats(prev => ({ ...prev, totalProducts: products.length }));
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger les données du dashboard',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacie"
        description="Gestion du stock et des ordonnances"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Produits en stock"
          value={stats.totalProducts}
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title="Ruptures de stock"
          value={stats.outOfStock}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Stock faible"
          value={stats.lowStock}
          icon={TrendingDown}
          variant="warning"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6">
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
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-3 text-success opacity-50" />
                <p>Stock optimal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
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
      </div>
    </div>
  );
};

export default PharmacyDashboard;
