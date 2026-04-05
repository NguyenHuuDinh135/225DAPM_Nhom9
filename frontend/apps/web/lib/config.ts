export const siteConfig = {
  name: "Nhóm 9 - Hệ Thống Quản lý Cây xanh Thành phố Đà Nẵng",
  url: "https://ui.shadcn.com",
  ogImage: "https://ui.shadcn.com/og.jpg",
  description:
    "A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.",
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn-ui/ui",
  },
  navItems: [
    {
      href: "/",
      label: "Trang chủ", // Trang chủ hiện tại đang là bản đồ
    },
    {
      href: "/category",
      label: "Danh mục", // Chứa DataTable quản lý thông tin cây
    },
    {
      href: "/map",
      label: "Bản đồ cây xanh", // Task list & Progress update
    },
    {
      href: "/statistics",
      label: "Thống kê", // Các biểu đồ báo cáo (Charts)
    },
    {
      href: "/feedback",
      label: "Ý kiến phản ánh", // Quản lý người dùng, phân quyền, cấu hình hệ thống
    }
  ],
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}