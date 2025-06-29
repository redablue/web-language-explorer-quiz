
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./Dashboard";
import FuelManagement from "./FuelManagement";
import PumpManagement from "./PumpManagement";
import PointOfSale from "./PointOfSale";
import { useAuth } from "@/hooks/useAuth";
import UserProfile from "@/components/layout/UserProfile";

const Index = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "pos":
      case "sales":
        return <PointOfSale />;
      case "fuel":
        return <FuelManagement />;
      case "pumps":
        return <PumpManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-xl font-semibold">Station Manager</h1>
            </div>
            <UserProfile />
          </header>
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
