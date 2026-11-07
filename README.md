# Corporate Risk Reporting (CRR) — Full-Stack Platform

Enterprise risk reporting platform for trading desks across **Ags, Ferrous, Non-Ferrous, and Freight**. Built with a **.NET 10 ASP.NET Core Web API** and a **React 18 + TypeScript + AG Grid Community** frontend, serving **50,000+ risk positions** with sub-second filtering, pagination, and multi-dimensional aggregations.

---

## 🌟 Key Features

- **AG Grid Infinite Row Model:** Virtualized server-backed scrolling with 100-row batching (`IDatasource`), sorting, and filtering over 50,000 positions with zero browser freeze.
- **Filter-Wide Aggregations:** Server-side aggregation endpoint returning enterprise totals across **all rows matching the active filters** (not just the current page).
- **Domain-Specific Quantity Semantics:** Distinguishes homogeneous physical commodity quantities (Metric Tons, Charter Vessel Days, Bushels) from USD financial metrics, preventing invalid cross-commodity position summation.
- **Commodity & Book Grouping Views:** Full summary views with one-click drilldowns into underlying trades.
- **Typo-Tolerant Fuzzy Search:** Fast tokenized and Levenshtein distance matching on Counterparties and Commodities (e.g. searching *"Vangard"* matches *"Vanguard Ags"*, *"Coper"* matches *"Copper"*).
- **Interactive Risk & Exposure Chart:** Visual distribution of P&L and FX Exposure grouped by trading book or geographical region.
- **Persistent Saved Views:** Quick presets for critical drawdowns, regional exposures, and custom analyst views.
- **Master/Detail Trade Inspector:** Slide-out inspection drawer detailing mark price, notional value, currency, and risk attributes.
- **Comprehensive Automated Testing:** 15 unit and integration tests across backend (.NET xUnit) and frontend (Vitest + React Testing Library).
- **CI/CD Automation:** GitHub Actions workflow (`.github/workflows/ci.yml`) building and validating both stacks.

---

## 📐 Architecture Overview

```
D:\Desktop\Cargill project\
├── risk_positions.csv          # 50,000 synthetic trading positions
├── CRR_Full_Stack_Screening_Assignment.md
├── DESIGN.md                   # Architecture, dataset scaling, OpenSearch design
├── README.md                   # This documentation
├── .github/workflows/ci.yml    # GitHub Actions automated build & test pipeline
├── backend/                    # .NET 10 ASP.NET Core Web API
│   ├── RiskReporting.slnx      # Solution file
│   ├── src/
│   │   ├── RiskReporting.Domain/         # Core models, filter contracts, aggregations
│   │   ├── RiskReporting.Infrastructure/ # Streaming CSV loader, fuzzy search, query repository
│   │   └── RiskReporting.Api/            # REST controllers, DI configuration, CORS
│   └── tests/
│       └── RiskReporting.Tests/          # Unit & integration tests (xUnit + FluentAssertions)
└── frontend/                   # React 18 + TypeScript + Vite + AG Grid Community
    ├── src/
    │   ├── api/riskClient.ts             # API client with error handling
    │   ├── components/
    │   │   ├── Grid/                     # AG Grid infinite scroll & cell formatters
    │   │   ├── GroupingView/             # Commodity, Book, and Regional summary tables
    │   │   ├── FilterToolbar/            # Fuzzy search and criteria controls
    │   │   ├── KpiCards/                 # Enterprise totals and drawdown metrics
    │   │   ├── Charts/                   # Risk exposure distribution chart
    │   │   ├── SavedViews/               # View presets and custom view persistence
    │   │   └── DetailModal/              # Trade drilldown inspector
    │   ├── App.tsx                       # Main application shell
    │   └── main.tsx
    └── tests/                            # Vitest component & logic tests
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **.NET 10 SDK** (Installed at `D:\dotnet` or in standard PATH)
- **Node.js** (v20+ recommended) and **npm**

---

### Step 1: Start the Backend (.NET 10 Web API)

The backend automatically loads and indexes the 50,000 rows from `risk_positions.csv` into memory on startup (takes ~100ms).

```powershell
# Open terminal 1
cd "D:\Desktop\Cargill project\backend"

# Ensure dotnet 10 is in your PATH if using the portable SDK
$env:PATH = "D:\dotnet;$env:PATH"

# Run the API server
dotnet run --project src/RiskReporting.Api/RiskReporting.Api.csproj
```

The API will start listening at:
- **Base URL:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/health`
- **Positions Endpoint:** `http://localhost:5000/api/risk-positions`
- **Aggregations Endpoint:** `http://localhost:5000/api/aggregations`

---

### Step 2: Start the Frontend (React + Vite)

```powershell
# Open terminal 2
cd "D:\Desktop\Cargill project\frontend"

# Start the Vite development server
npm run dev
```

The frontend application will be available at:
- **Local Application:** `http://localhost:5173`

The Vite dev server proxies all `/api` requests directly to `http://localhost:5000`.

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests (xUnit)
```powershell
cd "D:\Desktop\Cargill project\backend"
$env:PATH = "D:\dotnet;$env:PATH"
dotnet test
```
*Coverage includes CSV loading (50,000 rows verification), server-side pagination, multi-column sorting, fuzzy search matching, and commodity/book aggregation logic.*

### Frontend Component & Formatter Tests (Vitest)
```powershell
cd "D:\Desktop\Cargill project\frontend"
npm test
```
*Coverage includes KPI card rendering, commodity drilldown action dispatches, currency formatters, and book unit disparity callout verification.*

---

## 📡 API Reference

### 1. `GET /api/risk-positions`
Fetches a paginated, sorted, and filtered slice of trades.

| Parameter | Type | Description |
|---|---|---|
| `startRow` | int | 0-indexed start offset (e.g. 0, 100, 200) |
| `endRow` | int | 0-indexed end offset (e.g. 100, 200, 300) |
| `search` | string | Free-text / fuzzy search on counterparty or commodity |
| `book` | string | Book filter (`Ags`, `Freight`, `Ferrous`, `Non-Ferrous`) |
| `commodity` | string | Commodity filter (`Copper`, `HRC Steel`, `Capesize`, etc.) |
| `region` | string | `APAC`, `EMEA`, `AMER` |
| `instrumentType` | string | `Physical`, `Future`, `Swap` |
| `currency` | string | `USD`, `EUR`, `CNY`, `SGD` |
| `minPnl` / `maxPnl` | decimal | Minimum / maximum P&L in USD |
| `sortField` | string | Column to sort by (`pnl`, `position`, `tradeId`, etc.) |
| `sortDir` | string | `asc` or `desc` |

### 2. `GET /api/aggregations`
Returns totals calculated over **all rows matching active filters**:
- **`summary`:** Total positions, total P&L, total FX exposure, win rate %, profitable/loss trade counts, max drawdown.
- **`byBook`:** P&L and FX exposure sums per trading book (position sum omitted due to cross-commodity unit disparity).
- **`byCommodity`:** Net position quantity in commodity-specific physical units, P&L, FX exposure, average mark price.
- **`byRegion`:** P&L and FX exposure sums by APAC, EMEA, AMER.
- **`topCounterparties`:** Top 10 counterparties by gross absolute risk exposure.

### 3. `GET /api/risk-positions/{tradeId}`
Returns single trade record for drilldown inspection.

### 4. `GET /api/views` & `POST /api/views`
Retrieves or persists analyst filter presets and saved views.

---

## 📊 Design & Scaling Notes
For detailed architectural rationale, OpenSearch index mappings, query DSL, and scaling tradeoffs, please refer to [DESIGN.md](DESIGN.md).

