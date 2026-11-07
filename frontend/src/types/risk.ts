export interface RiskPosition {
  tradeId: string;
  book: string;
  commodity: string;
  counterparty: string;
  region: string;
  instrumentType: string;
  position: number;
  currency: string;
  marketPrice: number;
  pnl: number;
  fxExposure: number;
  asOfDate: string;
  commodityUnit: string;
}

export interface RiskFilterCriteria {
  search?: string;
  book?: string;
  commodity?: string;
  counterparty?: string;
  region?: string;
  instrumentType?: string;
  currency?: string;
  minPnl?: number;
  maxPnl?: number;
  minPosition?: number;
  maxPosition?: number;
  asOfDateFrom?: string;
  asOfDateTo?: string;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PagedQueryRequest extends RiskFilterCriteria {
  startRow?: number;
  endRow?: number;
  page?: number;
  pageSize?: number;
  sorts?: SortCriteria[];
}

export interface PagedResult<T> {
  rows: T[];
  totalCount: number;
  startRow: number;
  endRow: number;
}

export interface RiskMetricsSummary {
  totalPositions: number;
  totalPnlUsd: number;
  totalFxExposureUsd: number;
  netExposureUsd: number;
  maxPnlUsd: number;
  minPnlUsd: number;
  profitableTradesCount: number;
  lossMakingTradesCount: number;
  winRatePercentage: number;
}

export interface BookAggregation {
  book: string;
  positionCount: number;
  totalPnlUsd: number;
  totalFxExposureUsd: number;
  avgPnlUsd: number;
  unitNote: string;
}

export interface CommodityAggregation {
  commodity: string;
  book: string;
  unit: string;
  positionCount: number;
  netPosition: number;
  totalPnlUsd: number;
  totalFxExposureUsd: number;
  avgMarketPrice: number;
}

export interface RegionAggregation {
  region: string;
  positionCount: number;
  totalPnlUsd: number;
  totalFxExposureUsd: number;
}

export interface CounterpartyRiskAggregation {
  counterparty: string;
  positionCount: number;
  totalPnlUsd: number;
  totalFxExposureUsd: number;
  absoluteRiskExposureUsd: number;
}

export interface AggregationSummaryResponse {
  summary: RiskMetricsSummary;
  byBook: BookAggregation[];
  byCommodity: CommodityAggregation[];
  byRegion: RegionAggregation[];
  topCounterparties: CounterpartyRiskAggregation[];
}

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: RiskFilterCriteria;
  sorts: SortCriteria[];
  groupBy?: 'book' | 'commodity' | 'region';
  createdAtUtc?: string;
}

