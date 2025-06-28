
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mapper les types Supabase aux types de l'application
export type UserRole = 'superadmin' | 'admin' | 'employee' | 'trainee';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isManagerOrHigher: () => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Vérifier la session superadmin
  const checkSuperAdminSession = () => {
    const superAdminSession = localStorage.getItem('superadmin_session');
    if (superAdminSession) {
      try {
        const sessionData = JSON.parse(superAdminSession);
        if (sessionData.expires_at > Date.now()) {
          setProfile({
            id: sessionData.user.id,
            email: sessionData.user.email,
            full_name: 'Super Administrateur',
            role: 'superadmin'
          });
          setUser({
            id: sessionData.user.id,
            email: sessionData.user.email,
          } as User);
          setLoading(false);
          return true;
        } else {
          localStorage.removeItem('superadmin_session');
        }
      } catch (error) {
        localStorage.removeItem('superadmin_session');
      }
    }
    return false;
  };

  const createMissingProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating missing profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: 'Nouvel Utilisateur',
          role: 'trainee'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to create profile:', error);
      return null;
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return null;
      }

      if (existingProfile) {
        console.log('Profile found:', existingProfile);
        return existingProfile;
      }

      console.log('No profile found, attempting to create one...');
      return await createMissingProfile(userId, email);
      
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Vérifier d'abord la session superadmin
        if (checkSuperAdminSession()) {
          return;
        }
        
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }
        
        if (mounted) {
          console.log('Initial session:', !!initialSession?.user);
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('User found, fetching profile...');
            const userProfile = await fetchProfile(
              initialSession.user.id, 
              initialSession.user.email || ''
            );
            
            if (mounted) {
              setProfile(userProfile);
              if (!userProfile) {
                console.warn('Failed to load or create user profile');
                toast({
                  title: "Attention",
                  description: "Impossible de charger votre profil. Veuillez rafraîchir la page.",
                  variant: "destructive",
                });
              }
            }
          }
          
          console.log('Setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, !!session?.user);
        
        // Ignorer les changements d'état si on est en mode superadmin
        if (localStorage.getItem('superadmin_session')) {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile...');
          const userProfile = await fetchProfile(
            session.user.id, 
            session.user.email || ''
          );
          
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    // Supprimer la session superadmin si elle existe
    localStorage.removeItem('superadmin_session');
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    toast({
      title: "Déconnexion",
      description: "À bientôt !",
    });
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!profile) return false;
    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }
    return profile.role === role;
  };

  const isManagerOrHigher = () => {
    return hasRole(['superadmin', 'admin']);
  };

  const isSuperAdmin = () => {
    return hasRole('superadmin');
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isManagerOrHigher,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
