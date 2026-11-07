import React, { useState } from 'react';
import { BookAggregation, RegionAggregation } from '../../types/risk';
import { formatCompactUsd, formatUsd } from '../Grid/formatters';
import { BarChart3 } from 'lucide-react';

interface RiskExposureChartProps {
  byBook: BookAggregation[];
  byRegion: RegionAggregation[];
}

export const RiskExposureChart: React.FC<RiskExposureChartProps> = ({ byBook, byRegion }) => {
  const [metric, setMetric] = useState<'pnl' | 'fx'>('pnl');
  const [groupBy, setGroupBy] = useState<'book' | 'region'>('book');

  const items = groupBy === 'book'
    ? byBook.map((b) => ({
        label: b.book,
        value: metric === 'pnl' ? b.totalPnlUsd : b.totalFxExposureUsd,
        count: b.positionCount,
      }))
    : byRegion.map((r) => ({
        label: r.region,
        value: metric === 'pnl' ? r.totalPnlUsd : r.totalFxExposureUsd,
        count: r.positionCount,
      }));

  const maxAbsValue = Math.max(...items.map((i) => Math.abs(i.value)), 100000);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 mb-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Risk & Exposure Distribution
          </h3>
          <span className="text-xs text-slate-400">
            ({metric === 'pnl' ? 'P&L USD' : 'FX Exposure USD'} by{' '}
            {groupBy === 'book' ? 'Trading Book' : 'Geographical Region'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Group toggle */}
          <div className="inline-flex rounded-md shadow-sm border border-slate-700 p-0.5 bg-slate-950">
            <button
              type="button"
              onClick={() => setGroupBy('book')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                groupBy === 'book'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Book
            </button>
            <button
              type="button"
              onClick={() => setGroupBy('region')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                groupBy === 'region'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Region
            </button>
          </div>

          {/* Metric toggle */}
          <div className="inline-flex rounded-md shadow-sm border border-slate-700 p-0.5 bg-slate-950">
            <button
              type="button"
              onClick={() => setMetric('pnl')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                metric === 'pnl'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              P&L
            </button>
            <button
              type="button"
              onClick={() => setMetric('fx')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                metric === 'fx'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FX Exposure
            </button>
          </div>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const isPositive = item.value >= 0;
          const percentage = Math.min(Math.round((Math.abs(item.value) / maxAbsValue) * 100), 100);

          return (
            <div
              key={item.label}
              className="bg-slate-950/70 border border-slate-800 rounded p-3 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-slate-200 text-xs">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {item.count.toLocaleString()} trades
                </span>
              </div>

              <div
                className={`text-base font-bold font-mono ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCompactUsd(item.value)}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mb-2">
                {formatUsd(item.value)}
              </div>

              {/* Bar visualization */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric === 'pnl'
                      ? isPositive
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

