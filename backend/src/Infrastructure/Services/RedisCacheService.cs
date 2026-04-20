using backend.Application.Common.Interfaces;
using StackExchange.Redis;
using System.Text.Json;

namespace backend.Infrastructure.Services
{
    public interface IRedisCacheService
    {
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        Task<T?> GetAsync<T>(string key);
        Task RemoveAsync(string key);
    }

    public class RedisCacheService : IRedisCacheService, ICacheService
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;

        public RedisCacheService(IConnectionMultiplexer connectionMultiplexer)
        {
            _connectionMultiplexer = connectionMultiplexer;
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var db = _connectionMultiplexer.GetDatabase();
            var jsonData = JsonSerializer.Serialize(value);
            await db.StringSetAsync(key, jsonData, expiry);
        }

        // Explicit ICacheService implementation (non-nullable TimeSpan)
        Task ICacheService.SetAsync<T>(string key, T value, TimeSpan expiration)
            => SetAsync(key, value, expiration);

        public async Task<T?> GetAsync<T>(string key)
        {
            var db = _connectionMultiplexer.GetDatabase();
            var jsonData = await db.StringGetAsync(key);

            if (jsonData.IsNullOrEmpty)
                return default;

            return JsonSerializer.Deserialize<T>(jsonData!.ToString());
        }

        public async Task RemoveAsync(string key)
        {
            var db = _connectionMultiplexer.GetDatabase();
            await db.KeyDeleteAsync(key);
        }
    }
}