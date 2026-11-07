using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using RiskReporting.Infrastructure.Data;
using Xunit;

namespace RiskReporting.Tests;

public class CsvLoadingTests
{
    [Fact]
    public void LoadFromCsv_ShouldLoadAllFiftyThousandPositions()
    {
        // Arrange
        var loader = new CsvRiskPositionLoader(NullLogger<CsvRiskPositionLoader>.Instance);

        // Act
        var positions = loader.LoadFromCsv();

        // Assert
        positions.Should().NotBeNull();
        positions.Count.Should().Be(50000);

        var first = positions[0];
        first.TradeId.Should().Be("TRD-000001");
        first.Book.Should().Be("Ags");
        first.Commodity.Should().Be("Palm Oil");
        first.Counterparty.Should().Be("Cobalt Ridge");
        first.Region.Should().Be("APAC");
        first.InstrumentType.Should().Be("Swap");
        first.Position.Should().Be(-2503.8m);
        first.Currency.Should().Be("CNY");
        first.MarketPrice.Should().Be(779.79m);
        first.Pnl.Should().Be(-23003.24m);
        first.FxExposure.Should().Be(-242513.25m);
        first.AsOfDate.Should().Be(new DateOnly(2026, 7, 7));
    }
}

