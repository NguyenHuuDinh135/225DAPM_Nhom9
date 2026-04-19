# Backend Rules

1. Namespace gốc của toàn bộ dự án là `backend`.
2. Tuân thủ Clean Architecture tuyệt đối.
3. Sử dụng Rich Domain Model, các thuộc tính của Entity phải dùng `private set` và thay đổi qua các phương thức nghiệp vụ.
4. Sử dụng CQRS với MediatR ở tầng Application.
