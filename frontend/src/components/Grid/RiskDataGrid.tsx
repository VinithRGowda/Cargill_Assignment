import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  RowClickedEvent,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { RiskFilterCriteria, RiskPosition, SortCriteria } from '../../types/risk';
import { riskClient } from '../../api/riskClient';
import { formatNumber, formatUsd } from './formatters';

interface RiskDataGridProps {
  filters: RiskFilterCriteria;
  onSelectPosition: (position: RiskPosition) => void;
  onGridReadyNotify?: (api: any) => void;
}

export const RiskDataGrid: React.FC<RiskDataGridProps> = ({
  filters,
  onSelectPosition,
  onGridReadyNotify,
}) => {
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

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      event.api.setGridOption('datasource', datasource);
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
    <div className="ag-theme-quartz-dark w-full h-[620px] rounded-lg shadow-xl overflow-hidden border border-slate-800">
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
        suppressCellFocus={false}
        enableCellTextSelection={true}
      />
    </div>
  );
};
