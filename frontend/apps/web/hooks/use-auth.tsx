"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { jwtDecode } from "jwt-decode";

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
  token: string;
  user: User;
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
    const res = await apiClient.post<LoginResponse>("/api/identity/login", {
      email,
      password,
    });
    localStorage.setItem("access_token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    const decoded = jwtDecode<{ sub?: string; nameid?: string }>(res.token);
    const userId = decoded.sub ?? decoded.nameid ?? "";
    localStorage.setItem("user_id", userId);
    document.cookie = `access_token=${res.token}; path=/; SameSite=Lax`;
    setToken(res.token);
    setUser(res.user);
    router.push("/dashboard");
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
