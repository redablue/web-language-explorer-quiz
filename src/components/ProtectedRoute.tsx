
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'gerant' | 'responsable' | 'caissier' | 'pompiste' | Array<'gerant' | 'responsable' | 'caissier' | 'pompiste'>;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute - User:', !!user, 'Profile:', !!profile, 'Loading:', loading);

  // Afficher un écran de chargement pendant l'initialisation
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, rediriger vers la page d'authentification
  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Vérifier les permissions de rôle si requis
  if (requiredRole && profile) {
    const hasPermission = Array.isArray(requiredRole)
      ? requiredRole.includes(profile.role)
      : profile.role === requiredRole;

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Accès Refusé</h1>
            <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires.</p>
          </div>
        </div>
      );
    }
  }

  // Si l'utilisateur est connecté mais pas de profil chargé, afficher l'application quand même
  // avec un message d'avertissement dans la console
  if (user && !profile) {
    console.warn('User authenticated but no profile loaded');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
