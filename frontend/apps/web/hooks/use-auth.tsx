"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (stored) setToken(stored);
    if (storedUser) setUser(JSON.parse(storedUser) as User);
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiClient.post<LoginResponse>("/api/Users/login?useCookies=false&useSessionCookies=false", {
      email,
      password,
    });
    localStorage.setItem("access_token", res.accessToken);
    document.cookie = `access_token=${res.accessToken}; path=/; SameSite=Lax`;
    setToken(res.accessToken);

    const userInfo = await apiClient.get<User>("/api/Users/me");
    localStorage.setItem("user_id", userInfo.id);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);

    router.push("/overview");
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    document.cookie = "access_token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
