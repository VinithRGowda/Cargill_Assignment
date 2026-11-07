namespace RiskReporting.Domain.Models;

/// <summary>
/// A saved risk analysis view preset.
/// </summary>
public class SavedView
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public required string Name { get; set; }
    public string? Description { get; set; }
    public RiskFilterCriteria Filters { get; set; } = new();
    public List<SortCriteria> Sorts { get; set; } = new();
    public List<string>? VisibleColumns { get; set; }
    public string? GroupBy { get; set; } // "book" or "commodity"
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

