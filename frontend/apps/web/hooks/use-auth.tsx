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
    // Use Next.js API route to set cookie from server-side
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    const res = await response.json() as LoginResponse
    
    // Store in localStorage for client-side access
    localStorage.setItem("access_token", res.accessToken)
    setToken(res.accessToken)

    // Fetch user info
    const userInfo = await apiClient.get<User>("/api/Users/me")
    localStorage.setItem("user_id", userInfo.id)
    localStorage.setItem("user", JSON.stringify(userInfo))
    setUser(userInfo)

    router.push("/dashboard")
    router.refresh() // Refresh server components
  }

  async function logout() {
    // Call API route to delete cookie
    await fetch("/api/auth/logout", { method: "POST" })
    
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    localStorage.removeItem("user_id")
    setToken(null)
    setUser(null)
    router.push("/login")
    router.refresh()
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
