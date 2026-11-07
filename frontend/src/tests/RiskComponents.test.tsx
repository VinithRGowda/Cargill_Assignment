import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskKpiCards } from '../components/KpiCards/RiskKpiCards';
import { CommodityGroupTable } from '../components/GroupingView/CommodityGroupTable';
import { BookGroupTable } from '../components/GroupingView/BookGroupTable';
import { RiskMetricsSummary, CommodityAggregation, BookAggregation } from '../types/risk';

describe('Risk Components', () => {
  const mockSummary: RiskMetricsSummary = {
    totalPositions: 50000,
    totalPnlUsd: 1250000.5,
    totalFxExposureUsd: -450000.25,
    netExposureUsd: 800000.25,
    maxPnlUsd: 150000,
    minPnlUsd: -95000,
    profitableTradesCount: 26000,
    lossMakingTradesCount: 24000,
    winRatePercentage: 52.0,
  };

  it('renders KPI summary cards with formatted metrics', () => {
    render(<RiskKpiCards summary={mockSummary} loading={false} />);

    expect(screen.getByText('Active Positions')).toBeDefined();
    expect(screen.getByText('50,000')).toBeDefined();
    expect(screen.getByText('Enterprise P&L')).toBeDefined();
    expect(screen.getByText('FX Exposure')).toBeDefined();
    expect(screen.getByText('52%')).toBeDefined();
  });

  it('renders Commodity group table and invokes drilldown on click', () => {
    const mockCommodities: CommodityAggregation[] = [
      {
        commodity: 'Copper',
        book: 'Non-Ferrous',
        unit: 'Metric Tons (MT)',
        positionCount: 1200,
        netPosition: 4500.5,
        totalPnlUsd: 850000,
        totalFxExposureUsd: 120000,
        avgMarketPrice: 9500.25,
      },
    ];

    const onDrillDown = vi.fn();
    render(
      <CommodityGroupTable
        commodities={mockCommodities}
        onDrillDownCommodity={onDrillDown}
      />
    );

    expect(screen.getByText('Copper')).toBeDefined();
    expect(screen.getByText('Non-Ferrous')).toBeDefined();
    expect(screen.getByText('Metric Tons (MT)')).toBeDefined();

    const drillBtn = screen.getByRole('button', { name: /drilldown/i });
    fireEvent.click(drillBtn);
    expect(onDrillDown).toHaveBeenCalledWith('Copper');
  });

  it('renders Book group table with unit disparity warning note', () => {
    const mockBooks: BookAggregation[] = [
      {
        book: 'Ferrous',
        positionCount: 14000,
        totalPnlUsd: 3200000,
        totalFxExposureUsd: -150000,
        avgPnlUsd: 228.57,
        unitNote: 'Position quantities cannot be aggregated across distinct commodities.',
      },
    ];

    const onDrillDown = vi.fn();
    render(<BookGroupTable books={mockBooks} onDrillDownBook={onDrillDown} />);

    expect(screen.getByText('Ferrous')).toBeDefined();
    expect(screen.getByText(/Risk Note on Quantities/i)).toBeDefined();
  });
});
