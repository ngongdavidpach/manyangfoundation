import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, UserRole } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasAdminAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function buildUser(authUser: any): Promise<User | null> {
  if (!authUser) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", authUser.id)
    .maybeSingle();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authUser.id);
  const isAdmin = roles?.some((r) => r.role === "admin");
  return {
    id: authUser.id,
    email: authUser.email || "",
    fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.email || "",
    role: (isAdmin ? "admin" : roles?.[0]?.role || "member") as UserRole,
    createdAt: authUser.created_at || new Date().toISOString(),
    isEmailVerified: !!authUser.email_confirmed_at,
    lastLoginAt: authUser.last_sign_in_at,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // Defer DB calls to avoid deadlocks
      setTimeout(() => {
        buildUser(session?.user).then((u) => {
          setUser(u);
          setIsLoading(false);
        });
      }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(
    async (data: { fullName: string; email: string; password: string; role?: UserRole }) => {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { emailRedirectTo: redirectUrl, data: { full_name: data.fullName } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      await supabase.from("profiles").update({ full_name: updates.fullName }).eq("id", user.id);
      setUser({ ...user, ...updates });
    },
    [user],
  );

  const hasRole = useCallback((roles: UserRole[]) => !!user && roles.includes(user.role), [user]);
  const hasAdminAccess = useCallback(() => user?.role === "admin", [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        updateUser,
        hasRole,
        hasAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
