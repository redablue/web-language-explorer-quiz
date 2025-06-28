
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Fuel, Shield, Users, TrendingUp } from "lucide-react";
import SuperAdminLogin from "@/components/SuperAdminLogin";

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    
    await signUp(email, password, fullName);
    setIsLoading(false);
  };

  if (showSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowSuperAdmin(false)}
              className="text-gray-600"
            >
              ← Retour à la connexion normale
            </Button>
          </div>
          <SuperAdminLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Fuel className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">StationPro</h1>
          </div>
          <p className="text-lg text-gray-600">Système de Gestion de Station-Service</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Sécurisé & Fiable
                </CardTitle>
                <CardDescription>
                  Gestion sécurisée des données avec contrôle d'accès par rôles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Multi-utilisateurs
                </CardTitle>
                <CardDescription>
                  Gérant, Responsable, Caissier, Pompiste - chacun son interface
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Analytics Avancés
                </CardTitle>
                <CardDescription>
                  Rapports en temps réel et analyses de performance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Auth Form */}
          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Accédez à votre espace de gestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Se connecter</TabsTrigger>
                  <TabsTrigger value="signup">S'inscrire</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="link" 
                      onClick={() => setShowSuperAdmin(true)}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      Accès Superadmin
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Inscription..." : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
