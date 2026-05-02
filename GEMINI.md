# Project Constitution: Hệ thống Quản lý Cây xanh (Nhóm 9)

## 🎯 Mandatory Skill Activation
Mỗi khi bắt đầu phiên làm việc, tôi PHẢI tự động kích hoạt các bộ kỹ năng sau:
- `next-best-practices`: Tối ưu App Router và hiệu năng Next.js.
- `ui-ux-pro-max`: Quy chuẩn thiết kế giao diện và trải nghiệm người dùng.
- `shadcn`: Quản lý hệ thống component UI.
- `frontend-design`: Tạo thẩm mỹ độc bản, cao cấp.
- `vercel-react-best-practices`: Tối ưu hóa render và loại bỏ waterfall.
- `vercel-composition-patterns`: Kiến trúc component sạch.

## 🛠 Engineering Standards
- **Ngôn ngữ:** Giao diện người dùng (UI) phải là Tiếng Việt 100%.
- **Thông báo:** Sử dụng `sonner` (`toast`) cho mọi phản hồi thành công/thất bại. TUYỆT ĐỐI không dùng `alert()`.
- **Vai trò (Roles):** 
  - Mapping: `GiamDoc` -> "Giám Đốc", `DoiTruong` -> "Đội Trưởng", `NhanVien` -> "Nhân Viên".
  - Sử dụng hàm `getRoleLabel` để hiển thị trên UI.
- **Bản đồ:** 
  - Ưu tiên tích hợp nghiệp vụ trực tiếp trên Map (Click để xử lý).
  - Luôn kiểm tra an toàn tọa độ trước khi vẽ Marker để tránh crash.
- **Backend:** 
  - Sử dụng `GroupName` chữ thường (ví dụ: `trees`, `reports`).
  - Phân quyền sử dụng `AuthorizeAttribute` tường minh cho `GiamDoc` và `DoiTruong`.
  - **Khởi chạy:** Ưu tiên chạy qua AppHost bằng profile HTTP: `dotnet run --project backend/src/AppHost --launch-profile http`. Tránh cấu hình biến môi trường thủ công nếu không cần thiết.

## 🎨 Design Direction (UI/UX Pro Max)
- **Màu sắc chủ đạo:** Xanh lá cây (Nature Green) phối với xám trắng hiện đại.
- **Hiệu ứng:** Sử dụng `glassmorphism` cho các lớp phủ (overlays) và `shimmer` cho trạng thái đang tải.
- **Tương tác:** Mọi nút bấm phải có phản hồi thị giác khi hover và active.
