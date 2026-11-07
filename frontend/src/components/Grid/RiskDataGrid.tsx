import React, { useMemo, useCallback, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  IDatasource,
  IGetRowsParams,
  RowClickedEvent,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { RiskFilterCriteria, RiskPosition, SortCriteria } from '../../types/risk';
import { riskClient } from '../../api/riskClient';
import { formatNumber, formatUsd } from './formatters';
import { Download, RotateCcw, Columns3 } from 'lucide-react';

const COLUMN_STATE_STORAGE_KEY = 'crr_grid_column_state';

interface RiskDataGridProps {
  filters: RiskFilterCriteria;
  onSelectPosition: (position: RiskPosition) => void;
  onGridReadyNotify?: (api: GridApi) => void;
}

export const RiskDataGrid: React.FC<RiskDataGridProps> = ({
  filters,
  onSelectPosition,
  onGridReadyNotify,
}) => {
  const gridApiRef = useRef<GridApi | null>(null);
  const [columnStateSaved, setColumnStateSaved] = useState(false);

  const columnDefs = useMemo<ColDef[]>(() => {
    const defs: ColDef[] = [
      {
        field: 'tradeId',
        headerName: 'Trade ID',
        pinned: 'left',
        width: 130,
        sortable: true,
        cellRenderer: (params: any) => (
          <span className="font-mono font-medium text-sky-400 hover:underline cursor-pointer">
            {params.value}
          </span>
        ),
      },
      {
        field: 'book',
        headerName: 'Trading Book',
        width: 130,
        sortable: true,
        cellRenderer: (params: any) => {
          const val = params.value;
          let badgeClass = 'badge-secondary';
          if (val === 'Ferrous') badgeClass = 'badge-ferrous';
          else if (val === 'Non-Ferrous') badgeClass = 'badge-nonferrous';
          else if (val === 'Ags') badgeClass = 'badge-ags';
          else if (val === 'Freight') badgeClass = 'badge-freight';

          return <span className={`badge ${badgeClass}`}>{val}</span>;
        },
      },
      {
        field: 'commodity',
        headerName: 'Commodity',
        width: 140,
        sortable: true,
        cellClass: 'font-semibold text-slate-100',
      },
      {
        field: 'counterparty',
        headerName: 'Counterparty',
        minWidth: 190,
        flex: 1,
        sortable: true,
      },
      {
        field: 'region',
        headerName: 'Region',
        width: 100,
        sortable: true,
        cellRenderer: (params: any) => (
          <span className="badge badge-region">{params.value}</span>
        ),
      },
      {
        field: 'instrumentType',
        headerName: 'Instrument',
        width: 120,
        sortable: true,
        cellRenderer: (params: any) => {
          const val = params.value;
          let cls = 'badge-instrument';
          if (val === 'Future') cls = 'badge-future';
          if (val === 'Swap') cls = 'badge-swap';
          return <span className={`badge ${cls}`}>{val}</span>;
        },
      },
      {
        field: 'position',
        headerName: 'Position (Qty)',
        width: 140,
        sortable: true,
        type: 'numericColumn',
        valueFormatter: (params: any) => formatNumber(params.value, 1),
        cellRenderer: (params: any) => {
          const v = params.value ?? 0;
          return (
            <span className={`font-mono font-medium ${v < 0 ? 'text-rose-400' : 'text-sky-300'}`}>
              {formatNumber(v, 1)}
            </span>
          );
        },
      },
      {
        field: 'commodityUnit',
        headerName: 'Unit',
        width: 140,
        cellClass: 'text-slate-400 text-xs',
      },
      {
        field: 'marketPrice',
        headerName: 'Mark Price',
        width: 120,
        sortable: true,
        type: 'numericColumn',
        cellClass: 'font-mono text-slate-200',
        valueFormatter: (params: any) => formatNumber(params.value, 2),
      },
      {
        field: 'currency',
        headerName: 'CCY',
        width: 85,
        sortable: true,
        cellClass: 'font-bold text-slate-300',
      },
      {
        field: 'pnl',
        headerName: 'P&L (USD)',
        width: 150,
        sortable: true,
        type: 'numericColumn',
        cellRenderer: (params: any) => {
          const v = params.value ?? 0;
          return (
            <span className={`font-mono font-bold ${v > 0 ? 'text-emerald-400' : v < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {formatUsd(v)}
            </span>
          );
        },
      },
      {
        field: 'fxExposure',
        headerName: 'FX Exposure (USD)',
        width: 155,
        sortable: true,
        type: 'numericColumn',
        cellRenderer: (params: any) => {
          const v = params.value ?? 0;
          return (
            <span className={`font-mono font-semibold ${v > 0 ? 'text-amber-300' : v < 0 ? 'text-orange-400' : 'text-slate-400'}`}>
              {formatUsd(v)}
            </span>
          );
        },
      },
      {
        field: 'asOfDate',
        headerName: 'As Of Date',
        width: 120,
        sortable: true,
        cellClass: 'font-mono text-slate-400 text-xs',
      },
    ];
    return defs;
  }, []);

  const datasource = useMemo<IDatasource>(() => {
    return {
      getRows: async (params: IGetRowsParams) => {
        try {
          const sorts: SortCriteria[] = (params.sortModel || []).map((s) => ({
            field: s.colId,
            direction: s.sort as 'asc' | 'desc',
          }));

          const queryPayload = {
            ...filters,
            startRow: params.startRow,
            endRow: params.endRow,
            sorts,
          };

          const response = await riskClient.getPositions(queryPayload);
          params.successCallback(response.rows, response.totalCount);
        } catch (err) {
          console.error('Error fetching rows for AG Grid:', err);
          params.failCallback();
        }
      },
    };
  }, [filters]);

  const saveColumnState = useCallback(() => {
    if (gridApiRef.current) {
      const state = gridApiRef.current.getColumnState();
      try {
        localStorage.setItem(COLUMN_STATE_STORAGE_KEY, JSON.stringify(state));
        setColumnStateSaved(true);
        setTimeout(() => setColumnStateSaved(false), 2000);
      } catch (err) {
        console.warn('Failed to save column state to localStorage', err);
      }
    }
  }, []);

  const resetColumnState = useCallback(() => {
    if (gridApiRef.current) {
      gridApiRef.current.resetColumnState();
      localStorage.removeItem(COLUMN_STATE_STORAGE_KEY);
    }
  }, []);

  const exportCsv = useCallback(() => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({
        fileName: `risk_positions_export_${new Date().toISOString().slice(0, 10)}.csv`,
      });
    }
  }, []);

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      gridApiRef.current = event.api;
      event.api.setGridOption('datasource', datasource);

      // Restore column state if previously saved
      try {
        const saved = localStorage.getItem(COLUMN_STATE_STORAGE_KEY);
        if (saved) {
          const state = JSON.parse(saved);
          event.api.applyColumnState({ state, applyOrder: true });
        }
      } catch (err) {
        console.warn('Could not restore column state:', err);
      }

      if (onGridReadyNotify) {
        onGridReadyNotify(event.api);
      }
    },
    [datasource, onGridReadyNotify]
  );

  const handleRowClick = useCallback(
    (event: RowClickedEvent<RiskPosition>) => {
      if (event.data) {
        onSelectPosition(event.data);
      }
    },
    [onSelectPosition]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Grid Toolbar: Column Persistence & Export */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <Columns3 className="w-3.5 h-3.5 text-sky-400" />
          <span>Interactive Grid · Drag columns to reorder, drag edges to resize</span>
          {columnStateSaved && (
            <span className="badge bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
              Layout Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetColumnState}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            title="Reset columns to default width and order"
          >
            <RotateCcw className="w-3 h-3" /> Reset Columns
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            title="Export currently loaded grid data as CSV"
          >
            <Download className="w-3 h-3 text-sky-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* AG Grid Container */}
      <div className="ag-theme-quartz-dark w-full h-[600px] rounded-lg shadow-xl overflow-hidden border border-slate-800">
        <AgGridReact<RiskPosition>
          columnDefs={columnDefs}
          rowModelType="infinite"
          datasource={datasource}
          cacheBlockSize={100}
          maxBlocksInCache={20}
          infiniteInitialRowCount={100}
          rowHeight={38}
          headerHeight={40}
          animateRows={true}
          onGridReady={onGridReady}
          onRowClicked={handleRowClick}
          onColumnMoved={saveColumnState}
          onColumnResized={saveColumnState}
          onColumnPinned={saveColumnState}
          suppressCellFocus={false}
          enableCellTextSelection={true}
        />
      </div>
    </div>
  );
};
