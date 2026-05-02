import { NextRequest, NextResponse } from "next/server";
import { ROLES } from "@/lib/roles";
import { decodeRole } from "@/lib/auth-utils";

// Các trang TUYỆT ĐỐI bảo mật (Cần Role tương ứng)
const SECURE_ROUTES = ["/giamdoc", "/doitruong", "/nhanvien", "/staff", "/settings", "/analytics", "/reports", "/map", "/incidents", "/planning"];

// Các trang CÔNG CỘNG (Người dân xem được)
const PUBLIC_ROUTES = ["/", "/login", "/trees", "/tree-detail", "/report-incident", "/category"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  const isSecure = SECURE_ROUTES.some((p) => pathname.startsWith(p));
  const isPublic = PUBLIC_ROUTES.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p)));

  // 1. Nếu vào trang bảo mật mà không có token -> Về Login
  if (isSecure && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token) {
    const role = decodeRole(token);
    
    // Nếu có token nhưng không giải mã được role -> Token hỏng hoặc hết hạn
    // Redirect về login để buộc đăng nhập lại, trừ khi đang ở trang public
    if (!role) {
      if (isSecure) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return NextResponse.next();
    }

    let targetHub = "/nhanvien";
    if (role === ROLES.GiamDoc) targetHub = "/giamdoc";
    else if (role === ROLES.DoiTruong) targetHub = "/doitruong";

    // 2. Nếu đã đăng nhập mà cố vào trang Login hoặc /dashboard -> Về Hub của mình
    if (pathname === "/login" || pathname === "/dashboard") {
      return NextResponse.redirect(new URL(targetHub, req.url));
    }

    // 3. Bảo vệ các Hub chuyên biệt (RBAC)
    if (pathname.startsWith("/giamdoc") && role !== ROLES.GiamDoc) {
      return NextResponse.redirect(new URL(targetHub, req.url));
    }
    if (pathname.startsWith("/doitruong") && role !== ROLES.DoiTruong) {
      return NextResponse.redirect(new URL(targetHub, req.url));
    }
    if (pathname.startsWith("/nhanvien") && role !== ROLES.NhanVien) {
      return NextResponse.redirect(new URL(targetHub, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", "/login", "/giamdoc/:path*", "/doitruong/:path*", "/nhanvien/:path*", 
    "/trees/:path*", "/map/:path*", "/staff/:path*", "/settings/:path*",
    "/analytics/:path*", "/reports/:path*", "/tree-detail/:path*",
  ],
};
