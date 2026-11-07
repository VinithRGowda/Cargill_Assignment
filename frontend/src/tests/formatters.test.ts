import { describe, it, expect } from 'vitest';
import { formatUsd, formatCompactUsd, formatNumber, getPnlColorClass } from '../components/Grid/formatters';

describe('formatters', () => {
  it('formats USD currency correctly', () => {
    expect(formatUsd(1234.56)).toBe('$1,234.56');
    expect(formatUsd(-500.25)).toBe('-$500.25');
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(null)).toBe('$0.00');
  });

  it('formats compact USD numbers correctly', () => {
    expect(formatCompactUsd(1500000)).toMatch(/\$1\.5M/);
    expect(formatCompactUsd(-250000)).toMatch(/-\$250(\.0)?K/);
  });

  it('formats numbers with custom decimals', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
    expect(formatNumber(45.1, 1)).toBe('45.1');
    expect(formatNumber(null)).toBe('0');
  });

  it('returns appropriate color class based on sign', () => {
    expect(getPnlColorClass(100)).toContain('emerald');
    expect(getPnlColorClass(-50)).toContain('rose');
    expect(getPnlColorClass(0)).toContain('slate');
  });
});
