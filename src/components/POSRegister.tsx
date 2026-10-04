import React, { useState } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  Coffee,
  ShoppingBag,
  Sparkles,
  Utensils,
  Clock,
  Archive,
  MessageSquare,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import {
  CartItem,
  OrderType,
  ParkedOrder,
  Product,
  ProductModifier,
  SelectedModifier,
  StoreSettings,
} from '../types/pos';
import { formatCurrency } from '../utils/kpiCalculator';
import { playBeep, playTap } from '../utils/audio';

interface POSRegisterProps {
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  onUpdateCart: (newCart: CartItem[]) => void;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  onUpdateDiscount: (type: 'percentage' | 'fixed' | 'none', value: number) => void;
  orderNote: string;
  onUpdateOrderNote: (note: string) => void;
  onOpenCheckout: () => void;
  parkedOrders: ParkedOrder[];
  onParkOrder: () => void;
  onResumeParkedOrder: (order: ParkedOrder) => void;
}

export const POSRegister: React.FC<POSRegisterProps> = ({
  products,
  settings,
  cart,
  onUpdateCart,
  orderType,
  onChangeOrderType,
  discountType,
  discountValue,
  onUpdateDiscount,
  orderNote,
  onUpdateOrderNote,
  onOpenCheckout,
  parkedOrders,
  onParkOrder,
  onResumeParkedOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modifierProduct, setModifierProduct] = useState<Product | null>(null);
  const [tempModifiers, setTempModifiers] = useState<SelectedModifier[]>([]);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [showParkedDrawer, setShowParkedDrawer] = useState<boolean>(false);
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [tempNote, setTempNote] = useState<string>(orderNote);

  // Category list
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'coffee', label: 'Coffee & Espresso' },
    { id: 'bakery', label: 'Artisan Bakery' },
    { id: 'breakfast', label: 'Sandwiches & Bites' },
    { id: 'cold_drinks', label: 'Teas & Cold Brew' },
    { id: 'retail', label: 'Retail & Merch' },
  ];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  // Add product to cart
  const handleProductClick = (product: Product) => {
    if (settings.soundEnabled) playTap();

    // If product has modifiers, open the modifier selector
    if (product.modifiers && product.modifiers.length > 0) {
      setModifierProduct(product);
      // Preselect default first option for each modifier group
      const defaults: SelectedModifier[] = product.modifiers.map((m) => ({
        groupName: m.name,
        optionName: m.options[0].name,
        priceDelta: m.options[0].priceDelta,
      }));
      setTempModifiers(defaults);
      return;
    }

    // Direct add
    addItemToCart(product, []);
  };

  const addItemToCart = (product: Product, modifiers: SelectedModifier[]) => {
    const unitPrice =
      product.price + modifiers.reduce((sum, m) => sum + m.priceDelta, 0);

    // Look for exact match (same product & same modifiers)
    const existingIndex = cart.findIndex((item) => {
      if (item.product.id !== product.id) return false;
      if (item.selectedModifiers.length !== modifiers.length) return false;
      return item.selectedModifiers.every((sm, idx) => sm.optionName === modifiers[idx]?.optionName);
    });

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = Number(
        (updated[existingIndex].quantity * updated[existingIndex].unitPrice).toFixed(2)
      );
      onUpdateCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        product,
        quantity: 1,
        selectedModifiers: modifiers,
        unitPrice,
        totalPrice: Number(unitPrice.toFixed(2)),
      };
      onUpdateCart([...cart, newItem]);
    }
  };

  // Barcode scanner simulator
  const handleSimulateBarcodeScan = () => {
    if (settings.soundEnabled) playBeep();
    // Pick a random product to simulate laser scan
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    addItemToCart(randomProduct, []);
  };

  // Adjust item quantity in cart
  const handleQuantityDelta = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
      updated[index].totalPrice = Number(
        (updated[index].quantity * updated[index].unitPrice).toFixed(2)
      );
    }
    onUpdateCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    onUpdateCart(updated);
  };

  // Financial calculations
  const subtotal = Number(cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* LEFT AREA: CATALOG & REGISTER GRID (8 Cols) */}
      <div className="xl:col-span-8 space-y-4">
        {/* Top Control Bar: Category Tabs & Search & Barcode Scan */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search products by name, SKU or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Barcode Scanner Simulation Button */}
            <button
              type="button"
              onClick={handleSimulateBarcodeScan}
              className="flex items-center justify-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs font-semibold text-neutral-200 transition-colors whitespace-nowrap active:scale-95"
              title="Click to simulate laser barcode scanner with audio beep"
            >
              <Barcode className="w-4 h-4 text-amber-400" />
              <span>Scan Barcode</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? products.length
                  : products.filter((p) => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      isActive ? 'bg-amber-600/30 text-neutral-950' : 'text-neutral-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.lowStockThreshold;
            const inCartQty = cart
              .filter((c) => c.product.id === product.id)
              .reduce((s, c) => s + c.quantity, 0);

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductClick(product)}
                className="group relative flex flex-col justify-between p-3.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 rounded-xl text-left transition-all hover:shadow-lg active:scale-98 min-h-[125px]"
              >
                <div>
                  {/* Top tags / badge */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    {product.badge ? (
                      <span className="text-[10px] font-medium text-amber-400">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        {product.category}
                      </span>
                    )}

                    {inCartQty > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-amber-500 text-neutral-950 rounded-full">
                        {inCartQty} in cart
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-amber-200 line-clamp-2 transition-colors">
                    {product.name}
                  </h4>
                </div>

                {/* Bottom: Price & Stock */}
                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between font-mono">
                  <span className="text-sm font-bold text-amber-400 tabular-nums">
                    {formatCurrency(product.price, settings.currencySymbol)}
                  </span>

                  <span
                    className={`text-[10px] ${
                      isLowStock ? 'text-rose-400 font-semibold' : 'text-neutral-500'
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </div>
              </button>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-neutral-500 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-xl">
              No products found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: ACTIVE TICKET / ORDER SUMMARY (4 Cols) */}
      <div className="xl:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl sticky top-4">
        {/* Ticket Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-100 uppercase tracking-wider">
              Current Ticket
            </span>
            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
              Cashier: {settings.cashierName} · {settings.registerNumber}
            </div>
          </div>

          {/* Parked Order quick trigger */}
          <div className="flex items-center gap-1.5">
            {parkedOrders.length > 0 && (
              <button
                type="button"
                onClick={() => setShowParkedDrawer(true)}
                className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-xs font-mono font-medium"
              >
                Parked ({parkedOrders.length})
              </button>
            )}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => onUpdateCart([])}
                className="text-xs text-neutral-400 hover:text-rose-400 p-1 transition-colors"
                title="Clear Ticket"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Order Type Toggle (Dine-in / Takeout / Pickup) */}
        <div className="px-4 py-2.5 border-b border-neutral-800/80 bg-neutral-900/80">
          <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-950 rounded-lg text-xs">
            {(['dine_in', 'takeout', 'pickup'] as OrderType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChangeOrderType(type)}
                className={`py-1.5 font-medium rounded capitalize transition-colors ${
                  orderType === type
                    ? 'bg-neutral-800 text-amber-300 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Line Items List */}
        <div className="p-4 max-h-[360px] overflow-y-auto divide-y divide-neutral-800/60 min-h-[160px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-500 text-xs space-y-2">
              <ShoppingBag className="w-8 h-8 text-neutral-600" />
              <span>Ticket is empty</span>
              <span className="text-[11px] text-neutral-600">Select items from catalog to start</span>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.id} className="py-2.5 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="text-xs font-medium text-neutral-200">{item.product.name}</h5>
                    {/* Modifiers display */}
                    {item.selectedModifiers.map((m, mIdx) => (
                      <div key={mIdx} className="text-[10px] text-neutral-500 font-mono">
                        + {m.optionName} {m.priceDelta > 0 && `(+${formatCurrency(m.priceDelta, settings.currencySymbol)})`}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-mono font-semibold text-neutral-100 tabular-nums">
                    {formatCurrency(item.totalPrice, settings.currencySymbol)}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] font-mono text-neutral-500">
                    {formatCurrency(item.unitPrice, settings.currencySymbol)} each
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuantityDelta(index, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-semibold text-neutral-100 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityDelta(index, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="ml-2 text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Breakdown & Discounts */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums text-neutral-200">
              {formatCurrency(subtotal, settings.currencySymbol)}
            </span>
          </div>

          {/* Discount Trigger / Display */}
          <div className="flex justify-between items-center text-neutral-400">
            <button
              type="button"
              onClick={() => setShowDiscountModal(true)}
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>
                {discountAmount > 0
                  ? `Discount (${discountType === 'percentage' ? discountValue + '%' : settings.currencySymbol + discountValue})`
                  : 'Add Discount'}
              </span>
            </button>
            {discountAmount > 0 && (
              <span className="font-mono tabular-nums text-emerald-400">
                -{formatCurrency(discountAmount, settings.currencySymbol)}
              </span>
            )}
          </div>

          {/* Sales Tax */}
          <div className="flex justify-between text-neutral-400">
            <span>Sales Tax ({settings.taxRatePercent}%)</span>
            <span className="font-mono tabular-nums text-neutral-200">
              {formatCurrency(taxAmount, settings.currencySymbol)}
            </span>
          </div>

          {/* Order Note Indicator */}
          {orderNote && (
            <div className="text-[11px] text-neutral-400 italic bg-neutral-900 px-2 py-1 rounded">
              Note: {orderNote}
            </div>
          )}

          {/* Grand Total */}
          <div className="border-t border-neutral-800 pt-2 flex justify-between items-baseline text-base font-bold text-neutral-100">
            <span>Total Due</span>
            <span className="text-xl text-amber-400 font-mono tabular-nums">
              {formatCurrency(total, settings.currencySymbol)}
            </span>
          </div>

          {/* Order Actions: Note & Park Ticket */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setTempNote(orderNote);
                setShowNoteModal(true);
              }}
              className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3 text-neutral-400" />
              <span>{orderNote ? 'Edit Note' : 'Add Note'}</span>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={onParkOrder}
              className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-50 rounded text-xs flex items-center justify-center gap-1 transition-colors"
              title="Park order to serve another customer"
            >
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>Hold Order</span>
            </button>
          </div>

          {/* PRIMARY CHARGE BUTTON */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={onOpenCheckout}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Charge {formatCurrency(total, settings.currencySymbol)}</span>
          </button>
        </div>
      </div>

      {/* MODIFIER SELECTOR MODAL */}
      {modifierProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-100">{modifierProduct.name}</h4>
                <p className="text-xs text-neutral-400">Choose customization</p>
              </div>
              <button
                type="button"
                onClick={() => setModifierProduct(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modifier Groups */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {modifierProduct.modifiers?.map((modGroup) => (
                <div key={modGroup.id} className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    {modGroup.name}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {modGroup.options.map((opt) => {
                      const isSelected = tempModifiers.some(
                        (tm) => tm.groupName === modGroup.name && tm.optionName === opt.name
                      );
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => {
                            const filtered = tempModifiers.filter(
                              (tm) => tm.groupName !== modGroup.name
                            );
                            setTempModifiers([
                              ...filtered,
                              {
                                groupName: modGroup.name,
                                optionName: opt.name,
                                priceDelta: opt.priceDelta,
                              },
                            ]);
                          }}
                          className={`p-2 text-xs rounded-lg border text-left flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <span>{opt.name}</span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {opt.priceDelta > 0
                              ? `+${formatCurrency(opt.priceDelta, settings.currencySymbol)}`
                              : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModifierProduct(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addItemToCart(modifierProduct, tempModifiers);
                  setModifierProduct(null);
                }}
                className="px-4 py-1.5 bg-amber-500 text-neutral-950 text-xs font-bold rounded-lg shadow"
              >
                Add to Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNT MODAL */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-100">Apply Order Discount</h4>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { type: 'percentage', val: 10, label: '10%' },
                { type: 'percentage', val: 15, label: '15%' },
                { type: 'percentage', val: 20, label: '20%' },
                ...(settings.currencySymbol === '₱'
                  ? [
                      { type: 'fixed', val: 50, label: '₱50 Off' },
                      { type: 'fixed', val: 100, label: '₱100 Off' },
                    ]
                  : [
                      { type: 'fixed', val: 2, label: '$2 Off' },
                      { type: 'fixed', val: 5, label: '$5 Off' },
                    ]),
                { type: 'none', val: 0, label: 'None' },
              ].map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onUpdateDiscount(d.type as any, d.val);
                    setShowDiscountModal(false);
                  }}
                  className={`p-2.5 rounded-lg border font-mono font-semibold transition-colors ${
                    discountType === d.type && discountValue === d.val
                      ? 'bg-amber-500 text-neutral-950 border-amber-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ORDER NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-neutral-100">Order Instructions / Table Note</h4>
            <textarea
              rows={3}
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="e.g. Table 4, allergies, rush order..."
              className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOrderNote(tempNote);
                  setShowNoteModal(false);
                }}
                className="px-4 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-lg"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARKED ORDERS DRAWER / MODAL */}
      {showParkedDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-100">Held / Parked Tickets</h4>
              <button
                type="button"
                onClick={() => setShowParkedDrawer(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {parkedOrders.map((po) => (
                <div
                  key={po.id}
                  className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-neutral-200">{po.name}</div>
                    <div className="text-[11px] text-neutral-500">
                      {po.items.length} items · {new Date(po.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onResumeParkedOrder(po);
                      setShowParkedDrawer(false);
                    }}
                    className="px-3 py-1.5 bg-amber-500 text-neutral-950 font-bold text-xs rounded-md"
                  >
                    Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
