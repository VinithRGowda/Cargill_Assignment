import React from 'react';
import { BookAggregation } from '../../types/risk';
import { formatUsd } from '../Grid/formatters';
import { ExternalLink, Briefcase, AlertTriangle } from 'lucide-react';

interface BookGroupTableProps {
  books: BookAggregation[];
  onDrillDownBook: (book: string) => void;
}

export const BookGroupTable: React.FC<BookGroupTableProps> = ({ books, onDrillDownBook }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sky-400" />
            Trading Desk Risk Aggregations (Active Filters)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated exposure across enterprise trading books matching the active filter criteria.
          </p>
        </div>
        <span className="badge badge-info">{books.length} Books</span>
      </div>

      {/* Domain Knowledge Banner regarding commodity unit differences */}
      <div className="bg-amber-950/40 border-b border-amber-900/60 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Risk Note on Quantities:</strong> Physical measurement units vary across commodities (Metric Tons, Charter Vessel Days, Bushels). Cross-commodity position summation is omitted to prevent invalid comparisons. Explore the <em>Commodity Risk</em> tab to inspect homogeneous quantities.
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Trading Book</th>
              <th className="py-3 px-4 text-right">Active Trades</th>
              <th className="py-3 px-4 text-right">Total P&L (USD)</th>
              <th className="py-3 px-4 text-right">FX Exposure (USD)</th>
              <th className="py-3 px-4 text-right">Avg P&L / Trade</th>
              <th className="py-3 px-4">Net Position Policy</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-sans">
            {books.map((row) => {
              const isPnlPositive = row.totalPnlUsd >= 0;
              let badgeColor = 'badge-secondary';
              if (row.book === 'Ferrous') badgeColor = 'badge-ferrous';
              else if (row.book === 'Non-Ferrous') badgeColor = 'badge-nonferrous';
              else if (row.book === 'Ags') badgeColor = 'badge-ags';
              else if (row.book === 'Freight') badgeColor = 'badge-freight';

              return (
                <tr
                  key={row.book}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onDrillDownBook(row.book)}
                >
                  <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                    <span className={`badge ${badgeColor}`}>{row.book}</span>
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
                  <td
                    className={`py-3 px-4 text-right font-mono ${
                      row.avgPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatUsd(row.avgPnlUsd)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] italic">
                    {row.unitNote}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDrillDownBook(row.book);
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
