
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, TrendingUp, Users, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { useFuelTanks } from "@/hooks/useFuelTanks";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: fuelTanks = [] } = useFuelTanks();
  const { data: sales = [] } = useSales({
    from: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
    to: new Date().toISOString().split('T')[0] + 'T23:59:59.999Z'
  });

  const dashboardStats = useMemo(() => {
    const todaysSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const todaysLiters = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const lowStockTanks = fuelTanks.filter(tank => tank.current_level <= tank.min_threshold);
    
    return {
      todaysSales,
      todaysLiters,
      lowStockCount: lowStockTanks.length,
      totalTanks: fuelTanks.length
    };
  }, [sales, fuelTanks]);

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'essence_95': return 'Essence 95';
      case 'essence_98': return 'Essence 98';
      case 'diesel': return 'Diesel';
      case 'gasoil': return 'Gasoil';
      default: return fuelType;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord - Station de Service</h1>
          {profile && (
            <p className="text-muted-foreground mt-1">
              Bienvenue, {profile.full_name} ({profile.role})
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('fr-MA')}
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes Aujourd'hui</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.todaysSales.toFixed(2)} MAD</div>
            <p className="text-xs text-muted-foreground">
              {sales.length} transaction{sales.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Litres Vendus</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.todaysLiters.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">
              Volume total aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuves Actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalTanks}</div>
            <p className="text-xs text-muted-foreground">
              Cuves en service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${dashboardStats.lowStockCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardStats.lowStockCount > 0 ? 'text-orange-500' : ''}`}>
              {dashboardStats.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Cuves à réapprovisionner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes par Carburant</CardTitle>
            <CardDescription>Répartition des ventes aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fuelTanks.slice(0, 3).map((tank, index) => {
                const tankSales = sales
                  .filter(sale => sale.fuel_tank_id === tank.id)
                  .reduce((sum, sale) => sum + sale.total_amount, 0);
                const percentage = dashboardStats.todaysSales > 0 
                  ? (tankSales / dashboardStats.todaysSales) * 100 
                  : 0;
                
                const colors = ['bg-primary', 'bg-blue-500', 'bg-green-500'];
                
                return (
                  <div key={tank.id}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{getFuelTypeLabel(tank.fuel_type)}</span>
                      <span className="font-medium">{tankSales.toFixed(2)} MAD ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div 
                        className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Niveau des Stocks</CardTitle>
            <CardDescription>État actuel des cuves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fuelTanks.slice(0, 3).map((tank) => {
                const percentage = (tank.current_level / tank.capacity) * 100;
                const isLow = tank.current_level <= tank.min_threshold;
                
                return (
                  <div key={tank.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{tank.name}</span>
                      <span className={`text-sm font-medium ${isLow ? 'text-orange-500' : ''}`}>
                        {tank.current_level.toLocaleString()}L / {tank.capacity.toLocaleString()}L
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage > 50 ? 'bg-green-500' : 
                          percentage > 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <Fuel className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm">Nouvelle Vente</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm">Rapport Journalier</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm">Gestion Équipe</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
