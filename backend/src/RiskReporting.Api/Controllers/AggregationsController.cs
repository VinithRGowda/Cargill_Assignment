using Microsoft.AspNetCore.Mvc;
using RiskReporting.Domain.Models;
using RiskReporting.Infrastructure.Repositories;

namespace RiskReporting.Api.Controllers;

[ApiController]
[Route("api/aggregations")]
[Produces("application/json")]
public class AggregationsController : ControllerBase
{
    private readonly IRiskPositionRepository _repository;
    private readonly ILogger<AggregationsController> _logger;

    public AggregationsController(IRiskPositionRepository repository, ILogger<AggregationsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Returns aggregated risk summaries (overall totals, by book, by commodity, by region, top counterparties)
    /// across ALL rows matching the active filters, not just the current page.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AggregationSummaryResponse>> Get(
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
        CancellationToken cancellationToken)
    {
        var filter = new RiskFilterCriteria
        {
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

        var aggregations = await _repository.GetAggregationsAsync(filter, cancellationToken);
        return Ok(aggregations);
    }

    /// <summary>
    /// POST variant for querying aggregations using a JSON filter payload.
    /// </summary>
    [HttpPost("query")]
    public async Task<ActionResult<AggregationSummaryResponse>> Query(
        [FromBody] RiskFilterCriteria filters,
        CancellationToken cancellationToken)
    {
        var aggregations = await _repository.GetAggregationsAsync(filters, cancellationToken);
        return Ok(aggregations);
    }
}
