import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  X,
  User,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { CartItem, OrderType, PaymentMethod, StoreSettings, Transaction } from '../types/pos';
import { formatCurrency } from '../utils/kpiCalculator';
import { playRegisterChime } from '../utils/audio';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: OrderType;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  orderNote: string;
  settings: StoreSettings;
  onCompleteSale: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  orderType,
  discountType,
  discountValue,
  orderNote,
  settings,
  onCompleteSale,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerContact, setCustomerContact] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardLast4, setCardLast4] = useState<string>('4242');
  const [cardBrand, setCardBrand] = useState<string>('Visa');

  if (!isOpen) return null;

  // Financial calculations
  const subtotal = Number(cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  const totalCost = Number(
    cart.reduce((sum, item) => sum + item.product.cost * item.quantity, 0).toFixed(2)
  );

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Number(((subtotal * discountValue) / 100).toFixed(2));
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(subtotal, discountValue);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = settings.taxRatePercent / 100;
  const taxAmount = Number((taxableAmount * taxRate).toFixed(2));
  const total = Number((taxableAmount + taxAmount).toFixed(2));
  const grossProfit = Number((taxableAmount - totalCost).toFixed(2));

  // Cash change due
  const changeDue = Math.max(0, Number((cashTendered - total).toFixed(2)));
  const canCompleteCash = method === 'cash' ? cashTendered >= total : true;

  // Preset cash tender amounts configured for Philippine Peso or active currency
  const nextHundred = Math.ceil(total / 100) * 100;
  const nextFiveHundred = Math.ceil(total / 500) * 500;
  const nextThousand = Math.ceil(total / 1000) * 1000;

  const cashPresets = settings.currencySymbol === '₱' ? [
    { label: 'Exact', amount: total },
    { label: `₱${nextHundred}`, amount: nextHundred },
    { label: `₱${nextFiveHundred}`, amount: nextFiveHundred },
    { label: `₱${nextThousand}`, amount: nextThousand },
    { label: '₱500', amount: 500 },
    { label: '₱1,000', amount: 1000 },
  ].filter((p, idx, arr) => (p.amount >= total || p.label === 'Exact') && arr.findIndex(x => x.amount === p.amount) === idx)
  : [
    { label: 'Exact', amount: total },
    { label: `${settings.currencySymbol}20`, amount: 20 },
    { label: `${settings.currencySymbol}50`, amount: 50 },
    { label: `${settings.currencySymbol}100`, amount: 100 },
  ].filter((p) => p.amount >= total || p.label === 'Exact');

  const handleFinishCheckout = () => {
    if (!canCompleteCash) return;

    setIsProcessing(true);

    setTimeout(() => {
      if (settings.soundEnabled) {
        playRegisterChime();
      }

      const receiptSeq = Math.floor(1000 + Math.random() * 9000);
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${receiptSeq}`,
        receiptNumber: `BP-${receiptSeq}`,
        timestamp: new Date().toISOString(),
        items: [...cart],
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        taxRate,
        taxAmount,
        tipAmount: 0,
        total,
        totalCost,
        grossProfit,
        paymentMethod: method,
        tenderDetails: {
          method,
          amountTendered: method === 'cash' ? (cashTendered || total) : total,
          changeDue: method === 'cash' ? changeDue : 0,
          cardBrand: method === 'card' ? cardBrand : undefined,
          cardLast4: method === 'card' ? cardLast4 : undefined,
          authCode: method !== 'cash' ? `AUTH${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        },
        orderType,
        customerName: customerName.trim() || (orderType === 'dine_in' ? 'Table Guest' : 'Walk-in Guest'),
        customerContact: customerContact.trim() || undefined,
        cashierName: settings.cashierName,
        orderNote: orderNote.trim() || undefined,
        status: 'completed',
      };

      setIsProcessing(false);
      onCompleteSale(newTx);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <h3 className="text-base font-bold text-neutral-100">Complete Payment</h3>
            <p className="text-xs text-neutral-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} items · {orderType.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Total Display */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Amount Due
            </span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums mt-0.5">
              {formatCurrency(total, settings.currencySymbol)}
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-neutral-500 font-mono mt-1">
              <span>Subtotal: {formatCurrency(subtotal, settings.currencySymbol)}</span>
              {discountAmount > 0 && <span>Disc: -{formatCurrency(discountAmount, settings.currencySymbol)}</span>}
              <span>Tax: {formatCurrency(taxAmount, settings.currencySymbol)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Select Tender Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'card'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5" />
                <span>Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('cash');
                  if (cashTendered === 0) setCashTendered(total);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'cash'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1.5" />
                <span>Cash Tender</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mobile')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'mobile'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1.5" />
                <span>Apple / Google Pay</span>
              </button>
            </div>
          </div>

          {/* Method Specific Details */}
          {method === 'cash' && (
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-medium">Quick Cash Bills:</span>
                <span className="font-mono text-neutral-400">Total: {formatCurrency(total, settings.currencySymbol)}</span>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2">
                {cashPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashTendered(preset.amount)}
                    className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                      cashTendered === preset.amount
                        ? 'bg-amber-500 border-amber-400 text-neutral-950'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Cash Tender Input */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Cash Tendered ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={total}
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    placeholder={total.toFixed(2)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Change Due</label>
                  <div className={`px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm font-mono font-bold ${changeDue > 0 ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {formatCurrency(changeDue, settings.currencySymbol)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  EMV Contactless & Chip Reader Active
                </span>
                <span className="font-mono text-emerald-400 font-medium">Ready for Tap/Insert</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Simulated Card</label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-200"
                  >
                    <option value="Visa">Visa (ending 4242)</option>
                    <option value="Mastercard">Mastercard (ending 5521)</option>
                    <option value="Amex">Amex (ending 3009)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'mobile' && (
            <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>Customer tap phone or Apple Watch on terminal</span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-semibold">NFC Active</span>
            </div>
          )}

          {/* Customer Receipt Details (Optional) */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Customer Info (Optional for Receipt)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Email or Phone for SMS"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canCompleteCash || isProcessing}
            onClick={handleFinishCheckout}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? (
              <span>Authorizing & Printing...</span>
            ) : (
              <>
                <span>Complete Sale ({formatCurrency(total, settings.currencySymbol)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
