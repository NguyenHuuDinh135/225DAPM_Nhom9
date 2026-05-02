export const ROLES = {
  GiamDoc: "GiamDoc",
  DoiTruong: "DoiTruong",
  NhanVien: "NhanVien",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.GiamDoc]: "Giám Đốc",
  [ROLES.DoiTruong]: "Đội Trưởng",
  [ROLES.NhanVien]: "Nhân Viên",
};

export function getRoleLabel(role?: string | null): string {
  if (!role) return "";
  return ROLE_LABELS[role] || role;
}
