using RiskReporting.Domain.Entities;
using RiskReporting.Domain.Models;

namespace RiskReporting.Infrastructure.Repositories;

public interface IRiskPositionRepository
{
    Task<PagedResult<RiskPosition>> GetPagedAsync(PagedQueryRequest request, CancellationToken cancellationToken = default);
    Task<AggregationSummaryResponse> GetAggregationsAsync(RiskFilterCriteria filters, CancellationToken cancellationToken = default);
    Task<RiskPosition?> GetByTradeIdAsync(string tradeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetDistinctValuesAsync(string field, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SavedView>> GetSavedViewsAsync();
    Task<SavedView> CreateSavedViewAsync(SavedView view);
    Task<bool> DeleteSavedViewAsync(string id);
    int TotalLoadedCount { get; }
    bool IsLoaded { get; }
}

