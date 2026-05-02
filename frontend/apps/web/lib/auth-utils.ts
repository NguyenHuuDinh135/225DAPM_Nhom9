import { ROLES } from "./roles";

export function decodeRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    
    // ASP.NET Core Identity often uses this full URI for roles
    const role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload["role"] ??
      payload["Role"] ??
      payload["roles"] ??
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ??
      null;
      
    if (Array.isArray(role)) {
      return normalizeRole(role[0]);
    }
    return normalizeRole(role);
  } catch {
    return null;
  }
}

function normalizeRole(role: any): string | null {
  if (typeof role !== 'string') return null;
  const r = role.trim();
  
  // Mapping logic to handle different backend responses
  if (r === "GiamDoc" || r === "Director" || r === "Admin") return ROLES.GiamDoc;
  if (r === "DoiTruong" || r === "Captain" || r === "Leader") return ROLES.DoiTruong;
  if (r === "NhanVien" || r === "Worker" || r === "Employee") return ROLES.NhanVien;
  
  return r;
}
