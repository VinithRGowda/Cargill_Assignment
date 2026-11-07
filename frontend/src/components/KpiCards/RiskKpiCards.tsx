import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  Scale,
  Percent,
} from 'lucide-react';
import { RiskMetricsSummary } from '../../types/risk';
import { formatCompactUsd, formatUsd } from '../Grid/formatters';

interface RiskKpiCardsProps {
  summary: RiskMetricsSummary | null;
  loading: boolean;
}

export const RiskKpiCards: React.FC<RiskKpiCardsProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="kpi-card animate-pulse bg-slate-900/60 h-24 rounded-lg border border-slate-800" />
        ))}
      </div>
    );
  }

  const isPnlPositive = summary.totalPnlUsd >= 0;
  const isNetPositive = summary.netExposureUsd >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* 1. Total Positions */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Active Positions</span>
          <Layers className="w-4 h-4 text-sky-400" />
        </div>
        <div className="kpi-value text-sky-400">
          {summary.totalPositions.toLocaleString()}
        </div>
        <div className="kpi-subtext">matching active filters</div>
      </div>

      {/* 2. Total PnL */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Enterprise P&L</span>
          {isPnlPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-400" />
          )}
        </div>
        <div className={`kpi-value ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatCompactUsd(summary.totalPnlUsd)}
        </div>
        <div className="kpi-subtext font-mono text-[11px]">
          {formatUsd(summary.totalPnlUsd)}
        </div>
      </div>

      {/* 3. Total FX Exposure */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">FX Exposure</span>
          <DollarSign className="w-4 h-4 text-amber-400" />
        </div>
        <div className="kpi-value text-amber-400">
          {formatCompactUsd(summary.totalFxExposureUsd)}
        </div>
        <div className="kpi-subtext font-mono text-[11px]">
          {formatUsd(summary.totalFxExposureUsd)}
        </div>
      </div>

      {/* 4. Net Exposure */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Net Combined Risk</span>
          <Scale className="w-4 h-4 text-indigo-400" />
        </div>
        <div className={`kpi-value ${isNetPositive ? 'text-indigo-300' : 'text-orange-400'}`}>
          {formatCompactUsd(summary.netExposureUsd)}
        </div>
        <div className="kpi-subtext font-mono text-[11px]">PnL + FX Exposure</div>
      </div>

      {/* 5. Win Rate */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Win Rate</span>
          <Percent className="w-4 h-4 text-purple-400" />
        </div>
        <div className="kpi-value text-purple-400">
          {summary.winRatePercentage}%
        </div>
        <div className="kpi-subtext">
          <span className="text-emerald-400">{summary.profitableTradesCount}W</span> /{' '}
          <span className="text-rose-400">{summary.lossMakingTradesCount}L</span>
        </div>
      </div>

      {/* 6. Drawdown Spread */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Max Drawdown</span>
          <TrendingDown className="w-4 h-4 text-rose-500" />
        </div>
        <div className="kpi-value text-rose-400">
          {formatCompactUsd(summary.minPnlUsd)}
        </div>
        <div className="kpi-subtext">
          Max Gain: <span className="text-emerald-400">{formatCompactUsd(summary.maxPnlUsd)}</span>
        </div>
      </div>
    </div>
  );
};

