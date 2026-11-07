using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using RiskReporting.Domain.Models;
using RiskReporting.Infrastructure.Data;
using RiskReporting.Infrastructure.Repositories;
using Xunit;

namespace RiskReporting.Tests;

public class RepositoryFilteringAndSortingTests
{
    private readonly RiskPositionRepository _repository;

    public RepositoryFilteringAndSortingTests()
    {
        var loader = new CsvRiskPositionLoader(NullLogger<CsvRiskPositionLoader>.Instance);
        _repository = new RiskPositionRepository(NullLogger<RiskPositionRepository>.Instance, loader);
    }

    [Fact]
    public async Task GetPagedAsync_ShouldPaginateProperlyWithStartAndEndRow()
    {
        // Arrange
        var request = new PagedQueryRequest
        {
            StartRow = 0,
            EndRow = 100
        };

        // Act
        var result = await _repository.GetPagedAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.TotalCount.Should().Be(50000);
        result.Rows.Should().HaveCount(100);
        result.StartRow.Should().Be(0);
        result.EndRow.Should().Be(100);
    }

    [Fact]
    public async Task GetPagedAsync_WithBookFilter_ShouldReturnOnlyMatchingBook()
    {
        // Arrange
        var request = new PagedQueryRequest
        {
            Book = "Ferrous",
            StartRow = 0,
            EndRow = 50
        };

        // Act
        var result = await _repository.GetPagedAsync(request);

        // Assert
        result.Rows.Should().NotBeEmpty();
        result.Rows.Should().OnlyContain(r => r.Book == "Ferrous");
        result.TotalCount.Should().BeLessThan(50000);
    }

    [Fact]
    public async Task GetPagedAsync_WithFuzzySearch_ShouldMatchCounterpartyAndCommodity()
    {
        // Arrange: "Cobalt" should match "Cobalt Ridge"
        var request = new PagedQueryRequest
        {
            Search = "Cobalt",
            StartRow = 0,
            EndRow = 50
        };

        // Act
        var result = await _repository.GetPagedAsync(request);

        // Assert
        result.Rows.Should().NotBeEmpty();
        result.Rows.Should().OnlyContain(r =>
            r.Counterparty.Contains("Cobalt", StringComparison.OrdinalIgnoreCase) ||
            r.Commodity.Contains("Cobalt", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetPagedAsync_WithSorting_ShouldSortByPnlDescending()
    {
        // Arrange
        var request = new PagedQueryRequest
        {
            StartRow = 0,
            EndRow = 20,
            Sorts = new List<SortCriteria>
            {
                new() { Field = "pnl", Direction = "desc" }
            }
        };

        // Act
        var result = await _repository.GetPagedAsync(request);

        // Assert
        result.Rows.Should().HaveCount(20);
        for (int i = 0; i < result.Rows.Count - 1; i++)
        {
            result.Rows[i].Pnl.Should().BeGreaterThanOrEqualTo(result.Rows[i + 1].Pnl);
        }
    }
}
