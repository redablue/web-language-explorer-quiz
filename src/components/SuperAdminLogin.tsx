
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SuperAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Vérifier les identifiants superadmin en dur
    if (credentials.username === 'superadmin' && credentials.password === 'Redblue198107..') {
      // Créer une session superadmin fictive
      localStorage.setItem('superadmin_session', JSON.stringify({
        user: {
          id: 'superadmin-id',
          email: 'superadmin@station.local',
          role: 'superadmin'
        },
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
      }));
      
      toast({
        title: "Connexion superadmin réussie",
        description: "Bienvenue, Super Administrateur !",
      });
      
      // Recharger la page pour déclencher la vérification de session
      window.location.reload();
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Identifiants superadmin incorrects",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          Accès Superadmin
        </CardTitle>
        <CardDescription>
          Connexion administrateur système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSuperAdminLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              type="text"
              placeholder="superadmin"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter en tant que Superadmin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SuperAdminLogin;
