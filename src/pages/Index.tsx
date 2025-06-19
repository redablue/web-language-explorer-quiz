
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "./Dashboard";
import FuelManagement from "./FuelManagement";
import PumpManagement from "./PumpManagement";
import PointOfSale from "./PointOfSale";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { hasRole } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
          <TabsTrigger value="pos">Point de Vente</TabsTrigger>
          <TabsTrigger value="fuel">Gestion Carburant</TabsTrigger>
          <TabsTrigger value="pumps">Pompes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="pos" className="mt-0">
          <PointOfSale />
        </TabsContent>
        
        <TabsContent value="fuel" className="mt-0">
          <FuelManagement />
        </TabsContent>
        
        <TabsContent value="pumps" className="mt-0">
          <PumpManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
