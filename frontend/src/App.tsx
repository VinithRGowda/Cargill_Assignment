import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RiskFilterCriteria,
  RiskPosition,
  AggregationSummaryResponse,
  SavedView,
} from './types/risk';
import { riskClient } from './api/riskClient';
import { Navbar } from './components/Header/Navbar';
import { RiskKpiCards } from './components/KpiCards/RiskKpiCards';
import { FilterToolbar } from './components/FilterToolbar/FilterToolbar';
import { SavedViewsDropdown } from './components/SavedViews/SavedViewsDropdown';
import { RiskDataGrid } from './components/Grid/RiskDataGrid';
import { CommodityGroupTable } from './components/GroupingView/CommodityGroupTable';
import { BookGroupTable } from './components/GroupingView/BookGroupTable';
import { RegionGroupTable } from './components/GroupingView/RegionGroupTable';
import { RiskExposureChart } from './components/Charts/RiskExposureChart';
import { PositionDetailModal } from './components/DetailModal/PositionDetailModal';
import { Table, Layers, Briefcase, Globe, BarChart2 } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  const [filters, setFilters] = useState<RiskFilterCriteria>({});
  const [aggregations, setAggregations] = useState<AggregationSummaryResponse | null>(null);
  const [loadingAggregations, setLoadingAggregations] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'commodity' | 'book' | 'region'>('grid');
  const [showChart, setShowChart] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<RiskPosition | null>(null);
  const gridApiRef = useRef<any>(null);

  // Fetch aggregations whenever filters change
  const fetchAggregations = useCallback(async (activeFilters: RiskFilterCriteria) => {
    setLoadingAggregations(true);
    try {
      const data = await riskClient.getAggregations(activeFilters);
      setAggregations(data);
    } catch (err) {
      console.error('Failed to load aggregations:', err);
    } finally {
      setLoadingAggregations(false);
    }
  }, []);

  useEffect(() => {
    fetchAggregations(filters);
  }, [filters, fetchAggregations]);

  const handleFilterChange = (newFilters: RiskFilterCriteria) => {
    setFilters(newFilters);
    // Purge grid cache to immediately reload server rows
    if (gridApiRef.current) {
      gridApiRef.current.purgeInfiniteCache();
    }
  };

  const handleResetFilters = () => {
    handleFilterChange({});
  };

  const handleApplyView = (view: SavedView) => {
    handleFilterChange(view.filters || {});
    if (view.groupBy === 'commodity') {
      setActiveTab('commodity');
    } else if (view.groupBy === 'book') {
      setActiveTab('book');
    } else if (view.groupBy === 'region') {
      setActiveTab('region');
    } else {
      setActiveTab('grid');
    }
  };

  const handleDrillDownCommodity = (commodity: string) => {
    handleFilterChange({ ...filters, commodity });
    setActiveTab('grid');
  };

  const handleDrillDownBook = (book: string) => {
    handleFilterChange({ ...filters, book });
    setActiveTab('grid');
  };

  const handleDrillDownRegion = (region: string) => {
    handleFilterChange({ ...filters, region });
    setActiveTab('grid');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <Navbar
        totalRows={aggregations?.summary?.totalPositions ?? 50000}
        loading={loadingAggregations}
        onRefresh={() => fetchAggregations(filters)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-4 flex-1 flex flex-col">
        {/* Top Controls: Saved Views & Chart Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <SavedViewsDropdown
            currentFilters={filters}
            onApplyView={handleApplyView}
          />

          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition ${
              showChart
                ? 'bg-sky-950 border-sky-600 text-sky-300 font-medium'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            {showChart ? 'Hide Risk Chart' : 'Show Risk Chart'}
          </button>
        </div>

        {/* Enterprise KPI Summary Cards */}
        <RiskKpiCards
          summary={aggregations?.summary ?? null}
          loading={loadingAggregations}
        />

        {/* Filter Toolbar (Fuzzy Search + Selectors + PnL Ranges) */}
        <FilterToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Risk Exposure Distribution Chart (Expandable) */}
        {showChart && aggregations && (
          <RiskExposureChart
            byBook={aggregations.byBook}
            byRegion={aggregations.byRegion}
          />
        )}

        {/* View Selection Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 mb-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`view-tab flex items-center gap-2 ${
                activeTab === 'grid' ? 'active' : ''
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Positions Grid (Infinite Scroll)</span>
              <span className="tab-badge">
                {aggregations?.summary?.totalPositions.toLocaleString() ?? '...'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('commodity')}
              className={`view-tab flex items-center gap-2 ${
                activeTab === 'commodity' ? 'active' : ''
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Commodity Risk Summary</span>
              <span className="tab-badge">{aggregations?.byCommodity.length ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`view-tab flex items-center gap-2 ${
                activeTab === 'book' ? 'active' : ''
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Trading Book Aggregations</span>
              <span className="tab-badge">{aggregations?.byBook.length ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('region')}
              className={`view-tab flex items-center gap-2 ${
                activeTab === 'region' ? 'active' : ''
              }`}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Geographic Risk</span>
              <span className="tab-badge">{aggregations?.byRegion.length ?? 0}</span>
            </button>
          </div>
        </div>

        {/* Active Tab View Body */}
        <div className="flex-1">
          {activeTab === 'grid' && (
            <RiskDataGrid
              filters={filters}
              onSelectPosition={setSelectedPosition}
              onGridReadyNotify={(api) => {
                gridApiRef.current = api;
              }}
            />
          )}

          {activeTab === 'commodity' && (
            <CommodityGroupTable
              commodities={aggregations?.byCommodity ?? []}
              onDrillDownCommodity={handleDrillDownCommodity}
            />
          )}

          {activeTab === 'book' && (
            <BookGroupTable
              books={aggregations?.byBook ?? []}
              onDrillDownBook={handleDrillDownBook}
            />
          )}

          {activeTab === 'region' && (
            <RegionGroupTable
              regions={aggregations?.byRegion ?? []}
              onDrillDownRegion={handleDrillDownRegion}
            />
          )}
        </div>
      </main>

      {/* Row Master/Detail Modal */}
      <PositionDetailModal
        position={selectedPosition}
        onClose={() => setSelectedPosition(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        CRR Enterprise Corporate Risk Reporting · .NET 10 API + React + AG Grid Infinite Row Model
      </footer>
    </div>
  );
};

export default App;
