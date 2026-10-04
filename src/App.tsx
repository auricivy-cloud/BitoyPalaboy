import React, { useState, useEffect } from 'react';
import {
  Store,
  LayoutGrid,
  BarChart3,
  Receipt,
  Boxes,
  Settings,
  Bell,
  Clock,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import {
  CartItem,
  DateRangeFilter,
  OrderType,
  ParkedOrder,
  Product,
  StoreSettings,
  Transaction,
} from './types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  generateSeedTransactions,
} from './data/initialData';
import { getDateRangePreset } from './utils/kpiCalculator';
import { POSRegister } from './components/POSRegister';
import { KPIDashboard } from './components/KPIDashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { InventoryManager } from './components/InventoryManager';
import { ReceiptModal } from './components/ReceiptModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SettingsModal } from './components/SettingsModal';

type ActiveView = 'register' | 'kpis' | 'history' | 'inventory';

export default function App() {
  // Initialize state with localStorage persistence or rich initial mock data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('apex_pos_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // If old dollar amounts exist (< 50 for pour-over), reset to Philippine Peso catalog
        if (parsed.length > 0 && parsed[0].price < 50) {
          localStorage.setItem('apex_pos_products', JSON.stringify(INITIAL_PRODUCTS));
          return INITIAL_PRODUCTS;
        }
        return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('apex_pos_transactions');
      if (saved) {
        const parsed: Transaction[] = JSON.parse(saved);
        // If old dollar amounts exist (< 80 per transaction), reset to Philippine Peso seed transactions
        if (parsed.length > 0 && parsed[0].total < 80) {
          const newSeeds = generateSeedTransactions();
          localStorage.setItem('apex_pos_transactions', JSON.stringify(newSeeds));
          return newSeeds;
        }
        return parsed;
      }
      return generateSeedTransactions();
    } catch {
      return generateSeedTransactions();
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('apex_pos_settings');
      if (saved) {
        const parsed: StoreSettings = JSON.parse(saved);
        let modified = false;

        // Ensure storeName is exactly BitoyPalaboy Coffee Bar
        if (parsed.storeName?.includes('Oak &') || parsed.storeName?.includes('Spruce')) {
          parsed.storeName = 'BitoyPalaboy Coffee Bar';
          modified = true;
        }
        if (parsed.receiptHeader?.includes('OAK') || parsed.receiptHeader?.includes('SPRUCE')) {
          parsed.receiptHeader = 'WELCOME TO BITOYPALABOY COFFEE BAR';
          modified = true;
        }
        if (parsed.receiptFooter?.includes('Spruce') || parsed.receiptFooter?.includes('Oak')) {
          parsed.receiptFooter = INITIAL_SETTINGS.receiptFooter;
          modified = true;
        }
        // Ensure Philippine Peso currency symbol
        if (parsed.currencySymbol !== '₱') {
          parsed.currencySymbol = '₱';
          parsed.taxRatePercent = 12; // 12% PH VAT
          parsed.addressLine1 = INITIAL_SETTINGS.addressLine1;
          parsed.addressLine2 = INITIAL_SETTINGS.addressLine2;
          parsed.phone = INITIAL_SETTINGS.phone;
          parsed.taxId = INITIAL_SETTINGS.taxId;
          modified = true;
        }

        if (modified) {
          localStorage.setItem('apex_pos_settings', JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('apex_pos_parked');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation View
  const [activeView, setActiveView] = useState<ActiveView>('register');

  // Register Active Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'none'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [orderNote, setOrderNote] = useState<string>('');

  // Requested Date Range Filter for KPI Dashboard (defaults to 'today' with 2026-10-04 baseline)
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>(() =>
    getDateRangePreset('today', '2026-10-04')
  );

  // Modals
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);

  // Persist to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('apex_pos_products', JSON.stringify(products));
    } catch {
      // storage unavailable
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('apex_pos_transactions', JSON.stringify(transactions));
    } catch {
      // storage unavailable
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('apex_pos_settings', JSON.stringify(settings));
    } catch {
      // storage unavailable
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('apex_pos_parked', JSON.stringify(parkedOrders));
    } catch {
      // storage unavailable
    }
  }, [parkedOrders]);

  // Complete Sale Handler
  const handleCompleteSale = (newTx: Transaction) => {
    // Deduct stock for sold items
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemSold = newTx.items.find((i) => i.product.id === p.id);
        if (itemSold) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemSold.quantity),
          };
        }
        return p;
      })
    );

    // Prepend to transaction list
    setTransactions((prev) => [newTx, ...prev]);

    // Clear register cart
    setCart([]);
    setDiscountType('none');
    setDiscountValue(0);
    setOrderNote('');
    setShowCheckout(false);

    // Open receipt modal immediately so cashier/customer can print!
    setReceiptTransaction(newTx);
  };

  // Park Order Handler
  const handleParkOrder = () => {
    if (cart.length === 0) return;
    const parked: ParkedOrder = {
      id: `parked-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: `Ticket #${parkedOrders.length + 1} (${cart.length} items)`,
      items: [...cart],
      orderType,
      discountType,
      discountValue,
      orderNote,
    };
    setParkedOrders((prev) => [...prev, parked]);
    setCart([]);
    setDiscountType('none');
    setDiscountValue(0);
    setOrderNote('');
  };

  // Resume Parked Order
  const handleResumeParkedOrder = (parked: ParkedOrder) => {
    setCart(parked.items);
    setOrderType(parked.orderType);
    setDiscountType(parked.discountType);
    setDiscountValue(parked.discountValue);
    setOrderNote(parked.orderNote || '');
    setParkedOrders((prev) => prev.filter((p) => p.id !== parked.id));
  };

  // Stock update handler
  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  // Add product handler
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Refund handler
  const handleRefundTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    // Restore stock
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemReturned = tx.items.find((i) => i.product.id === p.id);
        if (itemReturned) {
          return {
            ...p,
            stock: p.stock + itemReturned.quantity,
          };
        }
        return p;
      })
    );

    // Update transaction status
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'refunded' } : t))
    );
  };

  // Reset to demo data
  const handleResetDemoData = () => {
    const seeds = generateSeedTransactions();
    setProducts(INITIAL_PRODUCTS);
    setTransactions(seeds);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setParkedOrders([]);
    localStorage.removeItem('apex_pos_products');
    localStorage.removeItem('apex_pos_transactions');
    localStorage.removeItem('apex_pos_settings');
    localStorage.removeItem('apex_pos_parked');
  };

  // Cart total items count
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20">
      {/* TOP NAVIGATION BAR - Adhering to Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* ZONE 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('register')}
              className="text-lg font-bold tracking-tight text-neutral-100 hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" />
              <span>{settings.storeName}</span>
            </button>
          </div>

          {/* ZONE 2: 4-6 clean text navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveView('register')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'register'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">POS Register</span>
              {cartItemCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center font-mono">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('kpis')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'kpis'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">5 KPI Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'history'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Receipts & Journal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('inventory')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeView === 'inventory'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </button>
          </nav>

          {/* ZONE 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
              title="Store & Receipt Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 no-print">
        {activeView === 'register' && (
          <POSRegister
            products={products}
            settings={settings}
            cart={cart}
            onUpdateCart={setCart}
            orderType={orderType}
            onChangeOrderType={setOrderType}
            discountType={discountType}
            discountValue={discountValue}
            onUpdateDiscount={(type, val) => {
              setDiscountType(type);
              setDiscountValue(val);
            }}
            orderNote={orderNote}
            onUpdateOrderNote={setOrderNote}
            onOpenCheckout={() => setShowCheckout(true)}
            parkedOrders={parkedOrders}
            onParkOrder={handleParkOrder}
            onResumeParkedOrder={handleResumeParkedOrder}
          />
        )}

        {activeView === 'kpis' && (
          <KPIDashboard
            transactions={transactions}
            products={products}
            settings={settings}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onSelectTransaction={(tx) => setReceiptTransaction(tx)}
          />
        )}

        {activeView === 'history' && (
          <TransactionHistory
            transactions={transactions}
            settings={settings}
            onSelectTransactionForReceipt={(tx) => setReceiptTransaction(tx)}
            onRefundTransaction={handleRefundTransaction}
          />
        )}

        {activeView === 'inventory' && (
          <InventoryManager
            products={products}
            settings={settings}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2 font-mono">
          <div>
            Terminal: {settings.registerNumber} · Cashier: {settings.cashierName} · Tax Rate: {settings.taxRatePercent}%
          </div>
          <div>
            Thermal Receipt Printing Ready (80mm) · Real-Time Margin Calculations
          </div>
        </div>
      </footer>

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        orderType={orderType}
        discountType={discountType}
        discountValue={discountValue}
        orderNote={orderNote}
        settings={settings}
        onCompleteSale={handleCompleteSale}
      />

      {/* RECEIPT PREVIEW & PRINT MODAL */}
      <ReceiptModal
        isOpen={!!receiptTransaction}
        transaction={receiptTransaction}
        settings={settings}
        onClose={() => setReceiptTransaction(null)}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
