
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Fuel, Plus, AlertTriangle, TrendingDown, Droplets } from "lucide-react";

const FuelManagement = () => {
  const tanks = [
    {
      id: 1,
      name: "Cuve 1 - Gasoil",
      type: "Gasoil",
      current: 8500,
      capacity: 10000,
      status: "normal",
      lastFilled: "2024-01-15",
      price: 14.20
    },
    {
      id: 2,
      name: "Cuve 2 - Super",
      type: "Super",
      current: 2100,
      capacity: 8000,
      status: "low",
      lastFilled: "2024-01-10",
      price: 15.80
    },
    {
      id: 3,
      name: "Cuve 3 - Premium",
      type: "Premium",
      current: 4200,
      capacity: 6000,
      status: "normal",
      lastFilled: "2024-01-12",
      price: 17.50
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low": return "destructive";
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Carburants</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Approvisionnement
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,800 L</div>
            <p className="text-xs text-muted-foreground">
              Capacité totale: 24,000 L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pertes Estimées</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 L</div>
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
            <div className="text-2xl font-bold">234,580 MAD</div>
            <p className="text-xs text-muted-foreground">
              Valorisation actuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tank Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tanks.map((tank) => {
          const percentage = Math.round((tank.current / tank.capacity) * 100);
          return (
            <Card key={tank.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{tank.name}</CardTitle>
                  <Badge variant={getStatusColor(tank.status)}>
                    {tank.status === "low" ? "Stock Faible" : "Normal"}
                  </Badge>
                </div>
                <CardDescription>Type: {tank.type}</CardDescription>
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
                    <span>{tank.current.toLocaleString()} L</span>
                    <span>{tank.capacity.toLocaleString()} L</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix actuel:</span>
                    <span className="font-medium">{tank.price} MAD/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernier plein:</span>
                    <span>{tank.lastFilled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valeur stock:</span>
                    <span className="font-medium">
                      {(tank.current * tank.price).toLocaleString()} MAD
                    </span>
                  </div>
                </div>

                {tank.status === "low" && (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Réapprovisionnement requis</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Jaugeage
                  </Button>
                  <Button size="sm" className="flex-1">
                    Commander
                  </Button>
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
          <CardDescription>Dernières livraisons et ventes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "Livraison", product: "Gasoil", quantity: "+5000 L", date: "15/01/2024", amount: "+71,000 MAD" },
              { type: "Vente", product: "Super", quantity: "-1250 L", date: "15/01/2024", amount: "-19,750 MAD" },
              { type: "Vente", product: "Premium", quantity: "-800 L", date: "15/01/2024", amount: "-14,000 MAD" },
              { type: "Livraison", product: "Super", quantity: "+3000 L", date: "10/01/2024", amount: "+47,400 MAD" }
            ].map((movement, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${movement.type === "Livraison" ? "bg-green-500" : "bg-blue-500"}`}></div>
                  <div>
                    <p className="font-medium">{movement.type} - {movement.product}</p>
                    <p className="text-sm text-muted-foreground">{movement.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{movement.quantity}</p>
                  <p className="text-sm text-muted-foreground">{movement.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelManagement;
