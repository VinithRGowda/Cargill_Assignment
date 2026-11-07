import React from 'react';
import { CommodityAggregation } from '../../types/risk';
import { formatNumber, formatUsd } from '../Grid/formatters';
import { ExternalLink, Layers } from 'lucide-react';

interface CommodityGroupTableProps {
  commodities: CommodityAggregation[];
  onDrillDownCommodity: (commodity: string) => void;
}

export const CommodityGroupTable: React.FC<CommodityGroupTableProps> = ({
  commodities,
  onDrillDownCommodity,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Commodity Risk Aggregations (Active Filters)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Totals aggregated across all matching records from the server API. Within each commodity, positions share identical physical units and are safely summed.
          </p>
        </div>
        <span className="badge badge-info">{commodities.length} Commodities</span>
      </div>

      <div className="overflow-x-auto max-h-[580px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="py-3 px-4">Commodity</th>
              <th className="py-3 px-3">Trading Book</th>
              <th className="py-3 px-3 text-right">Trades</th>
              <th className="py-3 px-3 text-right">Net Position</th>
              <th className="py-3 px-3">Unit</th>
              <th className="py-3 px-3 text-right">Total P&L (USD)</th>
              <th className="py-3 px-3 text-right">FX Exposure (USD)</th>
              <th className="py-3 px-3 text-right">Avg Mark Price</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {commodities.map((row) => {
              const isPnlPositive = row.totalPnlUsd >= 0;
              return (
                <tr
                  key={row.commodity}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onDrillDownCommodity(row.commodity)}
                >
                  <td className="py-2.5 px-4 font-semibold text-slate-200">
                    {row.commodity}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="badge badge-secondary">{row.book}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {row.positionCount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-sky-300">
                    {formatNumber(row.netPosition, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {row.unit}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold ${
                      isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatUsd(row.totalPnlUsd)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-amber-300">
                    {formatUsd(row.totalFxExposureUsd)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {formatNumber(row.avgMarketPrice, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDrillDownCommodity(row.commodity);
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
