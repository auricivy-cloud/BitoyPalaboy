import React, { useState } from 'react';
import { Calendar, ChevronDown, Clock, ArrowRight, Check } from 'lucide-react';
import { DatePreset, DateRangeFilter } from '../types/pos';
import { getDateRangePreset, getPriorDateWindow } from '../utils/kpiCalculator';

interface DateRangePickerProps {
  currentFilter: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
  anchorDate?: string; // defaults to '2026-10-04'
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  currentFilter,
  onChange,
  anchorDate = '2026-10-04',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(currentFilter.startDate);
  const [customEnd, setCustomEnd] = useState(currentFilter.endDate);

  const presets: { id: DatePreset; label: string; icon?: React.ReactNode }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'ytd', label: 'Year to Date' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleSelectPreset = (preset: DatePreset) => {
    if (preset === 'custom') {
      setIsOpen(true);
      return;
    }
    const filter = getDateRangePreset(preset, anchorDate);
    onChange(filter);
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    // Ensure start is not after end
    const startStr = customStart <= customEnd ? customStart : customEnd;
    const endStr = customStart <= customEnd ? customEnd : customStart;

    const { priorStart, priorEnd } = getPriorDateWindow(startStr, endStr);

    const filter: DateRangeFilter = {
      preset: 'custom',
      startDate: startStr,
      endDate: endStr,
      label: `${startStr} to ${endStr}`,
      comparisonLabel: `vs ${priorStart} to ${priorEnd}`,
    };

    onChange(filter);
    setIsOpen(false);
  };

  // Format nice display string for the active filter
  const formatDisplayDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Segmented Preset Buttons */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          {presets.slice(0, 5).map((p) => {
            const isActive = currentFilter.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-amber-300 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Date Trigger Popover Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            isOpen || currentFilter.preset === 'custom' || currentFilter.preset === 'ytd'
              ? 'bg-neutral-800 border-amber-500/50 text-amber-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
          }`}
          title="Filter by specific date range"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono tabular-nums">
            {formatDisplayDate(currentFilter.startDate)}
            {currentFilter.startDate !== currentFilter.endDate && (
              <> – {formatDisplayDate(currentFilter.endDate)}</>
            )}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Comparison Subtext */}
      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-500 font-mono">
        <Clock className="w-3 h-3 text-neutral-600" />
        <span>Comparing: {currentFilter.comparisonLabel}</span>
      </div>

      {/* Popover Calendar & Custom Date Range Modal/Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 p-4 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Select Date Range
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-200"
              >
                Close
              </button>
            </div>

            {/* Presets List in dropdown */}
            <div className="grid grid-cols-2 gap-1.5 py-3 border-b border-neutral-800">
              {presets.map((p) => {
                const isActive = currentFilter.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (p.id !== 'custom') {
                        handleSelectPreset(p.id);
                      }
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left transition-colors ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 font-medium border border-amber-500/30'
                        : 'text-neutral-300 hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isActive && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Inputs */}
            <form onSubmit={handleApplyCustom} className="pt-3 space-y-3">
              <div className="text-xs font-medium text-neutral-300">Custom Date Range:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    max={customEnd || anchorDate}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    min={customStart}
                    className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomStart(anchorDate);
                    setCustomEnd(anchorDate);
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Reset to Today
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-md shadow transition-colors"
                >
                  <span>Apply Filter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
