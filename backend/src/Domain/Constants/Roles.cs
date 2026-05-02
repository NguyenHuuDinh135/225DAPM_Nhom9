namespace backend.Domain.Constants;

/// <summary>
/// Hệ thống 3 vai trò chính trong Quản Lý Cây Xanh.
/// </summary>
public abstract class Roles
{
    /// <summary>Giám Đốc — phê duyệt kế hoạch, quyết định cấp cao.</summary>
    public const string GiamDoc = nameof(GiamDoc);

    /// <summary>Đội Trưởng Cây Xanh — quản trị hệ thống, quản lý công việc (admin-like).</summary>
    public const string DoiTruong = nameof(DoiTruong);

    /// <summary>Nhân Viên Cây — thực hiện công việc thực địa.</summary>
    public const string NhanVien = nameof(NhanVien);
}