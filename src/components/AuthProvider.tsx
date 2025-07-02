
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  display_style: string;
  daily_uses_remaining: number;
  total_uses: number;
  is_admin: boolean;
  is_banned: boolean;
  ban_expires_at: string | null;
  registration_ip: string | null;
  is_moderator: boolean;
  has_subscription: boolean;
  subscription_type: string | null;
  subscription_expires_at: string | null;
  profile_picture: string | null;
  custom_color: string | null;
  tags: string[] | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getUserIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting user IP:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      const profileData: UserProfile = {
        ...data,
        registration_ip: data.registration_ip ? String(data.registration_ip) : null
      };

      setProfile(profileData);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('SignIn attempt for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('SignIn error:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      throw error;
    }

    console.log('SignIn successful:', data);
    toast({
      title: "Welcome back!",
      description: "You've been successfully logged in.",
    });
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userIP = await getUserIP();
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            ip: userIP
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log('Initial session:', initialSession?.user?.id);
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }

        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth event:', event, session?.user?.id);
            
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user && event === 'SIGNED_IN') {
              // Update IP on login
              const userIP = await getUserIP();
              if (userIP && mounted) {
                try {
                  await supabase
                    .from('profiles')
                    .update({ registration_ip: userIP })
                    .eq('id', session.user.id);
                } catch (error) {
                  console.error('Error updating IP:', error);
                }
              }
            }
            
            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Refresh profile when user changes
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
