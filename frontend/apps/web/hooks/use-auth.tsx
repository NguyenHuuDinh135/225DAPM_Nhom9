"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { decodeRole } from "@/lib/auth-utils";
import { ROLES } from "@/lib/roles";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
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
    if (stored) {
      setToken(stored);
      // Re-validate role from token every time
      const roleFromToken = decodeRole(stored);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        if (roleFromToken) parsedUser.role = roleFromToken;
        setUser(parsedUser);
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiClient.post<LoginResponse>("/api/Users/login", {
      email,
      password,
    });
    
    localStorage.setItem("access_token", res.accessToken);
    // Set cookie with 7 days expiration for middleware consistency
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `access_token=${res.accessToken}; path=/; expires=${expires}; SameSite=Lax`;
    setToken(res.accessToken);

    const userInfo = await apiClient.get<User>("/api/Users/me");
    
    // Always override role with decoded role from token for consistency
    // Fallback to userInfo.role (from /me) if decoding fails
    const roleFromToken = decodeRole(res.accessToken) || userInfo.role;
    if (roleFromToken) {
      userInfo.role = roleFromToken;
    }

    localStorage.setItem("user_id", userInfo.id);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);

    // Initial redirect based on role
    let target = "/nhanvien";
    if (roleFromToken === ROLES.GiamDoc) target = "/giamdoc";
    else if (roleFromToken === ROLES.DoiTruong) target = "/doitruong";
    
    router.push(target);
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
