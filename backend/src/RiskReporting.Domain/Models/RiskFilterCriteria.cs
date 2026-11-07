namespace RiskReporting.Domain.Models;

/// <summary>
/// Criteria for filtering risk positions.
/// </summary>
public class RiskFilterCriteria
{
    /// <summary>
    /// Free-text or fuzzy search across counterparty, commodity, tradeId.
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Book filter (can be single or comma-separated list).
    /// </summary>
    public string? Book { get; set; }

    /// <summary>
    /// Commodity filter (can be single or comma-separated list).
    /// </summary>
    public string? Commodity { get; set; }

    /// <summary>
    /// Counterparty filter.
    /// </summary>
    public string? Counterparty { get; set; }

    /// <summary>
    /// Region filter (APAC, EMEA, AMER).
    /// </summary>
    public string? Region { get; set; }

    /// <summary>
    /// Instrument type filter (Physical, Future, Swap).
    /// </summary>
    public string? InstrumentType { get; set; }

    /// <summary>
    /// Currency filter (USD, EUR, CNY, SGD).
    /// </summary>
    public string? Currency { get; set; }

    /// <summary>
    /// Minimum PnL in USD.
    /// </summary>
    public decimal? MinPnl { get; set; }

    /// <summary>
    /// Maximum PnL in USD.
    /// </summary>
    public decimal? MaxPnl { get; set; }

    /// <summary>
    /// Minimum signed position.
    /// </summary>
    public decimal? MinPosition { get; set; }

    /// <summary>
    /// Maximum signed position.
    /// </summary>
    public decimal? MaxPosition { get; set; }

    /// <summary>
    /// Start date for valuation as-of date.
    /// </summary>
    public DateOnly? AsOfDateFrom { get; set; }

    /// <summary>
    /// End date for valuation as-of date.
    /// </summary>
    public DateOnly? AsOfDateTo { get; set; }
}

