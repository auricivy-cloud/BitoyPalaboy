import { DatePreset, DateRangeFilter, KPIStats, Product, Transaction } from '../types/pos';

// Formatting helpers
export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Convert Date to YYYY-MM-DD local format
export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate default date ranges based on anchor date (defaults to 2026-10-04)
export function getDateRangePreset(preset: DatePreset, anchorDateStr: string = '2026-10-04'): DateRangeFilter {
  const anchor = new Date(anchorDateStr + 'T12:00:00');

  switch (preset) {
    case 'today': {
      const todayStr = toISODateString(anchor);
      return {
        preset: 'today',
        startDate: todayStr,
        endDate: todayStr,
        label: 'Today',
        comparisonLabel: 'vs Yesterday',
      };
    }
    case 'yesterday': {
      const yesterday = new Date(anchor);
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = toISODateString(yesterday);
      return {
        preset: 'yesterday',
        startDate: yestStr,
        endDate: yestStr,
        label: 'Yesterday',
        comparisonLabel: 'vs Day Before',
      };
    }
    case 'last_7_days': {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 6);
      return {
        preset: 'last_7_days',
        startDate: toISODateString(start),
        endDate: toISODateString(anchor),
        label: 'Last 7 Days',
        comparisonLabel: 'vs Previous 7 Days',
      };
    }
    case 'this_month': {
      const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      return {
        preset: 'this_month',
        startDate: toISODateString(start),
        endDate: toISODateString(anchor),
        label: 'This Month (M-T-D)',
        comparisonLabel: 'vs Previous Period',
      };
    }
    case 'last_30_days': {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 29);
      return {
        preset: 'last_30_days',
        startDate: toISODateString(start),
        endDate: toISODateString(anchor),
        label: 'Last 30 Days',
        comparisonLabel: 'vs Previous 30 Days',
      };
    }
    case 'ytd': {
      const start = new Date(anchor.getFullYear(), 0, 1);
      return {
        preset: 'ytd',
        startDate: toISODateString(start),
        endDate: toISODateString(anchor),
        label: 'Year to Date',
        comparisonLabel: 'vs Prior Year',
      };
    }
    case 'custom':
    default: {
      const start = new Date(anchor);
      start.setDate(start.getDate() - 6);
      return {
        preset: 'custom',
        startDate: toISODateString(start),
        endDate: toISODateString(anchor),
        label: 'Custom Range',
        comparisonLabel: 'vs Prior Equivalent Period',
      };
    }
  }
}

// Compute the prior equivalent date window for comparisons
export function getPriorDateWindow(startDateStr: string, endDateStr: string): { priorStart: string; priorEnd: string } {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T23:59:59');

  const diffMs = end.getTime() - start.getTime();
  const dayCount = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const priorEnd = new Date(start);
  priorEnd.setDate(priorEnd.getDate() - 1);

  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - (dayCount - 1));

  return {
    priorStart: toISODateString(priorStart),
    priorEnd: toISODateString(priorEnd),
  };
}

// Filter transactions by date string range (inclusive)
export function filterTransactionsByDate(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter((t) => {
    // Check if status is completed (or include all valid)
    if (t.status === 'refunded') return false;
    const tDate = t.timestamp.slice(0, 10);
    return tDate >= startDate && tDate <= endDate;
  });
}

// Calculate the 5 Core Small Business KPIs
export function calculateKPIStats(
  transactions: Transaction[],
  products: Product[],
  dateFilter: DateRangeFilter
): KPIStats {
  const currentPeriodTxs = filterTransactionsByDate(transactions, dateFilter.startDate, dateFilter.endDate);

  const { priorStart, priorEnd } = getPriorDateWindow(dateFilter.startDate, dateFilter.endDate);
  const priorPeriodTxs = filterTransactionsByDate(transactions, priorStart, priorEnd);

  // 1. Total Net Revenue
  const totalRevenue = Number(currentPeriodTxs.reduce((sum, tx) => sum + tx.total, 0).toFixed(2));
  const priorRevenue = Number(priorPeriodTxs.reduce((sum, tx) => sum + tx.total, 0).toFixed(2));
  const revenueComparisonPercent = priorRevenue > 0
    ? ((totalRevenue - priorRevenue) / priorRevenue) * 100
    : (totalRevenue > 0 ? 100 : 0);

  // 2. Average Order Value (AOV)
  const transactionCount = currentPeriodTxs.length;
  const averageOrderValue = transactionCount > 0 ? Number((totalRevenue / transactionCount).toFixed(2)) : 0;
  const priorTransactionCount = priorPeriodTxs.length;
  const priorAov = priorTransactionCount > 0 ? Number((priorRevenue / priorTransactionCount).toFixed(2)) : 0;
  const aovComparisonPercent = priorAov > 0
    ? ((averageOrderValue - priorAov) / priorAov) * 100
    : 0;

  // 3. Transaction Volume
  const transactionComparisonPercent = priorTransactionCount > 0
    ? ((transactionCount - priorTransactionCount) / priorTransactionCount) * 100
    : (transactionCount > 0 ? 100 : 0);

  // 4. Gross Margin % & Profit (Revenue - COGS)
  const totalCogs = Number(currentPeriodTxs.reduce((sum, tx) => sum + tx.totalCost, 0).toFixed(2));
  const priorCogs = Number(priorPeriodTxs.reduce((sum, tx) => sum + tx.totalCost, 0).toFixed(2));
  const totalGrossProfit = Number((totalRevenue - totalCogs).toFixed(2));
  const priorGrossProfit = Number((priorRevenue - priorCogs).toFixed(2));

  const grossMarginPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const priorGrossMarginPercent = priorRevenue > 0 ? (priorGrossProfit / priorRevenue) * 100 : 0;
  const marginComparisonPercent = priorGrossMarginPercent > 0
    ? grossMarginPercent - priorGrossMarginPercent // percentage point shift
    : 0;

  // 5. Inventory Velocity & Units Sold
  const totalUnitsSold = currentPeriodTxs.reduce((sum, tx) => {
    return sum + tx.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  const priorUnitsSold = priorPeriodTxs.reduce((sum, tx) => {
    return sum + tx.items.reduce((iSum, item) => iSum + item.quantity, 0);
  }, 0);

  const unitsComparisonPercent = priorUnitsSold > 0
    ? ((totalUnitsSold - priorUnitsSold) / priorUnitsSold) * 100
    : 0;

  const lowStockItemsCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const inStockPercent = products.length > 0 ? (inStockCount / products.length) * 100 : 100;

  return {
    totalRevenue,
    revenueComparisonPercent,
    priorRevenue,
    averageOrderValue,
    aovComparisonPercent,
    priorAov,
    transactionCount,
    transactionComparisonPercent,
    priorTransactionCount,
    totalGrossProfit,
    grossMarginPercent,
    marginComparisonPercent,
    totalCogs,
    totalUnitsSold,
    unitsComparisonPercent,
    lowStockItemsCount,
    totalProductsCount: products.length,
    inStockPercent,
  };
}

// Chart aggregate breakdown: Sales over time (by hour if single day, or by day if multiple days)
export interface SalesChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export function getSalesTrendData(
  transactions: Transaction[],
  dateFilter: DateRangeFilter
): { isHourly: boolean; data: SalesChartDataPoint[] } {
  const filtered = filterTransactionsByDate(transactions, dateFilter.startDate, dateFilter.endDate);
  const isSingleDay = dateFilter.startDate === dateFilter.endDate;

  if (isSingleDay) {
    // 6 AM to 8 PM hourly breakdown
    const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const data: SalesChartDataPoint[] = hours.map((hour) => {
      const label = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
      const hourTxs = filtered.filter((t) => {
        const d = new Date(t.timestamp);
        return d.getHours() === hour;
      });
      const revenue = Number(hourTxs.reduce((sum, t) => sum + t.total, 0).toFixed(2));
      return {
        label,
        revenue,
        orders: hourTxs.length,
      };
    });
    return { isHourly: true, data };
  } else {
    // Daily breakdown across the selected range
    const start = new Date(dateFilter.startDate + 'T00:00:00');
    const end = new Date(dateFilter.endDate + 'T23:59:59');
    const data: SalesChartDataPoint[] = [];

    const curr = new Date(start);
    while (curr <= end) {
      const dateStr = toISODateString(curr);
      const dayLabel = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayTxs = filtered.filter((t) => t.timestamp.slice(0, 10) === dateStr);
      const revenue = Number(dayTxs.reduce((sum, t) => sum + t.total, 0).toFixed(2));
      data.push({
        label: dayLabel,
        revenue,
        orders: dayTxs.length,
      });
      curr.setDate(curr.getDate() + 1);
    }
    return { isHourly: false, data };
  }
}

// Top Selling Products in date window
export interface TopProductMetric {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
}

export function getTopSellingProducts(
  transactions: Transaction[],
  dateFilter: DateRangeFilter,
  limit: number = 5
): TopProductMetric[] {
  const filtered = filterTransactionsByDate(transactions, dateFilter.startDate, dateFilter.endDate);
  const map: Record<string, TopProductMetric> = {};

  filtered.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!map[item.product.id]) {
        map[item.product.id] = {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category,
          quantitySold: 0,
          totalRevenue: 0,
        };
      }
      map[item.product.id].quantitySold += item.quantity;
      map[item.product.id].totalRevenue = Number(
        (map[item.product.id].totalRevenue + item.totalPrice).toFixed(2)
      );
    });
  });

  return Object.values(map)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

// Category sales breakdown
export interface CategorySalesMetric {
  category: string;
  label: string;
  revenue: number;
  units: number;
  sharePercent: number;
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  dateFilter: DateRangeFilter
): CategorySalesMetric[] {
  const filtered = filterTransactionsByDate(transactions, dateFilter.startDate, dateFilter.endDate);
  const totalRevenue = filtered.reduce((sum, t) => sum + t.total, 0);

  const categoryLabels: Record<string, string> = {
    coffee: 'Coffee & Espresso',
    bakery: 'Artisan Bakery',
    breakfast: 'Sandwiches & Breakfast',
    cold_drinks: 'Teas & Cold Brews',
    retail: 'Retail Beans & Merch',
  };

  const agg: Record<string, { revenue: number; units: number }> = {
    coffee: { revenue: 0, units: 0 },
    bakery: { revenue: 0, units: 0 },
    breakfast: { revenue: 0, units: 0 },
    cold_drinks: { revenue: 0, units: 0 },
    retail: { revenue: 0, units: 0 },
  };

  filtered.forEach((tx) => {
    tx.items.forEach((item) => {
      const cat = item.product.category || 'coffee';
      if (!agg[cat]) {
        agg[cat] = { revenue: 0, units: 0 };
      }
      agg[cat].revenue += item.totalPrice;
      agg[cat].units += item.quantity;
    });
  });

  return Object.entries(agg).map(([category, val]) => ({
    category,
    label: categoryLabels[category] || category,
    revenue: Number(val.revenue.toFixed(2)),
    units: val.units,
    sharePercent: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
  })).sort((a, b) => b.revenue - a.revenue);
}
