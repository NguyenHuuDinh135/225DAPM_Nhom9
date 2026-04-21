using backend.Application.Common.Interfaces;

namespace backend.Infrastructure.Services;

/// <summary>Fallback cache service used when Redis is not configured (e.g. build-time, local dev without Redis).</summary>
internal sealed class NullCacheService : ICacheService
{
    public Task<T?> GetAsync<T>(string key) => Task.FromResult(default(T?));
    public Task SetAsync<T>(string key, T value, TimeSpan expiration) => Task.CompletedTask;
}
