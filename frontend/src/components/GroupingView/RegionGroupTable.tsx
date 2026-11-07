import React from 'react';
import { RegionAggregation } from '../../types/risk';
import { formatUsd } from '../Grid/formatters';
import { Globe, ExternalLink } from 'lucide-react';

interface RegionGroupTableProps {
  regions: RegionAggregation[];
  onDrillDownRegion: (region: string) => void;
}

export const RegionGroupTable: React.FC<RegionGroupTableProps> = ({
  regions,
  onDrillDownRegion,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            Geographic Region Risk Aggregations (Active Filters)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-border valuation across APAC, EMEA, and AMER trading desks.
          </p>
        </div>
        <span className="badge badge-info">{regions.length} Regions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Region</th>
              <th className="py-3 px-4 text-right">Active Trades</th>
              <th className="py-3 px-4 text-right">Total P&L (USD)</th>
              <th className="py-3 px-4 text-right">FX Exposure (USD)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {regions.map((row) => {
              const isPnlPositive = row.totalPnlUsd >= 0;
              return (
                <tr
                  key={row.region}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => onDrillDownRegion(row.region)}
                >
                  <td className="py-3 px-4 font-semibold text-slate-100">
                    <span className="badge badge-region">{row.region}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {row.positionCount.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                      isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatUsd(row.totalPnlUsd)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-amber-300">
                    {formatUsd(row.totalFxExposureUsd)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDrillDownRegion(row.region);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-300 flex items-center gap-1 mx-auto transition"
                    >
                      <ExternalLink className="w-3 h-3" /> Drilldown
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

