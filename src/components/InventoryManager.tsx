import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Product, StoreSettings } from '../types/pos';
import { formatCurrency } from '../utils/kpiCalculator';

interface InventoryManagerProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onAddProduct: (newProduct: Product) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  settings,
  onUpdateProductStock,
  onAddProduct,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'coffee' | 'bakery' | 'breakfast' | 'cold_drinks' | 'retail'>('coffee');
  const [newPrice, setNewPrice] = useState(settings.currencySymbol === '₱' ? '180' : '4.50');
  const [newCost, setNewCost] = useState(settings.currencySymbol === '₱' ? '50' : '1.20');
  const [newStock, setNewStock] = useState('50');
  const [newSku, setNewSku] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesLowStock = !lowStockOnly || p.stock <= p.lowStockThreshold;

    return matchesSearch && matchesCat && matchesLowStock;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const prodPrice = parseFloat(newPrice) || 0;
    const prodCost = parseFloat(newCost) || 0;
    const prodStock = parseInt(newStock, 10) || 0;

    const created: Product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      sku: newSku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      category: newCategory,
      price: prodPrice,
      cost: prodCost,
      stock: prodStock,
      lowStockThreshold: 10,
      barcode: newBarcode.trim() || `890${Math.floor(10000000 + Math.random() * 90000000)}`,
      description: newDesc.trim() || 'Small business artisan provision.',
    };

    onAddProduct(created);
    setShowAddModal(false);

    // Reset form
    setNewName('');
    setNewPrice('4.50');
    setNewCost('1.20');
    setNewStock('50');
    setNewSku('');
    setNewBarcode('');
    setNewDesc('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 tracking-tight">
            Inventory & Unit Economics
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage product catalog, real-time stock levels, cost of goods, and margin profitability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products, SKU or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200"
        >
          <option value="all">All Categories</option>
          <option value="coffee">Coffee & Espresso</option>
          <option value="bakery">Artisan Bakery</option>
          <option value="breakfast">Sandwiches & Breakfast</option>
          <option value="cold_drinks">Teas & Cold Drinks</option>
          <option value="retail">Retail & Merch</option>
        </select>

        <button
          type="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
            lowStockOnly
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono text-[11px]">
                <th className="py-3 px-4 font-medium">Product / SKU</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium text-right">Price</th>
                <th className="py-3 px-4 font-medium text-right">Cost (COGS)</th>
                <th className="py-3 px-4 font-medium text-right">Item Margin %</th>
                <th className="py-3 px-4 font-medium text-center">Stock Level</th>
                <th className="py-3 px-4 font-medium text-center">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {filtered.map((product) => {
                const marginPercent =
                  product.price > 0
                    ? (((product.price - product.cost) / product.price) * 100).toFixed(1)
                    : '0';
                const isLow = product.stock <= product.lowStockThreshold;

                return (
                  <tr key={product.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-neutral-200">{product.name}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {product.sku} · Barcode: {product.barcode}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-400 capitalize">
                      {product.category.replace('_', ' ')}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-neutral-100 tabular-nums">
                      {formatCurrency(product.price, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-right text-neutral-400 tabular-nums">
                      {formatCurrency(product.cost, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums">
                      {marginPercent}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold tabular-nums ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-neutral-800 text-neutral-200'
                        }`}
                      >
                        {product.stock} units
                      </span>
                      {isLow && (
                        <div className="text-[10px] text-rose-400 mt-0.5 font-sans">
                          Min: {product.lowStockThreshold}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => onUpdateProductStock(product.id, Math.max(0, product.stock - 1))}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
                          title="Subtract 1 unit"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateProductStock(product.id, product.stock + 1)}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs"
                          title="Add 1 unit"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateProductStock(product.id, product.stock + 10)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono rounded text-xs font-semibold"
                          title="Restock +10 units"
                        >
                          +10 Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 font-sans">
                    No products matched filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100">Add New Catalog Product</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vanilla Bean Cardamom Latte"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="coffee">Coffee & Espresso</option>
                    <option value="bakery">Artisan Bakery</option>
                    <option value="breakfast">Sandwiches & Breakfast</option>
                    <option value="cold_drinks">Teas & Cold Drinks</option>
                    <option value="retail">Retail Beans & Merch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Retail Price ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Cost of Goods / COGS ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">SKU (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. COF-VAN-01"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Barcode (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 89012345699"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, origin or notes..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
