
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
  Store,
  ChevronDown
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { 
    id: "dashboard", 
    label: "Tableau de Bord", 
    icon: Home 
  },
  {
    id: "operations",
    label: "Opérations",
    icon: Fuel,
    children: [
      { id: "fuel", label: "Gestion Carburants", icon: Fuel },
      { id: "sales", label: "Point de Vente", icon: ShoppingCart },
      { id: "pumps", label: "Pompes", icon: Wrench },
    ]
  },
  {
    id: "management",
    label: "Gestion",
    icon: Users,
    children: [
      { id: "employees", label: "Employés", icon: Users },
      { id: "customers", label: "Clientèle", icon: UserCheck },
      { id: "finance", label: "Finances", icon: DollarSign },
    ]
  },
  {
    id: "services",
    label: "Services",
    icon: Car,
    children: [
      { id: "services", label: "Services Auto", icon: Car },
      { id: "shop", label: "Boutique", icon: Store },
      { id: "maintenance", label: "Maintenance", icon: Wrench },
    ]
  },
  {
    id: "reports",
    label: "Rapports & Conformité",
    icon: BarChart3,
    children: [
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "compliance", label: "Conformité", icon: FileText },
    ]
  },
  { 
    id: "settings", 
    label: "Paramètres", 
    icon: Settings 
  },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Fuel className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-bold text-lg">Station Manager</h2>
            <p className="text-xs text-muted-foreground">Gestion Complète</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                if (item.children) {
                  return (
                    <Collapsible key={item.id} defaultOpen={item.children.some(child => child.id === activeTab)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            <ChevronDown className="ml-auto h-4 w-4" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenu>
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <SidebarMenuItem key={child.id}>
                                  <SidebarMenuButton
                                    isActive={activeTab === child.id}
                                    onClick={() => onTabChange(child.id)}
                                    className="pl-8"
                                  >
                                    <ChildIcon className="h-4 w-4" />
                                    <span>{child.label}</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeTab === item.id}
                      onClick={() => onTabChange(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground">
          © 2024 Station Manager
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
