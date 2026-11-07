using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using RiskReporting.Domain.Entities;
using RiskReporting.Domain.Models;
using RiskReporting.Infrastructure.Data;
using RiskReporting.Infrastructure.Search;

namespace RiskReporting.Infrastructure.Repositories;

public class RiskPositionRepository : IRiskPositionRepository
{
    private readonly ILogger<RiskPositionRepository> _logger;
    private readonly CsvRiskPositionLoader _loader;
    private readonly List<RiskPosition> _positions = new();
    private readonly ConcurrentDictionary<string, SavedView> _savedViews = new();
    private bool _isLoaded;
    private readonly object _lock = new();

    public int TotalLoadedCount => _positions.Count;
    public bool IsLoaded => _isLoaded;

    public RiskPositionRepository(ILogger<RiskPositionRepository> logger, CsvRiskPositionLoader loader)
    {
        _logger = logger;
        _loader = loader;
        InitializeData();
        SeedDefaultViews();
    }

    private void InitializeData()
    {
        lock (_lock)
        {
            if (_isLoaded) return;

            try
            {
                var loaded = _loader.LoadFromCsv();
                _positions.AddRange(loaded);
                _isLoaded = true;
                _logger.LogInformation("Repository initialized with {Count} positions.", _positions.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize repository data from CSV.");
            }
        }
    }

    private void SeedDefaultViews()
    {
        var defaults = new[]
        {
            new SavedView
            {
                Id = "view-all",
                Name = "All Books Enterprise Overview",
                Description = "Default enterprise view across all trading desks, regions, and commodities.",
                Filters = new RiskFilterCriteria(),
                Sorts = new List<SortCriteria> { new() { Field = "pnl", Direction = "desc" } },
                GroupBy = "book"
            },
            new SavedView
            {
                Id = "view-top-losses",
                Name = "Critical Drawdowns (Losses > $100k)",
                Description = "High-risk negative P&L positions requiring risk limit monitoring.",
                Filters = new RiskFilterCriteria { MaxPnl = -100000 },
                Sorts = new List<SortCriteria> { new() { Field = "pnl", Direction = "asc" } },
                GroupBy = "commodity"
            },
            new SavedView
            {
                Id = "view-freight-swaps",
                Name = "Freight Swaps & Vessel Charter",
                Description = "Capesize, Supramax, and Panamax swap positions across APAC and EMEA.",
                Filters = new RiskFilterCriteria { Book = "Freight", InstrumentType = "Swap" },
                Sorts = new List<SortCriteria> { new() { Field = "fxExposure", Direction = "desc" } },
                GroupBy = "commodity"
            },
            new SavedView
            {
                Id = "view-apac-metals",
                Name = "APAC Metals (Ferrous & Non-Ferrous)",
                Description = "Steel, Iron Ore, Copper, Aluminium positions in the Asia-Pacific region.",
                Filters = new RiskFilterCriteria { Region = "APAC" },
                Sorts = new List<SortCriteria> { new() { Field = "pnl", Direction = "desc" } },
                GroupBy = "book"
            }
        };

        foreach (var view in defaults)
        {
            _savedViews[view.Id] = view;
        }
    }

    public Task<PagedResult<RiskPosition>> GetPagedAsync(PagedQueryRequest request, CancellationToken cancellationToken = default)
    {
        EnsureLoaded();

        IEnumerable<RiskPosition> query = FilterPositions(_positions, request);
        int totalMatching = query.Count();

        query = ApplySorting(query, request.Sorts);

        int offset = request.GetOffset();
        int limit = request.GetLimit();

        var pageRows = query
            .Skip(offset)
            .Take(limit)
            .ToList();

        var result = new PagedResult<RiskPosition>(
            rows: pageRows,
            totalCount: totalMatching,
            startRow: offset,
            endRow: offset + pageRows.Count
        );

        return Task.FromResult(result);
    }

    public Task<AggregationSummaryResponse> GetAggregationsAsync(RiskFilterCriteria filters, CancellationToken cancellationToken = default)
    {
        EnsureLoaded();

        // Must run over ALL rows matching the active filters (not just current page)
        var filtered = FilterPositions(_positions, filters).ToList();

        int totalCount = filtered.Count;
        decimal totalPnl = 0m;
        decimal totalFx = 0m;
        decimal maxPnl = totalCount > 0 ? decimal.MinValue : 0m;
        decimal minPnl = totalCount > 0 ? decimal.MaxValue : 0m;
        int winCount = 0;
        int lossCount = 0;

        foreach (var pos in filtered)
        {
            totalPnl += pos.Pnl;
            totalFx += pos.FxExposure;
            if (pos.Pnl > maxPnl) maxPnl = pos.Pnl;
            if (pos.Pnl < minPnl) minPnl = pos.Pnl;
            if (pos.Pnl >= 0) winCount++;
            else lossCount++;
        }

        var overall = new RiskMetricsSummary
        {
            TotalPositions = totalCount,
            TotalPnlUsd = Math.Round(totalPnl, 2),
            TotalFxExposureUsd = Math.Round(totalFx, 2),
            MaxPnlUsd = totalCount > 0 ? Math.Round(maxPnl, 2) : 0,
            MinPnlUsd = totalCount > 0 ? Math.Round(minPnl, 2) : 0,
            ProfitableTradesCount = winCount,
            LossMakingTradesCount = lossCount
        };

        // Aggregation by Book:
        // Position quantities are NOT summed across different commodities because units differ.
        var byBook = filtered
            .GroupBy(p => p.Book, StringComparer.OrdinalIgnoreCase)
            .Select(g => new BookAggregation
            {
                Book = g.Key,
                PositionCount = g.Count(),
                TotalPnlUsd = Math.Round(g.Sum(x => x.Pnl), 2),
                TotalFxExposureUsd = Math.Round(g.Sum(x => x.FxExposure), 2)
            })
            .OrderByDescending(b => b.TotalPnlUsd)
            .ToList();

        // Aggregation by Commodity:
        // Within the same commodity, positions share the same unit and can be summed meaningfully.
        var byCommodity = filtered
            .GroupBy(p => new { p.Commodity, p.Book })
            .Select(g =>
            {
                var unit = RiskPosition.GetUnitForCommodity(g.Key.Commodity, g.Key.Book);
                return new CommodityAggregation
                {
                    Commodity = g.Key.Commodity,
                    Book = g.Key.Book,
                    Unit = unit,
                    PositionCount = g.Count(),
                    NetPosition = Math.Round(g.Sum(x => x.Position), 2),
                    TotalPnlUsd = Math.Round(g.Sum(x => x.Pnl), 2),
                    TotalFxExposureUsd = Math.Round(g.Sum(x => x.FxExposure), 2),
                    AvgMarketPrice = Math.Round(g.Average(x => x.MarketPrice), 2)
                };
            })
            .OrderByDescending(c => c.TotalPnlUsd)
            .ToList();

        // Aggregation by Region:
        var byRegion = filtered
            .GroupBy(p => p.Region, StringComparer.OrdinalIgnoreCase)
            .Select(g => new RegionAggregation
            {
                Region = g.Key,
                PositionCount = g.Count(),
                TotalPnlUsd = Math.Round(g.Sum(x => x.Pnl), 2),
                TotalFxExposureUsd = Math.Round(g.Sum(x => x.FxExposure), 2)
            })
            .OrderByDescending(r => r.TotalPnlUsd)
            .ToList();

        // Top 10 Counterparties by absolute risk exposure:
        var topCounterparties = filtered
            .GroupBy(p => p.Counterparty, StringComparer.OrdinalIgnoreCase)
            .Select(g => new CounterpartyRiskAggregation
            {
                Counterparty = g.Key,
                PositionCount = g.Count(),
                TotalPnlUsd = Math.Round(g.Sum(x => x.Pnl), 2),
                TotalFxExposureUsd = Math.Round(g.Sum(x => x.FxExposure), 2)
            })
            .OrderByDescending(c => c.AbsoluteRiskExposureUsd)
            .Take(10)
            .ToList();

        var response = new AggregationSummaryResponse
        {
            Summary = overall,
            ByBook = byBook,
            ByCommodity = byCommodity,
            ByRegion = byRegion,
            TopCounterparties = topCounterparties
        };

        return Task.FromResult(response);
    }

    public Task<RiskPosition?> GetByTradeIdAsync(string tradeId, CancellationToken cancellationToken = default)
    {
        EnsureLoaded();
        var match = _positions.FirstOrDefault(p => p.TradeId.Equals(tradeId, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(match);
    }

    public Task<IReadOnlyList<string>> GetDistinctValuesAsync(string field, CancellationToken cancellationToken = default)
    {
        EnsureLoaded();

        IEnumerable<string> values = field.ToLowerInvariant() switch
        {
            "book" => _positions.Select(p => p.Book).Distinct(StringComparer.OrdinalIgnoreCase),
            "commodity" => _positions.Select(p => p.Commodity).Distinct(StringComparer.OrdinalIgnoreCase),
            "region" => _positions.Select(p => p.Region).Distinct(StringComparer.OrdinalIgnoreCase),
            "instrumenttype" or "instrument" => _positions.Select(p => p.InstrumentType).Distinct(StringComparer.OrdinalIgnoreCase),
            "currency" => _positions.Select(p => p.Currency).Distinct(StringComparer.OrdinalIgnoreCase),
            "counterparty" => _positions.Select(p => p.Counterparty).Distinct(StringComparer.OrdinalIgnoreCase),
            _ => Enumerable.Empty<string>()
        };

        return Task.FromResult<IReadOnlyList<string>>(values.OrderBy(x => x).ToList());
    }

    public Task<IReadOnlyList<SavedView>> GetSavedViewsAsync()
    {
        var views = _savedViews.Values.OrderBy(v => v.Name).ToList();
        return Task.FromResult<IReadOnlyList<SavedView>>(views);
    }

    public Task<SavedView> CreateSavedViewAsync(SavedView view)
    {
        if (string.IsNullOrWhiteSpace(view.Id))
        {
            view.Id = Guid.NewGuid().ToString("N");
        }
        view.CreatedAtUtc = DateTime.UtcNow;
        _savedViews[view.Id] = view;
        return Task.FromResult(view);
    }

    public Task<bool> DeleteSavedViewAsync(string id)
    {
        return Task.FromResult(_savedViews.TryRemove(id, out _));
    }

    private void EnsureLoaded()
    {
        if (!_isLoaded)
        {
            InitializeData();
        }
    }

    private static IEnumerable<RiskPosition> FilterPositions(IEnumerable<RiskPosition> source, RiskFilterCriteria? criteria)
    {
        if (criteria == null)
        {
            return source;
        }

        var result = source;

        // Free-text / fuzzy search on counterparty or commodity or tradeId
        if (!string.IsNullOrWhiteSpace(criteria.Search))
        {
            string search = criteria.Search.Trim();
            result = result.Where(p =>
                FuzzyMatcher.Matches(p.Counterparty, search) ||
                FuzzyMatcher.Matches(p.Commodity, search) ||
                p.TradeId.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                p.Book.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        // Book filter (supports comma-separated multi-select)
        if (!string.IsNullOrWhiteSpace(criteria.Book))
        {
            var books = criteria.Book.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            result = result.Where(p => books.Any(b => p.Book.Equals(b, StringComparison.OrdinalIgnoreCase)));
        }

        // Commodity filter (supports comma-separated multi-select)
        if (!string.IsNullOrWhiteSpace(criteria.Commodity))
        {
            var commodities = criteria.Commodity.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            result = result.Where(p => commodities.Any(c => p.Commodity.Equals(c, StringComparison.OrdinalIgnoreCase)));
        }

        // Counterparty filter
        if (!string.IsNullOrWhiteSpace(criteria.Counterparty))
        {
            result = result.Where(p => p.Counterparty.Contains(criteria.Counterparty, StringComparison.OrdinalIgnoreCase));
        }

        // Region filter
        if (!string.IsNullOrWhiteSpace(criteria.Region))
        {
            var regions = criteria.Region.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            result = result.Where(p => regions.Any(r => p.Region.Equals(r, StringComparison.OrdinalIgnoreCase)));
        }

        // InstrumentType filter
        if (!string.IsNullOrWhiteSpace(criteria.InstrumentType))
        {
            var instruments = criteria.InstrumentType.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            result = result.Where(p => instruments.Any(i => p.InstrumentType.Equals(i, StringComparison.OrdinalIgnoreCase)));
        }

        // Currency filter
        if (!string.IsNullOrWhiteSpace(criteria.Currency))
        {
            var currencies = criteria.Currency.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            result = result.Where(p => currencies.Any(c => p.Currency.Equals(c, StringComparison.OrdinalIgnoreCase)));
        }

        // Min / Max PnL
        if (criteria.MinPnl.HasValue)
        {
            result = result.Where(p => p.Pnl >= criteria.MinPnl.Value);
        }
        if (criteria.MaxPnl.HasValue)
        {
            result = result.Where(p => p.Pnl <= criteria.MaxPnl.Value);
        }

        // Min / Max Position
        if (criteria.MinPosition.HasValue)
        {
            result = result.Where(p => p.Position >= criteria.MinPosition.Value);
        }
        if (criteria.MaxPosition.HasValue)
        {
            result = result.Where(p => p.Position <= criteria.MaxPosition.Value);
        }

        // AsOfDate Range
        if (criteria.AsOfDateFrom.HasValue)
        {
            result = result.Where(p => p.AsOfDate >= criteria.AsOfDateFrom.Value);
        }
        if (criteria.AsOfDateTo.HasValue)
        {
            result = result.Where(p => p.AsOfDate <= criteria.AsOfDateTo.Value);
        }

        return result;
    }

    private static IEnumerable<RiskPosition> ApplySorting(IEnumerable<RiskPosition> source, List<SortCriteria>? sorts)
    {
        if (sorts == null || sorts.Count == 0)
        {
            // Default sort: highest PnL first
            return source.OrderByDescending(p => p.Pnl);
        }

        IOrderedEnumerable<RiskPosition>? ordered = null;

        for (int i = 0; i < sorts.Count; i++)
        {
            var sort = sorts[i];
            var isDesc = sort.IsDescending;

            if (i == 0)
            {
                ordered = sort.Field.ToLowerInvariant() switch
                {
                    "tradeid" => isDesc ? source.OrderByDescending(p => p.TradeId) : source.OrderBy(p => p.TradeId),
                    "book" => isDesc ? source.OrderByDescending(p => p.Book) : source.OrderBy(p => p.Book),
                    "commodity" => isDesc ? source.OrderByDescending(p => p.Commodity) : source.OrderBy(p => p.Commodity),
                    "counterparty" => isDesc ? source.OrderByDescending(p => p.Counterparty) : source.OrderBy(p => p.Counterparty),
                    "region" => isDesc ? source.OrderByDescending(p => p.Region) : source.OrderBy(p => p.Region),
                    "instrumenttype" => isDesc ? source.OrderByDescending(p => p.InstrumentType) : source.OrderBy(p => p.InstrumentType),
                    "position" => isDesc ? source.OrderByDescending(p => p.Position) : source.OrderBy(p => p.Position),
                    "currency" => isDesc ? source.OrderByDescending(p => p.Currency) : source.OrderBy(p => p.Currency),
                    "marketprice" => isDesc ? source.OrderByDescending(p => p.MarketPrice) : source.OrderBy(p => p.MarketPrice),
                    "pnl" => isDesc ? source.OrderByDescending(p => p.Pnl) : source.OrderBy(p => p.Pnl),
                    "fxexposure" => isDesc ? source.OrderByDescending(p => p.FxExposure) : source.OrderBy(p => p.FxExposure),
                    "asofdate" => isDesc ? source.OrderByDescending(p => p.AsOfDate) : source.OrderBy(p => p.AsOfDate),
                    _ => isDesc ? source.OrderByDescending(p => p.Pnl) : source.OrderBy(p => p.Pnl)
                };
            }
            else if (ordered != null)
            {
                ordered = sort.Field.ToLowerInvariant() switch
                {
                    "tradeid" => isDesc ? ordered.ThenByDescending(p => p.TradeId) : ordered.ThenBy(p => p.TradeId),
                    "book" => isDesc ? ordered.ThenByDescending(p => p.Book) : ordered.ThenBy(p => p.Book),
                    "commodity" => isDesc ? ordered.ThenByDescending(p => p.Commodity) : ordered.ThenBy(p => p.Commodity),
                    "counterparty" => isDesc ? ordered.ThenByDescending(p => p.Counterparty) : ordered.ThenBy(p => p.Counterparty),
                    "region" => isDesc ? ordered.ThenByDescending(p => p.Region) : ordered.ThenBy(p => p.Region),
                    "instrumenttype" => isDesc ? ordered.ThenByDescending(p => p.InstrumentType) : ordered.ThenBy(p => p.InstrumentType),
                    "position" => isDesc ? ordered.ThenByDescending(p => p.Position) : ordered.ThenBy(p => p.Position),
                    "currency" => isDesc ? ordered.ThenByDescending(p => p.Currency) : ordered.ThenBy(p => p.Currency),
                    "marketprice" => isDesc ? ordered.ThenByDescending(p => p.MarketPrice) : ordered.ThenBy(p => p.MarketPrice),
                    "pnl" => isDesc ? ordered.ThenByDescending(p => p.Pnl) : ordered.ThenBy(p => p.Pnl),
                    "fxexposure" => isDesc ? ordered.ThenByDescending(p => p.FxExposure) : ordered.ThenBy(p => p.FxExposure),
                    "asofdate" => isDesc ? ordered.ThenByDescending(p => p.AsOfDate) : ordered.ThenBy(p => p.AsOfDate),
                    _ => isDesc ? ordered.ThenByDescending(p => p.Pnl) : ordered.ThenBy(p => p.Pnl)
                };
            }
        }

        return ordered ?? source;
    }
}

