import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Receipt,
  PieChart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { DateRangeFilter, Product, StoreSettings, Transaction } from '../types/pos';
import {
  calculateKPIStats,
  formatCurrency,
  formatPercent,
  getCategoryBreakdown,
  getSalesTrendData,
  getTopSellingProducts,
} from '../utils/kpiCalculator';
import { DateRangePicker } from './DateRangePicker';

interface KPIDashboardProps {
  transactions: Transaction[];
  products: Product[];
  settings: StoreSettings;
  dateFilter: DateRangeFilter;
  onDateFilterChange: (filter: DateRangeFilter) => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  transactions,
  products,
  settings,
  dateFilter,
  onDateFilterChange,
}) => {
  const kpis = calculateKPIStats(transactions, products, dateFilter);
  const trend = getSalesTrendData(transactions, dateFilter);
  const topProducts = getTopSellingProducts(transactions, dateFilter, 5);
  const categories = getCategoryBreakdown(transactions, dateFilter);

  // Maximum revenue in trend data for scaling bars
  const maxTrendRevenue = Math.max(1, ...trend.data.map((d) => d.revenue));

  // Export CSV summary of current filtered period
  const handleExportCSV = () => {
    let csv = 'Metric,Value,Comparison\n';
    csv += `Total Net Revenue,${kpis.totalRevenue.toFixed(2)},${formatPercent(kpis.revenueComparisonPercent)}\n`;
    csv += `Average Order Value,${kpis.averageOrderValue.toFixed(2)},${formatPercent(kpis.aovComparisonPercent)}\n`;
    csv += `Transaction Count,${kpis.transactionCount},${formatPercent(kpis.transactionComparisonPercent)}\n`;
    csv += `Gross Margin %,${kpis.grossMarginPercent.toFixed(1)}%,${formatPercent(kpis.marginComparisonPercent)}\n`;
    csv += `Gross Profit $,${kpis.totalGrossProfit.toFixed(2)},-\n`;
    csv += `Cost of Goods Sold (COGS),${kpis.totalCogs.toFixed(2)},-\n`;
    csv += `Units Sold,${kpis.totalUnitsSold},${formatPercent(kpis.unitsComparisonPercent)}\n\n`;

    csv += 'Top Products,Category,Units Sold,Revenue\n';
    topProducts.forEach((p) => {
      csv += `"${p.name}",${p.category},${p.quantitySold},${p.totalRevenue.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POS-KPI-Report-${dateFilter.startDate}-to-${dateFilter.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Date Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Store Performance Console</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400">5 Essential KPIs</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-100 tracking-tight mt-1">
            Executive Business Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time margin, throughput, and revenue insights for small business operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Requested Date Range Picker Component */}
          <DateRangePicker
            currentFilter={dateFilter}
            onChange={onDateFilterChange}
          />

          {/* Export Report Action */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors whitespace-nowrap"
            title="Download CSV performance report"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* THE 5 CORE SMALL BUSINESS KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: TOTAL NET REVENUE */}
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-neutral-400">1. Net Revenue</span>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-100 font-mono tracking-tight tabular-nums">
              {formatCurrency(kpis.totalRevenue, settings.currencySymbol)}
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
              {kpis.revenueComparisonPercent >= 0 ? (
                <span className="flex items-center text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.revenueComparisonPercent)}
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.revenueComparisonPercent)}
                </span>
              )}
              <span className="text-neutral-500 text-[11px] truncate">
                {dateFilter.comparisonLabel}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex justify-between font-mono">
            <span>Prior: {formatCurrency(kpis.priorRevenue, settings.currencySymbol)}</span>
            <span className="text-neutral-500">Gross Sales</span>
          </div>
        </div>

        {/* KPI 2: AVERAGE ORDER VALUE (AOV) */}
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-neutral-400">2. Avg Order Value</span>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-100 font-mono tracking-tight tabular-nums">
              {formatCurrency(kpis.averageOrderValue, settings.currencySymbol)}
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
              {kpis.aovComparisonPercent >= 0 ? (
                <span className="flex items-center text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.aovComparisonPercent)}
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.aovComparisonPercent)}
                </span>
              )}
              <span className="text-neutral-500 text-[11px] truncate">
                {dateFilter.comparisonLabel}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex justify-between font-mono">
            <span>Basket Size</span>
            <span className="text-neutral-300">
              {kpis.transactionCount > 0 ? (kpis.totalUnitsSold / kpis.transactionCount).toFixed(1) : '0'} items/tx
            </span>
          </div>
        </div>

        {/* KPI 3: TRANSACTION VOLUME */}
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-neutral-400">3. Transactions</span>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Receipt className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-100 font-mono tracking-tight tabular-nums">
              {kpis.transactionCount}
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
              {kpis.transactionComparisonPercent >= 0 ? (
                <span className="flex items-center text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.transactionComparisonPercent)}
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.transactionComparisonPercent)}
                </span>
              )}
              <span className="text-neutral-500 text-[11px] truncate">
                {dateFilter.comparisonLabel}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex justify-between font-mono">
            <span>Prior Vol</span>
            <span className="text-neutral-300">{kpis.priorTransactionCount} orders</span>
          </div>
        </div>

        {/* KPI 4: GROSS MARGIN % & PROFIT */}
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-neutral-400">4. Gross Margin</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <PieChart className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight tabular-nums">
              {kpis.grossMarginPercent.toFixed(1)}%
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
              <span className="text-neutral-300 font-medium">
                {formatCurrency(kpis.totalGrossProfit, settings.currencySymbol)}
              </span>
              <span className="text-neutral-500 text-[11px]">Gross Profit</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex justify-between font-mono">
            <span>COGS:</span>
            <span className="text-neutral-300">{formatCurrency(kpis.totalCogs, settings.currencySymbol)}</span>
          </div>
        </div>

        {/* KPI 5: INVENTORY VELOCITY & UNITS SOLD */}
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-neutral-400">5. Inventory Velocity</span>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Package className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-100 font-mono tracking-tight tabular-nums">
              {kpis.totalUnitsSold} <span className="text-xs font-normal text-neutral-400">units</span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
              {kpis.unitsComparisonPercent >= 0 ? (
                <span className="flex items-center text-emerald-400 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.unitsComparisonPercent)}
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {formatPercent(kpis.unitsComparisonPercent)}
                </span>
              )}
              <span className="text-neutral-500 text-[11px] truncate">
                {dateFilter.comparisonLabel}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex justify-between font-mono">
            <span>Low Stock:</span>
            <span className={`font-semibold ${kpis.lowStockItemsCount > 0 ? 'text-amber-400' : 'text-neutral-300'}`}>
              {kpis.lowStockItemsCount} items
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS & DRILLDOWN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Distribution Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">
                {trend.isHourly ? 'Hourly Sales Velocity (Today)' : `Daily Revenue Trend (${dateFilter.label})`}
              </h3>
              <p className="text-xs text-neutral-400">
                {trend.isHourly
                  ? 'Customer ordering throughput by hour of operation'
                  : 'Daily total receipts and order volume across selected window'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-sm" />
              <span>Revenue ({settings.currencySymbol})</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          {trend.data.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-neutral-500">
              No transactions recorded in this date range.
            </div>
          ) : (
            <div className="h-56 flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-neutral-800">
              {trend.data.map((dp, idx) => {
                const heightPercent = maxTrendRevenue > 0 ? Math.max(4, (dp.revenue / maxTrendRevenue) * 100) : 4;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-10 z-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-[11px] font-mono whitespace-nowrap shadow-lg transition-opacity">
                      <div className="font-semibold text-neutral-100">
                        {formatCurrency(dp.revenue, settings.currencySymbol)}
                      </div>
                      <div className="text-[10px] text-neutral-400">{dp.orders} orders ({dp.label})</div>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 rounded-t-sm transition-all duration-300"
                    />

                    {/* X-axis label */}
                    <span className="text-[10px] text-neutral-500 font-mono truncate w-full text-center group-hover:text-neutral-300">
                      {dp.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chart footer insights */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400 pt-1">
            <span>Window Total: {formatCurrency(kpis.totalRevenue, settings.currencySymbol)}</span>
            <span>Peak Window Output: {formatCurrency(maxTrendRevenue, settings.currencySymbol)}</span>
          </div>
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Sales by Category</h3>
            <Layers className="w-4 h-4 text-neutral-500" />
          </div>

          <div className="space-y-3 pt-1">
            {categories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300">{cat.label}</span>
                  <span className="font-mono text-neutral-200 tabular-nums font-semibold">
                    {formatCurrency(cat.revenue, settings.currencySymbol)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${cat.sharePercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 tabular-nums w-10 text-right">
                    {cat.sharePercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-xs text-neutral-500 text-center py-8">
                No categorical sales recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS & INVENTORY HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products Table (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">
                Top 5 Bestsellers ({dateFilter.label})
              </h3>
              <p className="text-xs text-neutral-400">
                Highest grossing menu items and retail merchandise.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">Ranked by Gross Revenue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                  <th className="pb-2.5 font-medium">Rank & Product</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium text-right">Units Sold</th>
                  <th className="pb-2.5 font-medium text-right">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {topProducts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 flex items-center gap-2 text-neutral-200 font-sans font-medium">
                      <span className="w-5 text-neutral-500 font-mono text-[11px]">#{idx + 1}</span>
                      <span>{p.name}</span>
                    </td>
                    <td className="py-2.5 text-neutral-400 capitalize">{p.category}</td>
                    <td className="py-2.5 text-right text-neutral-200 tabular-nums">
                      {p.quantitySold}
                    </td>
                    <td className="py-2.5 text-right text-amber-400 font-semibold tabular-nums">
                      {formatCurrency(p.totalRevenue, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}

                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-500">
                      No product sales recorded in selected timeframe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Small Business Stock Health Watchlist (1 col) */}
        <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Inventory Health Alerts</h3>
            {kpis.lowStockItemsCount > 0 ? (
              <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{kpis.lowStockItemsCount} Low</span>
              </div>
            ) : (
              <span className="text-xs text-emerald-400 font-medium">All Nominal</span>
            )}
          </div>

          <div className="space-y-2.5 pt-1">
            {products
              .filter((p) => p.stock <= p.lowStockThreshold)
              .slice(0, 4)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 bg-neutral-950/60 border border-neutral-800 rounded-lg text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="text-neutral-200 font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">SKU: {p.sku}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <div className="text-amber-400 font-bold tabular-nums">
                      {p.stock} left
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Min: {p.lowStockThreshold}
                    </div>
                  </div>
                </div>
              ))}

            {kpis.lowStockItemsCount === 0 && (
              <div className="text-center py-8 text-neutral-500 text-xs">
                No items currently below reorder thresholds.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
