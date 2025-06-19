
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFuelTanks } from "@/hooks/useFuelTanks";
import { usePumps } from "@/hooks/usePumps";
import { useCreateSale } from "@/hooks/useSales";
import { Fuel, Calculator } from "lucide-react";

const FuelSaleForm = () => {
  const [selectedFuelTank, setSelectedFuelTank] = useState("");
  const [selectedPump, setSelectedPump] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { data: fuelTanks = [] } = useFuelTanks();
  const { data: pumps = [] } = usePumps();
  const { mutate: createSale, isPending } = useCreateSale();

  const selectedTank = fuelTanks.find(tank => tank.id === selectedFuelTank);
  const activePumps = pumps.filter(pump => pump.status === 'active');
  const availablePumps = selectedFuelTank 
    ? activePumps.filter(pump => pump.fuel_tank_id === selectedFuelTank)
    : activePumps;

  const calculateTotal = () => {
    if (!selectedTank || !quantity) return 0;
    return Number(quantity) * selectedTank.price_per_liter;
  };

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'gasoil': return 'Gasoil';
      case 'essence': return 'Essence';
      case 'melange': return 'Mélange';
      default: return fuelType;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTank || !quantity || Number(quantity) <= 0) {
      return;
    }

    createSale({
      fuel_tank_id: selectedFuelTank,
      pump_id: selectedPump || undefined,
      quantity: Number(quantity),
      price_per_liter: selectedTank.price_per_liter,
      payment_method: paymentMethod,
    });

    // Reset form
    setSelectedFuelTank("");
    setSelectedPump("");
    setQuantity("");
    setPaymentMethod("cash");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5" />
          Vente de Carburant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fuel-tank">Type de Carburant</Label>
            <Select value={selectedFuelTank} onValueChange={setSelectedFuelTank}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un carburant" />
              </SelectTrigger>
              <SelectContent>
                {fuelTanks.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id}>
                    {getFuelTypeLabel(tank.fuel_type)} - {tank.price_per_liter.toFixed(2)} MAD/L
                    <span className="text-muted-foreground ml-2">
                      ({tank.current_level.toLocaleString()}L disponible)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFuelTank && availablePumps.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="pump">Pompe (Optionnel)</Label>
              <Select value={selectedPump} onValueChange={setSelectedPump}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une pompe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune pompe spécifique</SelectItem>
                  {availablePumps.map((pump) => (
                    <SelectItem key={pump.id} value={pump.id}>
                      {pump.name} (Position {pump.position_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité (Litres)</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Mode de Paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte</SelectItem>
                <SelectItem value="credit">Crédit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTank && quantity && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4" />
                <span className="font-medium">Calcul</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Quantité:</span>
                  <span>{quantity} L</span>
                </div>
                <div className="flex justify-between">
                  <span>Prix unitaire:</span>
                  <span>{selectedTank.price_per_liter.toFixed(2)} MAD/L</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{calculateTotal().toFixed(2)} MAD</span>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!selectedTank || !quantity || Number(quantity) <= 0 || isPending}
          >
            {isPending ? "Enregistrement..." : "Enregistrer la Vente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FuelSaleForm;
