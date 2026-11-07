using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using RiskReporting.Domain.Models;
using RiskReporting.Infrastructure.Data;
using RiskReporting.Infrastructure.Repositories;
using Xunit;

namespace RiskReporting.Tests;

public class AggregationTests
{
    private readonly RiskPositionRepository _repository;

    public AggregationTests()
    {
        var loader = new CsvRiskPositionLoader(NullLogger<CsvRiskPositionLoader>.Instance);
        _repository = new RiskPositionRepository(NullLogger<RiskPositionRepository>.Instance, loader);
    }

    [Fact]
    public async Task GetAggregationsAsync_WithoutFilters_ShouldAggregateAcrossEntireDataset()
    {
        // Act
        var result = await _repository.GetAggregationsAsync(new RiskFilterCriteria());

        // Assert
        result.Should().NotBeNull();
        result.Summary.TotalPositions.Should().Be(50000);
        result.ByBook.Should().HaveCount(4); // Ags, Freight, Ferrous, Non-Ferrous
        result.ByCommodity.Should().NotBeEmpty();
        result.ByRegion.Should().HaveCount(3); // APAC, EMEA, AMER

        // Book aggregation PnL sum must equal overall total PnL
        decimal sumBookPnl = result.ByBook.Sum(b => b.TotalPnlUsd);
        Math.Abs(sumBookPnl - result.Summary.TotalPnlUsd).Should().BeLessThan(1.0m);
    }

    [Fact]
    public async Task GetAggregationsAsync_WithFilter_ShouldReflectOnlyFilteredRows()
    {
        // Arrange
        var filter = new RiskFilterCriteria { Book = "Freight" };

        // Act
        var result = await _repository.GetAggregationsAsync(filter);

        // Assert
        result.Should().NotBeNull();
        result.Summary.TotalPositions.Should().BeLessThan(50000);
        result.ByBook.Should().HaveCount(1);
        result.ByBook[0].Book.Should().Be("Freight");

        // Commodities in freight should only be vessel categories
        result.ByCommodity.Should().OnlyContain(c => c.Book == "Freight");
        foreach (var c in result.ByCommodity)
        {
            c.Unit.Should().Contain("Days");
            c.PositionCount.Should().BeGreaterThan(0);
        }
    }

    [Fact]
    public async Task GetAggregationsAsync_CommodityPositionSums_ShouldBePopulatedPerCommodity()
    {
        // Act
        var result = await _repository.GetAggregationsAsync(new RiskFilterCriteria());

        // Assert
        var copper = result.ByCommodity.FirstOrDefault(c => c.Commodity.Equals("Copper", StringComparison.OrdinalIgnoreCase));
        copper.Should().NotBeNull();
        copper!.NetPosition.Should().NotBe(0);
        copper.Unit.Should().Contain("Metric Tons");
    }
}

