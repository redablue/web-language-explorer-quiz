
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePumps } from "@/hooks/usePumps";
import PumpGrid from "@/components/pumps/PumpGrid";
import { Fuel, AlertTriangle, Wrench, Power } from "lucide-react";
import { useMemo } from "react";

const PumpManagement = () => {
  const { data: pumps = [] } = usePumps();

  const pumpStats = useMemo(() => {
    const active = pumps.filter(p => p.status === 'active').length;
    const maintenance = pumps.filter(p => p.status === 'maintenance').length;
    const inactive = pumps.filter(p => p.status === 'inactive').length;
    const outOfOrder = pumps.filter(p => p.status === 'out_of_order').length;
    
    return { active, maintenance, inactive, outOfOrder };
  }, [pumps]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Pompes</h1>
        <p className="text-muted-foreground mt-1">
          Surveillance et contrôle des 8 pompes de la station
        </p>
      </div>

      {/* Statistiques des pompes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pompes Actives</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pumpStats.active}</div>
            <p className="text-xs text-muted-foreground">En fonctionnement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pumpStats.maintenance}</div>
            <p className="text-xs text-muted-foreground">Maintenance programmée</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{pumpStats.inactive}</div>
            <p className="text-xs text-muted-foreground">Temporairement arrêtées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hors Service</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pumpStats.outOfOrder}</div>
            <p className="text-xs text-muted-foreground">Nécessitent réparation</p>
          </CardContent>
        </Card>
      </div>

      {/* Grille des pompes */}
      <Card>
        <CardHeader>
          <CardTitle>État des Pompes</CardTitle>
          <CardDescription>
            Vue d'ensemble en temps réel de toutes les pompes de la station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PumpGrid />
        </CardContent>
      </Card>
    </div>
  );
};

export default PumpManagement;
