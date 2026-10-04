import React, { useState } from 'react';
import { Printer, Download, Copy, Check, X, QrCode } from 'lucide-react';
import { StoreSettings, Transaction } from '../types/pos';
import { formatCurrency } from '../utils/kpiCalculator';

interface ReceiptModalProps {
  transaction: Transaction | null;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onAutoPrintTrigger?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  settings,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const divider = '------------------------------------------\n';
    let text = '';
    text += `${settings.storeName.toUpperCase()}\n`;
    text += `${settings.tagline}\n`;
    text += `${settings.addressLine1}, ${settings.addressLine2}\n`;
    text += `Tel: ${settings.phone}\n`;
    text += `Tax ID: ${settings.taxId}\n`;
    text += divider;
    text += `Receipt #: ${transaction.receiptNumber}\n`;
    text += `Date: ${new Date(transaction.timestamp).toLocaleString()}\n`;
    text += `Cashier: ${transaction.cashierName} | Reg: ${settings.registerNumber}\n`;
    text += `Type: ${transaction.orderType.toUpperCase()}\n`;
    if (transaction.customerName) {
      text += `Customer: ${transaction.customerName}\n`;
    }
    text += divider;
    text += 'ITEM                   QTY   PRICE   TOTAL\n';
    text += divider;

    transaction.items.forEach((item) => {
      const name = item.product.name.slice(0, 20).padEnd(20, ' ');
      const qty = String(item.quantity).padStart(3, ' ');
      const price = item.unitPrice.toFixed(2).padStart(7, ' ');
      const total = item.totalPrice.toFixed(2).padStart(7, ' ');
      text += `${name} ${qty} ${price} ${total}\n`;

      if (item.selectedModifiers.length > 0) {
        item.selectedModifiers.forEach((m) => {
          text += `  + ${m.optionName} (${m.priceDelta > 0 ? '+' + m.priceDelta.toFixed(2) : 'incl'})\n`;
        });
      }
    });

    text += divider;
    text += `Subtotal:                ${formatCurrency(transaction.subtotal, settings.currencySymbol)}\n`;
    if (transaction.discountAmount > 0) {
      text += `Discount:               -${formatCurrency(transaction.discountAmount, settings.currencySymbol)}\n`;
    }
    text += `Sales Tax (${(transaction.taxRate * 100).toFixed(2)}%):       ${formatCurrency(transaction.taxAmount, settings.currencySymbol)}\n`;
    if (transaction.tipAmount > 0) {
      text += `Tip:                     ${formatCurrency(transaction.tipAmount, settings.currencySymbol)}\n`;
    }
    text += `TOTAL:                   ${formatCurrency(transaction.total, settings.currencySymbol)}\n`;
    text += divider;

    text += `Payment: ${transaction.paymentMethod.toUpperCase()}\n`;
    if (transaction.paymentMethod === 'cash') {
      text += `Cash Tendered:           ${formatCurrency(transaction.tenderDetails.amountTendered, settings.currencySymbol)}\n`;
      text += `Change Due:              ${formatCurrency(transaction.tenderDetails.changeDue, settings.currencySymbol)}\n`;
    } else {
      if (transaction.tenderDetails.cardBrand && transaction.tenderDetails.cardLast4) {
        text += `Card: ${transaction.tenderDetails.cardBrand} **** ${transaction.tenderDetails.cardLast4}\n`;
      }
      if (transaction.tenderDetails.authCode) {
        text += `Auth Code: ${transaction.tenderDetails.authCode}\n`;
      }
    }
    text += divider;
    text += `${settings.receiptFooter}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${transaction.receiptNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(
      `Receipt #${transaction.receiptNumber} - Total ${formatCurrency(transaction.total, settings.currencySymbol)} at ${settings.storeName}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(transaction.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Container - Screen View */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 no-print">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-neutral-100">Thermal Receipt Preview</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-neutral-900 border-b border-neutral-800/80 text-xs">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg transition-colors"
              title="Download text slip"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save .txt</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg transition-colors"
              title="Copy receipt summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Realistic Thermal Receipt Scroll Box */}
        <div className="p-6 bg-neutral-950 flex justify-center max-h-[70vh] overflow-y-auto">
          {/* Authentic Paper Receipt */}
          <div className="w-full max-w-[320px] bg-white text-neutral-900 p-6 rounded-sm shadow-xl font-mono text-xs leading-relaxed select-text border-t-4 border-amber-600">
            {/* Store Branding */}
            <div className="text-center pb-3">
              <div className="text-base font-bold tracking-wider uppercase text-black">{settings.storeName}</div>
              <div className="text-[11px] text-neutral-600 mt-0.5">{settings.tagline}</div>
              <div className="text-[10px] text-neutral-500 mt-1">
                {settings.addressLine1} · {settings.addressLine2}
              </div>
              <div className="text-[10px] text-neutral-500">Tel: {settings.phone}</div>
              <div className="text-[10px] text-neutral-500">Tax ID: {settings.taxId}</div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2.5" />

            {/* Receipt Metadata */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Receipt No:</span>
                <span className="font-semibold text-neutral-900">{transaction.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date:</span>
                <span>{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Cashier:</span>
                <span>{transaction.cashierName} · {settings.registerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Type:</span>
                <span className="uppercase font-semibold tracking-wide">
                  {transaction.orderType === 'dine_in' ? 'Dine In' : transaction.orderType === 'takeout' ? 'Take Out' : 'Curbside Pickup'}
                </span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <span className="font-medium">{transaction.customerName}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2.5" />

            {/* Line Items Table */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-500 pb-1 border-b border-neutral-300">
                <span>Item</span>
                <span className="text-right">Qty / Total</span>
              </div>

              {transaction.items.map((item) => (
                <div key={item.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline font-medium">
                    <span className="text-neutral-900 pr-2">{item.product.name}</span>
                    <span className="text-right whitespace-nowrap tabular-nums">
                      {item.quantity} × {formatCurrency(item.unitPrice, settings.currencySymbol)} = {formatCurrency(item.totalPrice, settings.currencySymbol)}
                    </span>
                  </div>

                  {/* Modifiers */}
                  {item.selectedModifiers.map((mod, mIdx) => (
                    <div key={mIdx} className="text-[10px] text-neutral-600 pl-2">
                      + {mod.optionName} {mod.priceDelta > 0 && `(${formatCurrency(mod.priceDelta, settings.currencySymbol)})`}
                    </div>
                  ))}

                  {item.itemNote && (
                    <div className="text-[10px] italic text-neutral-500 pl-2">
                      Note: {item.itemNote}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2.5" />

            {/* Financial Summary */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="tabular-nums">{formatCurrency(transaction.subtotal, settings.currencySymbol)}</span>
              </div>

              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="tabular-nums">-{formatCurrency(transaction.discountAmount, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Sales Tax ({(transaction.taxRate * 100).toFixed(2)}%):</span>
                <span className="tabular-nums">{formatCurrency(transaction.taxAmount, settings.currencySymbol)}</span>
              </div>

              {transaction.tipAmount > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Tip:</span>
                  <span className="tabular-nums">{formatCurrency(transaction.tipAmount, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="border-t border-neutral-900 my-1 pt-1.5 flex justify-between text-sm font-bold text-neutral-950">
                <span>TOTAL:</span>
                <span className="tabular-nums">{formatCurrency(transaction.total, settings.currencySymbol)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2.5" />

            {/* Payment Details */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">Payment Tender:</span>
                <span className="font-semibold uppercase">{transaction.paymentMethod}</span>
              </div>

              {transaction.paymentMethod === 'cash' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Cash Tendered:</span>
                    <span className="tabular-nums">{formatCurrency(transaction.tenderDetails.amountTendered, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span>Change Returned:</span>
                    <span className="tabular-nums">{formatCurrency(transaction.tenderDetails.changeDue, settings.currencySymbol)}</span>
                  </div>
                </>
              ) : (
                <>
                  {transaction.tenderDetails.cardBrand && transaction.tenderDetails.cardLast4 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Card Account:</span>
                      <span>{transaction.tenderDetails.cardBrand} **** {transaction.tenderDetails.cardLast4}</span>
                    </div>
                  )}
                  {transaction.tenderDetails.authCode && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Auth Approval:</span>
                      <span>{transaction.tenderDetails.authCode}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-3" />

            {/* Barcode & QR Code Section */}
            <div className="text-center pt-1 pb-2">
              {/* Simulated Thermal SVG Barcode */}
              <div className="flex justify-center mb-1">
                <svg className="w-48 h-10" viewBox="0 0 160 36">
                  {/* Alternating barcode bars */}
                  {[
                    2, 5, 8, 10, 14, 16, 20, 24, 28, 30, 35, 40, 42, 47, 50, 54, 58, 62, 65, 69,
                    74, 78, 82, 85, 90, 93, 98, 102, 106, 110, 115, 120, 124, 128, 132, 137, 142, 146, 150
                  ].map((x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y={2}
                      width={(i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.2)}
                      height={28}
                      fill="#111827"
                    />
                  ))}
                </svg>
              </div>
              <div className="text-[10px] tracking-widest text-neutral-700 font-mono">
                *{transaction.receiptNumber}*
              </div>

              {/* QR Code Icon Indicator */}
              <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-neutral-500">
                <QrCode className="w-3.5 h-3.5 text-neutral-600" />
                <span>Scan for rewards & digital warranty</span>
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            {/* Footer Message */}
            <div className="text-center text-[10px] text-neutral-500 whitespace-pre-line leading-relaxed pt-1">
              {settings.receiptFooter}
            </div>
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Hidden Thermal Print Target - Isolated strictly for @media print */}
      <div id="printable-receipt" className="hidden">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{settings.storeName}</div>
          <div style={{ fontSize: '10px' }}>{settings.tagline}</div>
          <div style={{ fontSize: '9px' }}>{settings.addressLine1}, {settings.addressLine2}</div>
          <div style={{ fontSize: '9px' }}>Tel: {settings.phone} | Tax ID: {settings.taxId}</div>
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
          <div>Receipt: {transaction.receiptNumber}</div>
          <div>Date: {formattedDate} {formattedTime}</div>
          <div>Cashier: {transaction.cashierName} (Reg: {settings.registerNumber})</div>
          <div>Type: {transaction.orderType.toUpperCase()}</div>
          {transaction.customerName && <div>Customer: {transaction.customerName}</div>}
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        <div style={{ fontSize: '10px' }}>
          {transaction.items.map((item) => (
            <div key={item.id} style={{ marginBottom: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.quantity}x {item.product.name}</span>
                <span>{formatCurrency(item.totalPrice, settings.currencySymbol)}</span>
              </div>
              {item.selectedModifiers.map((mod, idx) => (
                <div key={idx} style={{ fontSize: '9px', paddingLeft: '8px' }}>
                  + {mod.optionName} {mod.priceDelta > 0 && `(${formatCurrency(mod.priceDelta, settings.currencySymbol)})`}
                </div>
              ))}
            </div>
          ))}
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(transaction.subtotal, settings.currencySymbol)}</span>
          </div>
          {transaction.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-{formatCurrency(transaction.discountAmount, settings.currencySymbol)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax ({(transaction.taxRate * 100).toFixed(2)}%):</span>
            <span>{formatCurrency(transaction.taxAmount, settings.currencySymbol)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(transaction.total, settings.currencySymbol)}</span>
          </div>
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
          <div>Payment: {transaction.paymentMethod.toUpperCase()}</div>
          {transaction.paymentMethod === 'cash' ? (
            <>
              <div>Tendered: {formatCurrency(transaction.tenderDetails.amountTendered, settings.currencySymbol)}</div>
              <div style={{ fontWeight: 'bold' }}>Change: {formatCurrency(transaction.tenderDetails.changeDue, settings.currencySymbol)}</div>
            </>
          ) : (
            <div>Card: {transaction.tenderDetails.cardBrand || 'Card'} **** {transaction.tenderDetails.cardLast4 || '4242'}</div>
          )}
        </div>

        <hr style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '9px', whiteSpace: 'pre-line' }}>
          {settings.receiptFooter}
        </div>
      </div>
    </div>
  );
};
