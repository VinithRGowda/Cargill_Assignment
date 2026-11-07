namespace RiskReporting.Domain.Models;

/// <summary>
/// Paginated envelope for AG Grid and API consumers.
/// </summary>
/// <typeparam name="T">Payload row type</typeparam>
public class PagedResult<T>
{
    public IReadOnlyList<T> Rows { get; set; } = Array.Empty<T>();
    public int TotalCount { get; set; }
    public int StartRow { get; set; }
    public int EndRow { get; set; }

    public PagedResult() { }

    public PagedResult(IReadOnlyList<T> rows, int totalCount, int startRow, int endRow)
    {
        Rows = rows;
        TotalCount = totalCount;
        StartRow = startRow;
        EndRow = endRow;
    }
}

