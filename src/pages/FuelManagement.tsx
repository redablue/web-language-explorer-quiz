
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fuel, Plus, AlertTriangle, TrendingDown, Droplets } from "lucide-react";
import { useFuelTanks, useUpdateFuelLevel } from "@/hooks/useFuelTanks";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

const FuelManagement = () => {
  const { isManagerOrHigher } = useAuth();
  const { data: fuelTanks = [], isLoading } = useFuelTanks();
  const { data: sales = [] } = useSales();
  const updateFuelLevel = useUpdateFuelLevel();

  const managementStats = useMemo(() => {
    const totalStock = fuelTanks.reduce((sum, tank) => sum + tank.current_level, 0);
    const totalCapacity = fuelTanks.reduce((sum, tank) => sum + tank.capacity, 0);
    const totalValue = fuelTanks.reduce((sum, tank) => sum + (tank.current_level * tank.price_per_liter), 0);
    const estimatedLoss = 45; // Simulation des pertes
    
    return {
      totalStock,
      totalCapacity,
      totalValue,
      estimatedLoss
    };
  }, [fuelTanks]);

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'essence_95': return 'Essence 95';
      case 'essence_98': return 'Essence 98';
      case 'diesel': return 'Diesel';
      case 'gasoil': return 'Gasoil';
      default: return fuelType;
    }
  };

  const getStatusColor = (currentLevel: number, minThreshold: number) => {
    if (currentLevel <= minThreshold) return "destructive";
    if (currentLevel <= minThreshold * 1.5) return "secondary";
    return "default";
  };

  const getStatusLabel = (currentLevel: number, minThreshold: number) => {
    if (currentLevel <= minThreshold) return "Stock Critique";
    if (currentLevel <= minThreshold * 1.5) return "Stock Faible";
    return "Normal";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-orange-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Carburants</h1>
        {isManagerOrHigher() && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Approvisionnement
          </Button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managementStats.totalStock.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground">
              Capacité totale: {managementStats.totalCapacity.toLocaleString()} L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes Estimées</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managementStats.estimatedLoss} L</div>
            <p className="text-xs text-muted-foreground">
              Évaporation + Coulage (24h)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managementStats.totalValue.toLocaleString()} MAD</div>
            <p className="text-xs text-muted-foreground">
              Valorisation actuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tank Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fuelTanks.map((tank) => {
          const percentage = Math.round((tank.current_level / tank.capacity) * 100);
          const isLow = tank.current_level <= tank.min_threshold;
          
          return (
            <Card key={tank.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{tank.name}</CardTitle>
                  <Badge variant={getStatusColor(tank.current_level, tank.min_threshold)}>
                    {getStatusLabel(tank.current_level, tank.min_threshold)}
                  </Badge>
                </div>
                <CardDescription>Type: {getFuelTypeLabel(tank.fuel_type)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Niveau actuel</span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{tank.current_level.toLocaleString()} L</span>
                    <span>{tank.capacity.toLocaleString()} L</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix actuel:</span>
                    <span className="font-medium">{tank.price_per_liter} MAD/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valeur stock:</span>
                    <span className="font-medium">
                      {(tank.current_level * tank.price_per_liter).toLocaleString()} MAD
                    </span>
                  </div>
                </div>

                {isLow && (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Réapprovisionnement requis</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Jaugeage
                  </Button>
                  {isManagerOrHigher() && (
                    <Button size="sm" className="flex-1">
                      Commander
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Mouvements Récents</CardTitle>
          <CardDescription>Dernières transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale, index) => {
              const tank = fuelTanks.find(t => t.id === sale.fuel_tank_id);
              return (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">
                        Vente - {tank ? getFuelTypeLabel(tank.fuel_type) : 'Carburant'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">-{sale.quantity}L</p>
                    <p className="text-sm text-muted-foreground">{sale.total_amount} MAD</p>
                  </div>
                </div>
              );
            })}
            
            {sales.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune transaction récente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelManagement;
