
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Dashboard from "./Dashboard";
import FuelManagement from "./FuelManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "fuel":
        return <FuelManagement />;
      case "sales":
        return <div className="p-6"><h1 className="text-3xl font-bold">Point de Vente</h1><p>Module en développement...</p></div>;
      case "employees":
        return <div className="p-6"><h1 className="text-3xl font-bold">Gestion des Employés</h1><p>Module en développement...</p></div>;
      case "finance":
        return <div className="p-6"><h1 className="text-3xl font-bold">Finances</h1><p>Module en développement...</p></div>;
      case "compliance":
        return <div className="p-6"><h1 className="text-3xl font-bold">Conformité Réglementaire</h1><p>Module en développement...</p></div>;
      case "maintenance":
        return <div className="p-6"><h1 className="text-3xl font-bold">Maintenance</h1><p>Module en développement...</p></div>;
      case "customers":
        return <div className="p-6"><h1 className="text-3xl font-bold">Gestion Clientèle</h1><p>Module en développement...</p></div>;
      case "services":
        return <div className="p-6"><h1 className="text-3xl font-bold">Services Auto</h1><p>Module en développement...</p></div>;
      case "shop":
        return <div className="p-6"><h1 className="text-3xl font-bold">Boutique</h1><p>Module en développement...</p></div>;
      case "analytics":
        return <div className="p-6"><h1 className="text-3xl font-bold">Analytics Avancés</h1><p>Module en développement...</p></div>;
      case "settings":
        return <div className="p-6"><h1 className="text-3xl font-bold">Paramètres</h1><p>Module en développement...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
