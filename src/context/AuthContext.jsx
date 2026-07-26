import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import {
  getCurrentSession,
  getProfile,
  signIn,
  signOut,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);

    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);

      return profileData;
    } catch (error) {
      console.error(
        "Impossible de récupérer le profil Supabase :",
        error,
      );

      setProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuthentication() {
      try {
        const currentSession = await getCurrentSession();

        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          await loadProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error(
          "Erreur lors de l’initialisation de la session :",
          error,
        );

        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuthentication();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === "SIGNED_OUT" || !newSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      /*
       * setTimeout évite d’exécuter une nouvelle requête Supabase
       * directement dans le callback d’authentification.
       */
      window.setTimeout(() => {
        loadProfile(newSession.user.id);
      }, 0);

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    const data = await signIn(email, password);

    setSession(data.session);
    setUser(data.user);

    if (data.user?.id) {
      await loadProfile(data.user.id);
    }

    return data;
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await signOut();

    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      return null;
    }

    return loadProfile(user.id);
  }, [loadProfile, user?.id]);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      isAuthenticated: Boolean(session?.user),
      isAdmin: profile?.role === "admin",
      login,
      logout,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      loading,
      profileLoading,
      login,
      logout,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l’intérieur de AuthProvider.",
    );
  }

  return context;
}