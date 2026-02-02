import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create client outside component to avoid type inference issues
// This will only be created at runtime when env vars are available
const getSupabaseClient = () => {
  if (!isSupabaseConfigured) return null;
  return createClient();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(getSupabaseClient);

  // Fetch user profile
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      if (!supabase) return null;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId as never)
          .single();

        if (error) {
          // Profile might not exist yet - this is OK
          if (error.code === "PGRST116") {
            return null;
          }
          console.error("Error fetching profile:", error);
          return null;
        }

        return data as unknown as Profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [supabase],
  );

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Skip initialization if Supabase is not configured
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        // Add timeout to prevent infinite loading if getSession hangs
        // (can happen with corrupted cookies or SSR issues)
        const timeoutPromise = new Promise<{ data: { session: null } }>(
          (resolve) => {
            setTimeout(() => resolve({ data: { session: null } }), 3000);
          },
        );

        const {
          data: { session: currentSession },
        } = await Promise.race([supabase.auth.getSession(), timeoutPromise]);

        if (!isMounted) return;

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Fetch profile inline to avoid dependency issues
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentSession.user.id as never)
            .single();
          if (isMounted) {
            setProfile(profileData as unknown as Profile | null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Fetch profile inline to avoid dependency issues
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", newSession.user.id as never)
          .single();
        if (isMounted) {
          setProfile(profileData as unknown as Profile | null);
        }
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      console.error("Supabase is not configured");
      return;
    }
    try {
      // Save the current page URL to redirect back after sign-in
      // Only set if not already set (callers may have set a custom return URL)
      if (!localStorage.getItem("auth_redirect")) {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem("auth_redirect", currentPath);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) {
      console.error("Supabase is not configured");
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, [supabase]);

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
