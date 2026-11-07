using System.Globalization;
using Microsoft.Extensions.Logging;
using RiskReporting.Domain.Entities;

namespace RiskReporting.Infrastructure.Data;

public class CsvRiskPositionLoader
{
    private readonly ILogger<CsvRiskPositionLoader> _logger;

    public CsvRiskPositionLoader(ILogger<CsvRiskPositionLoader> logger)
    {
        _logger = logger;
    }

    public List<RiskPosition> LoadFromCsv(string? customFilePath = null)
    {
        string filePath = ResolveFilePath(customFilePath);
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"Risk positions CSV file not found at: {filePath}");
        }

        _logger.LogInformation("Loading risk positions from: {FilePath}", filePath);
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        var records = new List<RiskPosition>(55000);

        using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 65536);
        using var reader = new StreamReader(stream);

        string? header = reader.ReadLine();
        if (header == null)
        {
            return records;
        }

        int lineNo = 1;
        while (!reader.EndOfStream)
        {
            lineNo++;
            string? line = reader.ReadLine();
            if (string.IsNullOrWhiteSpace(line)) continue;

            try
            {
                var parts = line.Split(',');
                if (parts.Length < 12)
                {
                    continue;
                }

                // Header order: tradeId,book,commodity,counterparty,region,instrumentType,position,currency,marketPrice,pnl,fxExposure,asOfDate
                string tradeId = parts[0].Trim();
                string book = parts[1].Trim();
                string commodity = parts[2].Trim();
                string counterparty = parts[3].Trim();
                string region = parts[4].Trim();
                string instrumentType = parts[5].Trim();

                decimal.TryParse(parts[6].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var position);
                string currency = parts[7].Trim();
                decimal.TryParse(parts[8].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var marketPrice);
                decimal.TryParse(parts[9].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var pnl);
                decimal.TryParse(parts[10].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out var fxExposure);

                DateOnly asOfDate = DateOnly.TryParse(parts[11].Trim(), CultureInfo.InvariantCulture, out var parsedDate)
                    ? parsedDate
                    : DateOnly.FromDateTime(DateTime.UtcNow);

                records.Add(new RiskPosition
                {
                    TradeId = tradeId,
                    Book = book,
                    Commodity = commodity,
                    Counterparty = counterparty,
                    Region = region,
                    InstrumentType = instrumentType,
                    Position = position,
                    Currency = currency,
                    MarketPrice = marketPrice,
                    Pnl = pnl,
                    FxExposure = fxExposure,
                    AsOfDate = asOfDate
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse CSV row {LineNumber}: {Line}", lineNo, line);
            }
        }

        stopwatch.Stop();
        _logger.LogInformation("Successfully loaded {Count} risk positions in {ElapsedMs}ms", records.Count, stopwatch.ElapsedMilliseconds);
        return records;
    }

    private static string ResolveFilePath(string? customFilePath)
    {
        if (!string.IsNullOrWhiteSpace(customFilePath) && File.Exists(customFilePath))
        {
            return Path.GetFullPath(customFilePath);
        }

        string[] candidates = new[]
        {
            "risk_positions.csv",
            Path.Combine(AppContext.BaseDirectory, "risk_positions.csv"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "risk_positions.csv"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "risk_positions.csv"),
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "risk_positions.csv"),
            Path.Combine(AppContext.BaseDirectory, "..", "risk_positions.csv"),
            @"D:\Desktop\Cargill project\risk_positions.csv"
        };

        foreach (var candidate in candidates)
        {
            try
            {
                var full = Path.GetFullPath(candidate);
                if (File.Exists(full))
                {
                    return full;
                }
            }
            catch
            {
                // Ignore invalid candidate paths
            }
        }

        return "risk_positions.csv";
    }
}
