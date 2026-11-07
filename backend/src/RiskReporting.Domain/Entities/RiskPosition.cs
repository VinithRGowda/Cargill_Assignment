namespace RiskReporting.Domain.Entities;

/// <summary>
/// Represents a trading risk position record across commodities and trading books.
/// </summary>
public class RiskPosition
{
    public required string TradeId { get; set; }
    public required string Book { get; set; }
    public required string Commodity { get; set; }
    public required string Counterparty { get; set; }
    public required string Region { get; set; }
    public required string InstrumentType { get; set; }
    
    /// <summary>
    /// Signed position quantity. Note: Units differ by commodity (e.g. Metric Tons, Vessel Days, Bushels);
    /// cross-commodity position summation is mathematically invalid.
    /// </summary>
    public decimal Position { get; set; }
    
    public required string Currency { get; set; }
    public decimal MarketPrice { get; set; }
    
    /// <summary>
    /// Signed Profit & Loss valuation in USD.
    /// </summary>
    public decimal Pnl { get; set; }
    
    /// <summary>
    /// Signed Foreign Exchange exposure in USD.
    /// </summary>
    public decimal FxExposure { get; set; }
    
    /// <summary>
    /// Valuation As-Of date.
    /// </summary>
    public DateOnly AsOfDate { get; set; }

    /// <summary>
    /// Helper to determine the physical measurement unit for the commodity.
    /// </summary>
    public string CommodityUnit => GetUnitForCommodity(Commodity, Book);

    public static string GetUnitForCommodity(string commodity, string book)
    {
        if (book.Equals("Freight", StringComparison.OrdinalIgnoreCase) ||
            commodity.Equals("Capesize", StringComparison.OrdinalIgnoreCase) ||
            commodity.Equals("Panamax", StringComparison.OrdinalIgnoreCase) ||
            commodity.Equals("Supramax", StringComparison.OrdinalIgnoreCase))
        {
            return "Days (Vessel Timecharter)";
        }

        if (commodity.Equals("Corn", StringComparison.OrdinalIgnoreCase) ||
            commodity.Equals("Soybean", StringComparison.OrdinalIgnoreCase) ||
            commodity.Equals("Wheat", StringComparison.OrdinalIgnoreCase))
        {
            return "Bushels / MT";
        }

        return "Metric Tons (MT)";
    }
}

