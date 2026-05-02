<<<<<<< HEAD
// lib/api-client.ts
const BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000");
=======
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
>>>>>>> main

export interface ApiError {
  status: number;
  message: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token") || getCookie("access_token");
  return token;
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
<<<<<<< HEAD
  
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const res = await fetch(url, { ...init, headers });

    if (!res.ok) {
      // Don't log full error for 401/403 on public pages to keep console clean
      if (res.status === 401 || res.status === 403) {
        // Optional: handle session expiry
      }
      
      const text = await res.text().catch(() => res.statusText);
      let message = text;
      try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
              message = json.join(", ");
          } else if (json.errors && typeof json.errors === 'object') {
              // Handle FluentValidation errors
              message = Object.values(json.errors).flat().join(", ");
          } else {
              message = json.message || json.title || json.detail || text;
          }
      } catch (e) {
          // If it's not JSON, message is already set to text
      }
      
      const error = { status: res.status, message };
      console.error(`[API Client] Error ${res.status} on ${path}:`, error);
      
      throw error satisfies ApiError;
    }

    if (res.status === 204) return undefined as T;
    return await res.json() as T;
  } catch (err) {
    if ((err as any).status) throw err;
    const networkError = { status: 0, message: (err as Error).message || "Network Error" };
    console.error(`Fetch Exception ${path}:`, networkError);
    throw networkError satisfies ApiError;
  }
=======
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = `${BASE_URL}${path}`;
  console.log(`🌐 API Request: ${init.method || 'GET'} ${url}`);
  console.log(`🔑 Token: ${token ? 'Present' : 'Missing'}`);

  try {
    const res = await fetch(url, { ...init, headers });

    console.log(`📡 Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const message = await res.text().catch(() => res.statusText);
      console.error(`❌ API Error: ${res.status} - ${message}`);
      const apiError = { status: res.status, message } satisfies ApiError;
      throw apiError;
    }

    if (res.status === 204) return undefined as T;
    const data = await res.json();
    console.log(`✅ API Success:`, data);
    return data as T;
  } catch (error) {
    console.error(`❌ Fetch Error:`, error);
    throw error;
  }
>>>>>>> main
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { 
      method: "POST", 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { 
      method: "PUT", 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Always use absolute URL for images from backend
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
