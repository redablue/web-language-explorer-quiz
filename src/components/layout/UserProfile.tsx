
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Settings, Crown } from "lucide-react";

const UserProfile = () => {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'gerant': return 'default';
      case 'responsable': return 'secondary';
      case 'caissier': return 'outline';
      case 'pompiste': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'gerant': return 'Gérant';
      case 'responsable': return 'Responsable';
      case 'caissier': return 'Caissier';
      case 'pompiste': return 'Pompiste';
      default: return role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${profile.role === 'superadmin' ? 'bg-red-600' : 'bg-primary'} text-primary-foreground`}>
              {profile.role === 'superadmin' ? <Crown className="h-5 w-5" /> : profile.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{profile.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
            <Badge variant={getRoleBadgeVariant(profile.role)} className="w-fit">
              {profile.role === 'superadmin' && <Crown className="mr-1 h-3 w-3" />}
              {getRoleLabel(profile.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
