const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface ApiError {
  status: number;
  message: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
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
      throw { status: res.status, message } satisfies ApiError;
    }

    if (res.status === 204) return undefined as T;
    const data = await res.json();
    console.log(`✅ API Success:`, data);
    return data as T;
  } catch (error) {
    console.error(`❌ Fetch Error:`, error);
    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
