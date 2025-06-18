
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Fuel, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Settings, 
  BarChart3,
  FileText,
  Wrench,
  UserCheck,
  Car,
  Store
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Tableau de Bord", icon: Home },
    { id: "fuel", label: "Gestion Carburants", icon: Fuel },
    { id: "sales", label: "Point de Vente", icon: ShoppingCart },
    { id: "employees", label: "Employés", icon: Users },
    { id: "finance", label: "Finances", icon: DollarSign },
    { id: "compliance", label: "Conformité", icon: FileText },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "customers", label: "Clientèle", icon: UserCheck },
    { id: "services", label: "Services Auto", icon: Car },
    { id: "shop", label: "Boutique", icon: Store },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className={cn(
      "bg-card border-r h-screen transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Fuel className="h-8 w-8 text-primary" />
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg">Station Manager</h2>
              <p className="text-xs text-muted-foreground">Gestion Complète</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full mt-2"
        >
          {isCollapsed ? "→" : "←"}
        </Button>
      </div>

      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed && "px-2"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
