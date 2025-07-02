
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  display_style: string;
  daily_uses_remaining: number;
  total_uses: number;
  is_admin?: boolean;
  is_banned?: boolean;
  ban_expires_at?: string | null;
  is_moderator?: boolean;
  has_subscription?: boolean;
  subscription_type?: string | null;
  subscription_expires_at?: string | null;
  profile_picture?: string | null;
  custom_color?: string | null;
  tags?: string[] | null;
  registration_ip?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, username: string) => Promise<{ error: any }>;
  logout: () => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn("useAuth called outside of AuthProvider, returning default state");
    return {
      user: null,
      session: null,
      profile: null,
      login: async () => ({ error: new Error("Auth not initialized") }),
      signup: async () => ({ error: new Error("Auth not initialized") }),
      logout: () => {},
      isLoading: true,
      refreshProfile: async () => {}
    };
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      // Check if user is banned and if temp ban has expired
      if (data.is_banned && data.ban_expires_at) {
        const banExpiry = new Date(data.ban_expires_at);
        if (banExpiry < new Date()) {
          // Temp ban has expired, unban the user
          await supabase
            .from('profiles')
            .update({ is_banned: false, ban_expires_at: null })
            .eq('id', userId);
          
          data.is_banned = false;
          data.ban_expires_at = null;
        }
      }

      const typedProfile: UserProfile = {
        ...data,
        registration_ip: data.registration_ip ? String(data.registration_ip) : null
      };

      setProfile(typedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // First, get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (!mounted) return;

        console.log('Initial session:', currentSession?.user?.email || 'No session');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
        
        setIsLoading(false);
        setInitialized(true);
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        if (initialized) {
          setIsLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        return { error };
      }
      
      console.log('Login successful for:', email);
      return { error: null };
    } catch (error) {
      console.error('Login exception:', error);
      return { error };
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    // Get user's IP address for registration tracking
    let userIP = null;
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      userIP = data.ip;
    } catch (error) {
      console.error('Failed to get IP:', error);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          ip: userIP
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
        // Clear state immediately
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Logout exception:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    login,
    signup,
    logout,
    isLoading,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
