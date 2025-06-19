
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Wrench, AlertTriangle, Power } from "lucide-react";
import { usePumps, useUpdatePumpStatus, type Pump } from "@/hooks/usePumps";
import { useAuth } from "@/hooks/useAuth";

const PumpGrid = () => {
  const { data: pumps = [] } = usePumps();
  const { mutate: updatePumpStatus } = useUpdatePumpStatus();
  const { isManagerOrHigher } = useAuth();

  const getStatusColor = (status: Pump['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-orange-500';
      case 'out_of_order': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Pump['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Maintenance';
      case 'out_of_order': return 'Hors Service';
      default: return status;
    }
  };

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'gasoil': return 'Gasoil';
      case 'essence': return 'Essence';
      case 'melange': return 'Mélange';
      default: return fuelType;
    }
  };

  const handleStatusChange = (pumpId: string, newStatus: Pump['status']) => {
    updatePumpStatus({ id: pumpId, status: newStatus });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {pumps.map((pump) => (
        <Card key={pump.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{pump.name}</CardTitle>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(pump.status)}`} />
            </div>
            <Badge variant="secondary" className="w-fit">
              {getStatusLabel(pump.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {pump.fuel_tanks ? getFuelTypeLabel(pump.fuel_tanks.fuel_type) : 'N/A'}
              </span>
            </div>
            
            {pump.fuel_tanks && (
              <>
                <div className="text-sm">
                  <span className="font-medium">Prix:</span> {pump.fuel_tanks.price_per_liter.toFixed(2)} MAD/L
                </div>
                <div className="text-sm">
                  <span className="font-medium">Niveau:</span> {pump.fuel_tanks.current_level.toLocaleString()} L
                </div>
              </>
            )}
            
            <div className="text-sm">
              <span className="font-medium">Total distribué:</span> {pump.total_dispensed.toLocaleString()} L
            </div>

            {isManagerOrHigher() && (
              <div className="flex gap-1 mt-3">
                {pump.status !== 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(pump.id, 'active')}
                    className="text-xs"
                  >
                    <Power className="w-3 h-3 mr-1" />
                    Activer
                  </Button>
                )}
                {pump.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(pump.id, 'maintenance')}
                    className="text-xs"
                  >
                    <Wrench className="w-3 h-3 mr-1" />
                    Maintenance
                  </Button>
                )}
                {pump.status !== 'inactive' && pump.status !== 'out_of_order' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(pump.id, 'inactive')}
                    className="text-xs"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Désactiver
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PumpGrid;
