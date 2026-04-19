namespace backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;

public record GetIncidentsByLocationQuery : IRequest<List<TreeIncidentDto>>
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public double RadiusInKm { get; init; } = 5.0; // Mặc định tìm trong bán kính 5km
}

public class GetIncidentsByLocationQueryHandler : IRequestHandler<GetIncidentsByLocationQuery, List<TreeIncidentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetIncidentsByLocationQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TreeIncidentDto>> Handle(GetIncidentsByLocationQuery request, CancellationToken cancellationToken)
    {
        // Sử dụng công thức Haversine (xấp xỉ) để lọc danh sách sự cố theo bán kính
        // Lưu ý: Để tối ưu hiệu suất với PostgreSQL, Định có thể cân nhắc cài thư viện NetTopologySuite (PostGIS)
        // Ở đây mình dùng thuật toán Bounding Box cơ bản để lọc sơ bộ ở Database trước, sau đó tính khoảng cách chính xác ở RAM.
        
        double earthRadiusKm = 6371.0;
        double latDelta = (request.RadiusInKm / earthRadiusKm) * (180 / Math.PI);
        double lonDelta = (request.RadiusInKm / earthRadiusKm) * (180 / Math.PI) / Math.Cos(request.Latitude * Math.PI / 180);

        var minLat = request.Latitude - latDelta;
        var maxLat = request.Latitude + latDelta;
        var minLon = request.Longitude - lonDelta;
        var maxLon = request.Longitude + lonDelta;

        // 1. Lọc sơ bộ bằng Bounding Box (Chạy trên DB)
        var incidents = await _context.TreeIncidents
            .Include(i => i.Images)
            .Where(i => i.Latitude >= minLat && i.Latitude <= maxLat &&
                        i.Longitude >= minLon && i.Longitude <= maxLon &&
                        i.Status != IncidentStatus.Resolved) // Không lấy các sự cố đã giải quyết
            .ToListAsync(cancellationToken);

        // 2. Tính khoảng cách chính xác (Chạy trên Server)
        var result = incidents
            .Where(i => CalculateDistance(request.Latitude, request.Longitude, i.Latitude, i.Longitude) <= request.RadiusInKm)
            .Select(i => _mapper.Map<TreeIncidentDto>(i))
            .ToList();

        return result;
    }

    // Hàm tính khoảng cách giữa 2 tọa độ (Haversine formula)
    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return 6371.0 * c;
    }
}
