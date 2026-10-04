import React, { useState } from 'react';
import { Settings, Save, RotateCcw, X, Store, Percent, Volume2, Printer } from 'lucide-react';
import { StoreSettings } from '../types/pos';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-neutral-100">Register & Receipt Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Store Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Business & Receipt Profile
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">City, State ZIP</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Tax ID / EIN</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Sales Tax (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.taxRatePercent}
                  onChange={(e) => setFormData({ ...formData, taxRatePercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Cashier & Register */}
          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <h4 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Register & Shift Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Cashier Name</label>
                <input
                  type="text"
                  value={formData.cashierName}
                  onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Terminal ID</label>
                <input
                  type="text"
                  value={formData.registerNumber}
                  onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Receipt Custom Messages */}
          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <h4 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Thermal Receipt Customization
            </h4>
            <div>
              <label className="block text-neutral-400 mb-1">Receipt Footer & Policy Note</label>
              <textarea
                rows={3}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
              <span className="text-neutral-300 font-medium">Terminal Audio Effects (Beeps & Chimes)</span>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-900 border-neutral-700"
              />
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all transactions and inventory to initial sample demo data?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
