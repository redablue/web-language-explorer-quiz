
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FuelSaleForm from "@/components/pos/FuelSaleForm";
import { ShoppingCart, Fuel, Receipt } from "lucide-react";

const PointOfSale = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point de Vente</h1>
        <p className="text-muted-foreground mt-1">
          Système de caisse pour les ventes de carburant et articles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vente de carburant */}
        <FuelSaleForm />

        {/* Statistiques rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Résumé du jour
            </CardTitle>
            <CardDescription>
              Aperçu des ventes d'aujourd'hui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Ventes Carburant</span>
                </div>
                <span className="font-bold">0 MAD</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Articles Divers</span>
                </div>
                <span className="font-bold">0 MAD</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Journée</span>
                  <span className="text-xl font-bold text-primary">0 MAD</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PointOfSale;
