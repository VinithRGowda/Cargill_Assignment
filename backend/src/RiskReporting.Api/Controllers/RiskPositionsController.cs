using Microsoft.AspNetCore.Mvc;
using RiskReporting.Domain.Entities;
using RiskReporting.Domain.Models;
using RiskReporting.Infrastructure.Repositories;

namespace RiskReporting.Api.Controllers;

[ApiController]
[Route("api/risk-positions")]
[Route("api/riskpositions")]
[Produces("application/json")]
public class RiskPositionsController : ControllerBase
{
    private readonly IRiskPositionRepository _repository;
    private readonly ILogger<RiskPositionsController> _logger;

    public RiskPositionsController(IRiskPositionRepository repository, ILogger<RiskPositionsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Gets a paginated, sorted, and filtered list of risk positions (AG Grid Infinite Row Model compatible).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<RiskPosition>>> Get(
        [FromQuery] int? startRow,
        [FromQuery] int? endRow,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? search,
        [FromQuery] string? book,
        [FromQuery] string? commodity,
        [FromQuery] string? counterparty,
        [FromQuery] string? region,
        [FromQuery] string? instrumentType,
        [FromQuery] string? currency,
        [FromQuery] decimal? minPnl,
        [FromQuery] decimal? maxPnl,
        [FromQuery] decimal? minPosition,
        [FromQuery] decimal? maxPosition,
        [FromQuery] DateOnly? asOfDateFrom,
        [FromQuery] DateOnly? asOfDateTo,
        [FromQuery] string? sortField,
        [FromQuery] string? sortDir,
        CancellationToken cancellationToken)
    {
        var request = new PagedQueryRequest
        {
            StartRow = startRow,
            EndRow = endRow,
            Page = page,
            PageSize = pageSize,
            Search = search,
            Book = book,
            Commodity = commodity,
            Counterparty = counterparty,
            Region = region,
            InstrumentType = instrumentType,
            Currency = currency,
            MinPnl = minPnl,
            MaxPnl = maxPnl,
            MinPosition = minPosition,
            MaxPosition = maxPosition,
            AsOfDateFrom = asOfDateFrom,
            AsOfDateTo = asOfDateTo
        };

        if (!string.IsNullOrWhiteSpace(sortField))
        {
            request.Sorts.Add(new SortCriteria
            {
                Field = sortField,
                Direction = string.IsNullOrWhiteSpace(sortDir) ? "asc" : sortDir
            });
        }

        var result = await _repository.GetPagedAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Advanced query endpoint accepting complex multi-column sorting and filtering payloads.
    /// </summary>
    [HttpPost("query")]
    public async Task<ActionResult<PagedResult<RiskPosition>>> Query(
        [FromBody] PagedQueryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _repository.GetPagedAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets a single risk position by Trade ID for drilldown or modal inspection.
    /// </summary>
    [HttpGet("{tradeId}")]
    public async Task<ActionResult<RiskPosition>> GetByTradeId(string tradeId, CancellationToken cancellationToken)
    {
        var position = await _repository.GetByTradeIdAsync(tradeId, cancellationToken);
        if (position == null)
        {
            return NotFound(new { message = $"Trade {tradeId} not found." });
        }

        return Ok(position);
    }

    /// <summary>
    /// Returns distinct values for a given field (used by frontend filter dropdowns).
    /// </summary>
    [HttpGet("meta/distinct/{field}")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetDistinctValues(string field, CancellationToken cancellationToken)
    {
        var values = await _repository.GetDistinctValuesAsync(field, cancellationToken);
        return Ok(values);
    }
}
