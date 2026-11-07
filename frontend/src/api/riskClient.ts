import {
  AggregationSummaryResponse,
  PagedQueryRequest,
  PagedResult,
  RiskFilterCriteria,
  RiskPosition,
  SavedView,
} from '../types/risk';

const API_BASE = '/api';

export const riskClient = {
  /**
   * Fetches paged risk positions using POST payload for precise multi-sort and filtering.
   */
  async getPositions(request: PagedQueryRequest): Promise<PagedResult<RiskPosition>> {
    const res = await fetch(`${API_BASE}/risk-positions/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch positions: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Fetches enterprise aggregations across all rows matching active filters.
   */
  async getAggregations(filters: RiskFilterCriteria): Promise<AggregationSummaryResponse> {
    const res = await fetch(`${API_BASE}/aggregations/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch aggregations: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Fetches single risk position by Trade ID for drilldown.
   */
  async getPositionById(tradeId: string): Promise<RiskPosition> {
    const res = await fetch(`${API_BASE}/risk-positions/${encodeURIComponent(tradeId)}`);
    if (!res.ok) {
      throw new Error(`Trade ${tradeId} not found`);
    }
    return res.json();
  },

  /**
   * Fetches distinct values for filter dropdown options.
   */
  async getDistinctValues(field: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/risk-positions/meta/distinct/${encodeURIComponent(field)}`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  /**
   * Gets preset and saved views.
   */
  async getSavedViews(): Promise<SavedView[]> {
    const res = await fetch(`${API_BASE}/views`);
    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  /**
   * Saves a new view preset.
   */
  async saveView(view: Omit<SavedView, 'id' | 'createdAtUtc'>): Promise<SavedView> {
    const res = await fetch(`${API_BASE}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(view),
    });

    if (!res.ok) {
      throw new Error(`Failed to save view: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Deletes a saved view.
   */
  async deleteView(id: string): Promise<void> {
    await fetch(`${API_BASE}/views/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
