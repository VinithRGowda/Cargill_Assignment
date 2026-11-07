using Microsoft.AspNetCore.Mvc;
using RiskReporting.Domain.Models;
using RiskReporting.Infrastructure.Repositories;

namespace RiskReporting.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ViewsController : ControllerBase
{
    private readonly IRiskPositionRepository _repository;
    private readonly ILogger<ViewsController> _logger;

    public ViewsController(IRiskPositionRepository repository, ILogger<ViewsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Lists all preset and saved risk views.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SavedView>>> Get()
    {
        var views = await _repository.GetSavedViewsAsync();
        return Ok(views);
    }

    /// <summary>
    /// Saves a new view preset.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SavedView>> Post([FromBody] SavedView view)
    {
        if (string.IsNullOrWhiteSpace(view.Name))
        {
            return BadRequest(new { message = "View name is required." });
        }

        var saved = await _repository.CreateSavedViewAsync(view);
        return CreatedAtAction(nameof(Get), new { id = saved.Id }, saved);
    }

    /// <summary>
    /// Deletes a saved view preset by ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var removed = await _repository.DeleteSavedViewAsync(id);
        if (!removed)
        {
            return NotFound(new { message = $"View {id} not found." });
        }

        return NoContent();
    }
}

