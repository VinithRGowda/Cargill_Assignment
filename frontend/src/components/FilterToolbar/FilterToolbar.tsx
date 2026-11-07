import React, { useEffect, useState } from 'react';
import { Search, X, Filter, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { RiskFilterCriteria } from '../../types/risk';
import { riskClient } from '../../api/riskClient';

interface FilterToolbarProps {
  filters: RiskFilterCriteria;
  onFilterChange: (newFilters: RiskFilterCriteria) => void;
  onResetFilters: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [commodities, setCommodities] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Load distinct filter options once from backend
  useEffect(() => {
    let active = true;
    Promise.all([
      riskClient.getDistinctValues('commodity'),
      riskClient.getDistinctValues('book'),
      riskClient.getDistinctValues('region'),
      riskClient.getDistinctValues('instrumentType'),
      riskClient.getDistinctValues('currency'),
    ]).then(([commList, bookList, regList, instList, ccyList]) => {
      if (!active) return;
      setCommodities(commList);
      setBooks(bookList);
      setRegions(regList);
      setInstruments(instList);
      setCurrencies(ccyList);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput.trim() || undefined });
  };

  const handleSearchClear = () => {
    setSearchInput('');
    onFilterChange({ ...filters, search: undefined });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.book ||
      filters.commodity ||
      filters.region ||
      filters.instrumentType ||
      filters.currency ||
      filters.minPnl !== undefined ||
      filters.maxPnl !== undefined
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 mb-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Fuzzy Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-9 pr-20 py-2 bg-slate-950/80 border border-slate-700/80 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
            placeholder="Fuzzy search counterparty or commodity (e.g. Cobalt, Nickel, Vangard)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-12 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition"
          >
            Find
          </button>
        </form>

        {/* Book Selector */}
        <div className="w-36">
          <select
            className="filter-select w-full"
            value={filters.book || ''}
            onChange={(e) => onFilterChange({ ...filters, book: e.target.value || undefined })}
          >
            <option value="">All Books</option>
            {books.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Commodity Selector */}
        <div className="w-40">
          <select
            className="filter-select w-full"
            value={filters.commodity || ''}
            onChange={(e) => onFilterChange({ ...filters, commodity: e.target.value || undefined })}
          >
            <option value="">All Commodities</option>
            {commodities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Region Selector */}
        <div className="w-28">
          <select
            className="filter-select w-full"
            value={filters.region || ''}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value || undefined })}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Instrument Selector */}
        <div className="w-32">
          <select
            className="filter-select w-full"
            value={filters.instrumentType || ''}
            onChange={(e) => onFilterChange({ ...filters, instrumentType: e.target.value || undefined })}
          >
            <option value="">All Instruments</option>
            {instruments.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Selector */}
        <div className="w-24">
          <select
            className="filter-select w-full"
            value={filters.currency || ''}
            onChange={(e) => onFilterChange({ ...filters, currency: e.target.value || undefined })}
          >
            <option value="">All CCY</option>
            {currencies.map((ccy) => (
              <option key={ccy} value={ccy}>
                {ccy}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Advanced */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-2 text-xs font-medium rounded-md border flex items-center gap-1.5 transition ${
            showAdvanced
              ? 'bg-sky-950 border-sky-600 text-sky-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {showAdvanced ? 'Hide Ranges' : 'PnL Ranges'}
        </button>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2 text-xs font-medium rounded-md bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Advanced PnL & Position Ranges Sub-bar */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">PnL USD Range:</span>
            <input
              type="number"
              placeholder="Min PnL ($)"
              className="filter-input w-28"
              value={filters.minPnl ?? ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  minPnl: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
            <span className="text-slate-500">to</span>
            <input
              type="number"
              placeholder="Max PnL ($)"
              className="filter-input w-28"
              value={filters.maxPnl ?? ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxPnl: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, maxPnl: -100000, minPnl: undefined })}
              className="badge bg-rose-900/40 text-rose-300 border border-rose-700/60 hover:bg-rose-800/60 cursor-pointer flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" /> Losses &gt; $100k
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, minPnl: 100000, maxPnl: undefined })}
              className="badge bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-800/60 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Profits &gt; $100k
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
