# 🔍 Debug Lỗi 403 Forbidden

## Tình huống hiện tại

Từ log console, tôi thấy:
- ✅ User đã login: `manager@localhost`
- ✅ User có role: `Manager`
- ✅ Frontend nhận diện đúng: `Can create plan: true`
- ❌ Backend trả về: `403 Forbidden`

## Nguyên nhân có thể

Có 2 khả năng:

### 1. Token không có role claims (khả năng cao nhất)

Token trong localStorage có thể là token **cũ** (được tạo trước khi tôi thêm `ApplicationUserClaimsPrincipalFactory`).

### 2. Backend chưa được restart

Backend cần restart để áp dụng các thay đổi về endpoint URLs và authorization.

## ✅ Giải pháp (làm theo thứ tự)

### Bước 1: Kiểm tra token

1. Mở browser console (F12)
2. Copy toàn bộ nội dung file `decode-token.js`
3. Paste vào console và nhấn Enter
4. Xem kết quả:

**Nếu thấy "❌ NO ROLE!":**
- Token cũ không có role claims
- Cần logout và login lại (xem Bước 2)

**Nếu thấy "✅ Token has role claims!":**
- Token đúng, vấn đề ở backend
- Cần restart backend (xem Bước 3)

### Bước 2: Logout và Login lại

1. **Logout:**
   - Click vào avatar/username ở góc trên phải
   - Click "Đăng xuất" hoặc "Logout"

2. **Xóa localStorage (quan trọng!):**
   - Mở console (F12)
   - Chạy lệnh:
   ```javascript
   localStorage.clear()
   ```

3. **Login lại:**
   - Email: `manager@localhost`
   - Password: `Manager1!`

4. **Kiểm tra token mới:**
   - Chạy lại script `decode-token.js` trong console
   - Phải thấy role: `Manager`

### Bước 3: Restart Backend

Backend **BẮT BUỘC** phải restart để áp dụng các thay đổi:

1. **Dừng backend:**
   - Vào terminal đang chạy backend
   - Nhấn `Ctrl+C`

2. **Khởi động lại:**
   ```bash
   cd backend/src/Web
   dotnet run
   ```

3. **Đợi backend khởi động:**
   - Chờ thấy dòng: `Now listening on: http://localhost:5000`

### Bước 4: Test lại

1. Vào `http://localhost:3000/plans`
2. Click "Tạo kế hoạch"
3. Điền form:
   - Tiêu đề: `Test Plan`
   - Ngày bắt đầu: bất kỳ
   - Ngày kết thúc: bất kỳ
4. Click "Tạo"
5. ✅ Phải thành công!

## 🔍 Debug nâng cao

### Kiểm tra backend log

Khi bạn tạo plan, backend sẽ log ra console. Tìm các dòng như:

```
info: Microsoft.AspNetCore.Authorization.DefaultAuthorizationService[2]
      Authorization failed. These requirements were not met:
      RolesAuthorizationRequirement:User.IsInRole must be true for one of the following roles: (Manager|Admin|Administrator)
```

Nếu thấy dòng này → Token không có role claims → Cần logout/login lại.

### Test với Swagger UI

1. Vào `http://localhost:5000/api`
2. Click "Authorize"
3. Nhập: `Bearer <your-token>` (lấy từ localStorage)
4. Test endpoint `POST /api/planning`

**Nếu Swagger thành công:**
- Backend OK
- Vấn đề ở frontend (token không được gửi đúng)

**Nếu Swagger cũng 403:**
- Token không có role claims
- Cần logout/login lại

### Kiểm tra database

Chạy query này trong PostgreSQL để xác nhận user có role:

```sql
SELECT 
    u."Email", 
    r."Name" as "Role"
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."Email" = 'manager@localhost';
```

Kết quả mong đợi:
```
Email              | Role
-------------------+--------
manager@localhost  | Manager
```

## 📋 Checklist

Trước khi test, đảm bảo:

- [ ] Backend đã được restart (sau khi sửa code)
- [ ] Đã logout và login lại (để lấy token mới)
- [ ] Đã chạy `localStorage.clear()` trước khi login
- [ ] Token mới có role claims (kiểm tra bằng `decode-token.js`)
- [ ] Browser console không có lỗi CORS
- [ ] Backend đang chạy trên `http://localhost:5000`
- [ ] Frontend đang chạy trên `http://localhost:3000`

## 🎯 Tóm tắt

**Vấn đề:** Token cũ không có role claims

**Giải pháp:**
1. Chạy `decode-token.js` trong console để kiểm tra
2. Nếu không có role → Logout → `localStorage.clear()` → Login lại
3. Restart backend
4. Test lại

Sau khi làm đúng các bước này, tạo plan sẽ thành công! 🚀
