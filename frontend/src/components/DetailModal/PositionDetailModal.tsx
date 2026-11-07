import React from 'react';
import { X, ShieldCheck, AlertCircle, FileText, Globe, Landmark, Layers } from 'lucide-react';
import { RiskPosition } from '../../types/risk';
import { formatNumber, formatUsd } from '../Grid/formatters';

interface PositionDetailModalProps {
  position: RiskPosition | null;
  onClose: () => void;
}

export const PositionDetailModal: React.FC<PositionDetailModalProps> = ({
  position,
  onClose,
}) => {
  if (!position) return null;

  const isPnlPositive = position.pnl >= 0;
  const isFxPositive = position.fxExposure >= 0;
  const notionalEstimate = Math.abs(position.position * position.marketPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-sky-400">
                {position.tradeId}
              </span>
              <span className="badge badge-secondary">{position.book}</span>
              <span className="badge badge-region">{position.region}</span>
              <span className="badge badge-instrument">{position.instrumentType}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Valuation As-Of: <span className="font-mono text-slate-300">{position.asOfDate}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PnL & Exposure Banner */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div
            className={`p-3.5 rounded-lg border ${
              isPnlPositive
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1.5">
              {isPnlPositive ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              Mark-to-Market P&L
            </div>
            <div className="text-2xl font-bold font-mono mt-1">
              {formatUsd(position.pnl)}
            </div>
            <div className="text-[11px] opacity-75 mt-0.5">
              Valued in USD base reporting currency
            </div>
          </div>

          <div className="p-3.5 rounded-lg border bg-slate-950/70 border-slate-800 text-slate-200">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              FX Exposure
            </div>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                isFxPositive ? 'text-amber-300' : 'text-orange-400'
              }`}
            >
              {formatUsd(position.fxExposure)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Settlement Currency: {position.currency}
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="bg-slate-950/80 rounded-lg border border-slate-800 p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <span className="text-slate-400 block mb-0.5">Counterparty</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-slate-400" />
                {position.counterparty}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Commodity Underlying</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                {position.commodity}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Signed Position (Quantity)</span>
              <span className="font-mono font-bold text-sky-300 text-sm">
                {formatNumber(position.position, 1)}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {position.commodityUnit}
                </span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Mark Market Price</span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {formatNumber(position.marketPrice, 2)}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {position.currency}
                </span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Estimated Gross Notional</span>
              <span className="font-mono text-slate-300">
                {formatNumber(notionalEstimate, 2)} {position.currency}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Instrument Contract</span>
              <span className="text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {position.instrumentType} Contract ({position.currency})
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise CRR Risk Audit Ref: {position.tradeId}-REV-2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

