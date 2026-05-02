# 🎯 ĐÃ FIX XONG - HƯỚNG DẪN ĐĂNG NHẬP

## ✅ Vấn đề đã được sửa

### Lỗi chính: API Client URL sai
**File:** `frontend/apps/web/lib/api-client.ts`

**Trước (SAI):**
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
```

**Sau (ĐÚNG):**
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
```

### Tại sao login không được?
1. ✅ Backend login API hoạt động tốt (Swagger login được)
2. ✅ Token được tạo ra đúng
3. ❌ Sau khi login, frontend gọi `/api/users/me` để lấy thông tin user
4. ❌ Nhưng `api-client.ts` gọi đến `http://localhost:8080` (SAI!)
5. ❌ Request thất bại → User state không được set → Frontend nghĩ là chưa login

---

## 🚀 CÁCH KHẮC PHỤC - LÀM THEO THỨ TỰ

### Bước 1: Restart Frontend
```bash
# Dừng frontend nếu đang chạy (Ctrl+C)
# Sau đó chạy lại:
cd frontend
npm run dev
```

### Bước 2: Xóa localStorage cũ
1. Mở trình duyệt
2. Vào `http://localhost:3000`
3. Nhấn `F12` để mở DevTools
4. Vào tab **Application** → **Local Storage** → `http://localhost:3000`
5. Xóa tất cả các key: `access_token`, `user`, `user_id`
6. Refresh trang (F5)

### Bước 3: Login lại
1. Vào trang login: `http://localhost:3000/login`
2. Nhập:
   - Email: `manager@localhost`
   - Password: `Manager1!`
3. Click **Login**

### Bước 4: Kiểm tra Console
Mở DevTools (F12) → tab **Console**, bạn sẽ thấy:
```
🌐 API Request: POST http://localhost:5000/api/users/login?useCookies=false&useSessionCookies=false
📡 Response: 200 OK
🌐 API Request: GET http://localhost:5000/api/users/me
📡 Response: 200 OK
✅ API Success: {id: "...", email: "manager@localhost", role: "Manager"}
```

### Bước 5: Test tạo Plan
1. Vào trang Plans: `http://localhost:3000/plans`
2. Click nút **"+ Thêm kế hoạch"**
3. Điền thông tin:
   - Tên: `Test Plan 1`
   - Ngày bắt đầu: `2026-04-10`
   - Ngày kết thúc: `2026-04-30`
4. Click **Tạo**
5. Sẽ thấy plan mới được tạo thành công!

---

## 🔍 Kiểm tra nếu vẫn lỗi

### Nếu vẫn thấy "Failed to fetch"
1. Kiểm tra backend có chạy không:
   ```bash
   curl http://localhost:5000/api
   ```
   Hoặc mở trình duyệt: `http://localhost:5000/api`

2. Kiểm tra CORS:
   - Mở DevTools → tab **Network**
   - Thử login
   - Xem request có bị CORS block không

### Nếu vẫn thấy "403 Forbidden"
1. Kiểm tra token có được gửi không:
   - DevTools → Network → Click vào request bị 403
   - Xem tab **Headers** → **Request Headers**
   - Phải có: `Authorization: Bearer eyJ...`

2. Nếu không có token:
   - Xóa localStorage (Bước 2)
   - Login lại

### Nếu vẫn thấy "401 Unauthorized"
1. Token hết hạn → Login lại
2. Token không hợp lệ → Xóa localStorage → Login lại

---

## 📝 Tóm tắt các file đã sửa

### 1. `frontend/apps/web/lib/api-client.ts`
- ✅ Đổi BASE_URL từ `8080` → `5000`

### 2. `frontend/apps/web/hooks/use-auth.tsx`
- ✅ Gọi trực tiếp backend thay vì Next.js API route
- ✅ URL: `http://localhost:5000/api/users/login`

### 3. `backend/src/Web/Endpoints/Planning.cs`
- ⚠️ Đang dùng `AllowAnonymous()` tạm thời
- 🔜 Sau khi test xong, sẽ bật lại authorization

---

## 🎉 Kết quả mong đợi

Sau khi làm theo các bước trên:
- ✅ Login thành công
- ✅ Thấy tên user ở góc phải màn hình
- ✅ Tạo Plan thành công
- ✅ Tạo Tree thành công
- ✅ Tạo Work thành công
- ✅ Tạo Incident thành công

---

## 💡 Lưu ý

1. **Luôn restart frontend sau khi sửa code**
2. **Xóa localStorage khi gặp lỗi lạ**
3. **Kiểm tra Console để debug**
4. **Backend phải chạy trước khi test frontend**

---

## 🆘 Nếu vẫn không được

Gửi cho tôi:
1. Screenshot Console (F12 → Console)
2. Screenshot Network tab (F12 → Network)
3. Thông báo lỗi chính xác

Tôi sẽ fix ngay!
