namespace RiskReporting.Domain.Models;

/// <summary>
/// Server-side pagination, sorting, and filtering request payload.
/// Designed for direct compatibility with AG Grid Infinite Row Model.
/// </summary>
public class PagedQueryRequest : RiskFilterCriteria
{
    public int? StartRow { get; set; }
    public int? EndRow { get; set; }

    public int? Page { get; set; }
    public int? PageSize { get; set; }

    /// <summary>
    /// List of sort fields and directions.
    /// </summary>
    public List<SortCriteria> Sorts { get; set; } = new();

    /// <summary>
    /// Calculated 0-indexed start offset.
    /// </summary>
    public int GetOffset()
    {
        if (StartRow.HasValue && StartRow.Value >= 0)
        {
            return StartRow.Value;
        }

        if (Page.HasValue && PageSize.HasValue && Page.Value > 0)
        {
            return (Page.Value - 1) * PageSize.Value;
        }

        return 0;
    }

    /// <summary>
    /// Calculated page size / limit.
    /// </summary>
    public int GetLimit(int defaultSize = 100, int maxSize = 500)
    {
        int limit = defaultSize;
        if (StartRow.HasValue && EndRow.HasValue && EndRow.Value > StartRow.Value)
        {
            limit = EndRow.Value - StartRow.Value;
        }
        else if (PageSize.HasValue && PageSize.Value > 0)
        {
            limit = PageSize.Value;
        }

        return Math.Min(Math.Max(limit, 1), maxSize);
    }
}

