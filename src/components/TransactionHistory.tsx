import React, { useState } from 'react';
import {
  Search,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  ArrowUpDown,
  Download,
  Filter,
} from 'lucide-react';
import { PaymentMethod, StoreSettings, Transaction } from '../types/pos';
import { formatCurrency } from '../utils/kpiCalculator';

interface TransactionHistoryProps {
  transactions: Transaction[];
  settings: StoreSettings;
  onSelectTransactionForReceipt: (tx: Transaction) => void;
  onRefundTransaction: (txId: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  settings,
  onSelectTransactionForReceipt,
  onRefundTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = transactions.filter((t) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.receiptNumber.toLowerCase().includes(query) ||
      (t.customerName && t.customerName.toLowerCase().includes(query)) ||
      t.items.some((i) => i.product.name.toLowerCase().includes(query));

    const matchesMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const handleExportJournal = () => {
    let csv = 'Receipt #,Date,Time,Customer,Type,Payment,Subtotal,Discount,Tax,Total,Status\n';
    filtered.forEach((t) => {
      const d = new Date(t.timestamp);
      const dateStr = d.toLocaleDateString();
      const timeStr = d.toLocaleTimeString();
      csv += `"${t.receiptNumber}","${dateStr}","${timeStr}","${t.customerName || ''}","${t.orderType}","${t.paymentMethod}",${t.subtotal},${t.discountAmount},${t.taxAmount},${t.total},"${t.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sales-Ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight">
            Transactions & Receipt Journal
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit trail of completed sales, reprinted receipts, and customer tenders.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJournal}
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-neutral-400" />
          <span>Export Journal CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by receipt #, customer, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Payment filter */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200"
        >
          <option value="all">All Payment Methods</option>
          <option value="card">Credit / Debit Card</option>
          <option value="cash">Cash Tender</option>
          <option value="mobile">Apple / Google Pay</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-medium">Receipt #</th>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Customer / Type</th>
                <th className="py-3 px-4 font-medium">Items Breakdown</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium text-right">Total</th>
                <th className="py-3 px-4 font-medium text-center">Receipt & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filtered.map((tx) => {
                const isRefunded = tx.status === 'refunded';
                const dateObj = new Date(tx.timestamp);

                return (
                  <tr key={tx.id} className="hover:bg-neutral-800/40 transition-colors">
                    {/* Receipt No */}
                    <td className="py-3 px-4 font-semibold text-neutral-200">
                      {tx.receiptNumber}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-neutral-400 text-[11px]">
                      <div>{dateObj.toLocaleDateString()}</div>
                      <div className="text-neutral-500">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Customer & Order Type */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-medium text-neutral-200">{tx.customerName || 'Walk-in'}</div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                        {tx.orderType.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 font-sans text-neutral-300 max-w-xs truncate">
                      <span className="font-mono text-neutral-400 mr-1 font-semibold">
                        ({tx.items.reduce((s, i) => s + i.quantity, 0)} items)
                      </span>
                      <span>
                        {tx.items.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                      </span>
                    </td>

                    {/* Payment Tender */}
                    <td className="py-3 px-4 text-neutral-300 font-sans capitalize">
                      <div className="flex items-center gap-1.5">
                        {tx.paymentMethod === 'card' && <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                        {tx.paymentMethod === 'cash' && <Banknote className="w-3.5 h-3.5 text-emerald-400" />}
                        {tx.paymentMethod === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{tx.paymentMethod}</span>
                      </div>
                      {tx.tenderDetails.cardLast4 && (
                        <div className="text-[10px] font-mono text-neutral-500">
                          *{tx.tenderDetails.cardLast4}
                        </div>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right">
                      <div className={`font-bold tabular-nums text-sm ${isRefunded ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>
                        {formatCurrency(tx.total, settings.currencySymbol)}
                      </div>
                      {isRefunded && (
                        <span className="text-[10px] font-sans font-semibold text-rose-400">
                          Refunded
                        </span>
                      )}
                    </td>

                    {/* Actions: View Receipt / Print */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => onSelectTransactionForReceipt(tx)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
                          title="Print or view thermal receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Receipt</span>
                        </button>

                        {!isRefunded && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Issue refund for Receipt ${tx.receiptNumber} (${formatCurrency(tx.total, settings.currencySymbol)})?`)) {
                                onRefundTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors"
                            title="Issue Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 font-sans">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
