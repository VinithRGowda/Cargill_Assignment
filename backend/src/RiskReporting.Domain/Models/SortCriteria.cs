namespace RiskReporting.Domain.Models;

/// <summary>
/// Sorting instructions for a column.
/// </summary>
public class SortCriteria
{
    public string Field { get; set; } = string.Empty;
    public string Direction { get; set; } = "asc"; // "asc" or "desc"

    public bool IsDescending => Direction.Equals("desc", StringComparison.OrdinalIgnoreCase);
}

