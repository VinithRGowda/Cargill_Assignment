namespace RiskReporting.Domain.Models;

/// <summary>
/// High-level enterprise risk metrics for all rows matching the active filter.
/// </summary>
public class RiskMetricsSummary
{
    public int TotalPositions { get; set; }
    public decimal TotalPnlUsd { get; set; }
    public decimal TotalFxExposureUsd { get; set; }
    public decimal NetExposureUsd => TotalPnlUsd + TotalFxExposureUsd;
    public decimal MaxPnlUsd { get; set; }
    public decimal MinPnlUsd { get; set; }
    public int ProfitableTradesCount { get; set; }
    public int LossMakingTradesCount { get; set; }
    public decimal WinRatePercentage => TotalPositions > 0 ? Math.Round((decimal)ProfitableTradesCount / TotalPositions * 100, 2) : 0;
}

/// <summary>
/// Aggregation grouped by trading book.
/// Note: Position is not summed across books because units differ by commodity.
/// </summary>
public class BookAggregation
{
    public required string Book { get; set; }
    public int PositionCount { get; set; }
    public decimal TotalPnlUsd { get; set; }
    public decimal TotalFxExposureUsd { get; set; }
    public decimal AvgPnlUsd => PositionCount > 0 ? Math.Round(TotalPnlUsd / PositionCount, 2) : 0;
    public string UnitNote => "Position quantities cannot be aggregated across distinct commodities (differing units).";
}

/// <summary>
/// Aggregation grouped by commodity.
/// Within the same commodity, positions share the same physical unit and can be summed.
/// </summary>
public class CommodityAggregation
{
    public required string Commodity { get; set; }
    public required string Book { get; set; }
    public required string Unit { get; set; }
    public int PositionCount { get; set; }
    
    /// <summary>
    /// Signed net position quantity in the commodity's specific physical unit.
    /// </summary>
    public decimal NetPosition { get; set; }
    public decimal TotalPnlUsd { get; set; }
    public decimal TotalFxExposureUsd { get; set; }
    public decimal AvgMarketPrice { get; set; }
}

/// <summary>
/// Aggregation grouped by geographical region.
/// </summary>
public class RegionAggregation
{
    public required string Region { get; set; }
    public int PositionCount { get; set; }
    public decimal TotalPnlUsd { get; set; }
    public decimal TotalFxExposureUsd { get; set; }
}

/// <summary>
/// Aggregation grouped by counterparty (e.g. top counterparties by absolute risk).
/// </summary>
public class CounterpartyRiskAggregation
{
    public required string Counterparty { get; set; }
    public int PositionCount { get; set; }
    public decimal TotalPnlUsd { get; set; }
    public decimal TotalFxExposureUsd { get; set; }
    public decimal AbsoluteRiskExposureUsd => Math.Abs(TotalPnlUsd) + Math.Abs(TotalFxExposureUsd);
}

/// <summary>
/// Complete aggregation response matching all active filter criteria.
/// </summary>
public class AggregationSummaryResponse
{
    public required RiskMetricsSummary Summary { get; set; }
    public IReadOnlyList<BookAggregation> ByBook { get; set; } = Array.Empty<BookAggregation>();
    public IReadOnlyList<CommodityAggregation> ByCommodity { get; set; } = Array.Empty<CommodityAggregation>();
    public IReadOnlyList<RegionAggregation> ByRegion { get; set; } = Array.Empty<RegionAggregation>();
    public IReadOnlyList<CounterpartyRiskAggregation> TopCounterparties { get; set; } = Array.Empty<CounterpartyRiskAggregation>();
}

