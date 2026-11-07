using RiskReporting.Infrastructure.Data;
using RiskReporting.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Register CORS policy for frontend clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://localhost:4173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register Domain & Infrastructure services
builder.Services.AddSingleton<CsvRiskPositionLoader>();
builder.Services.AddSingleton<IRiskPositionRepository, RiskPositionRepository>();

// Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("AllowFrontend");

app.MapHealthChecks("/health");

app.MapGet("/", () => Results.Ok(new
{
    service = "Corporate Risk Reporting (CRR) API",
    version = "1.0.0",
    status = "Healthy",
    endpoints = new[]
    {
        "/api/risk-positions (GET, POST)",
        "/api/risk-positions/{tradeId} (GET)",
        "/api/risk-positions/meta/distinct/{field} (GET)",
        "/api/aggregations (GET, POST)",
        "/api/views (GET, POST, DELETE)",
        "/health (GET)"
    }
}));

app.MapControllers();

// Pre-warm the repository on startup
var repository = app.Services.GetRequiredService<IRiskPositionRepository>();
app.Logger.LogInformation("CRR Risk API initialized. Loaded {Count} risk positions into memory.", repository.TotalLoadedCount);

app.Run();

// Make Program accessible to integration test assemblies
public partial class Program { }
