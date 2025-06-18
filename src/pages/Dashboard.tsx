
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, TrendingUp, Users, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord - Station de Service</h1>
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
            <div className="text-2xl font-bold">45,230 MAD</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Litres Vendus</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,245 L</div>
            <p className="text-xs text-muted-foreground">
              +8% par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Présents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <p className="text-xs text-muted-foreground">
              80% de présence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">3</div>
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
              <div className="flex items-center justify-between">
                <span className="text-sm">Gasoil</span>
                <span className="font-medium">15,230 MAD (45%)</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full w-[45%]"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Super</span>
                <span className="font-medium">20,150 MAD (35%)</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full w-[35%]"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium</span>
                <span className="font-medium">9,850 MAD (20%)</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full">
                <div className="bg-green-500 h-2 rounded-full w-[20%]"></div>
              </div>
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cuve 1 - Gasoil</span>
                  <span className="text-sm font-medium">8,500L / 10,000L</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full w-[85%]"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cuve 2 - Super</span>
                  <span className="text-sm font-medium text-orange-500">2,100L / 8,000L</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-orange-500 h-2 rounded-full w-[26%]"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Cuve 3 - Premium</span>
                  <span className="text-sm font-medium">4,200L / 6,000L</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full w-[70%]"></div>
                </div>
              </div>
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
