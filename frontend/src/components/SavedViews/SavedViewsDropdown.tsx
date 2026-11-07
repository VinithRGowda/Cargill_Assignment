import React, { useEffect, useState } from 'react';
import { Bookmark, Plus, Trash2, Check } from 'lucide-react';
import { RiskFilterCriteria, SavedView } from '../../types/risk';
import { riskClient } from '../../api/riskClient';

interface SavedViewsDropdownProps {
  currentFilters: RiskFilterCriteria;
  onApplyView: (view: SavedView) => void;
}

export const SavedViewsDropdown: React.FC<SavedViewsDropdownProps> = ({
  currentFilters,
  onApplyView,
}) => {
  const [views, setViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>('view-all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDesc, setNewViewDesc] = useState('');

  const loadViews = async () => {
    try {
      const list = await riskClient.getSavedViews();
      setViews(list);
    } catch (err) {
      console.error('Failed to load saved views:', err);
    }
  };

  useEffect(() => {
    loadViews();
  }, []);

  const handleSelectView = (view: SavedView) => {
    setActiveViewId(view.id);
    onApplyView(view);
  };

  const handleSaveCurrentView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;

    try {
      const saved = await riskClient.saveView({
        name: newViewName.trim(),
        description: newViewDesc.trim() || undefined,
        filters: currentFilters,
        sorts: [{ field: 'pnl', direction: 'desc' }],
        groupBy: 'book',
      });

      setViews((prev) => [...prev, saved]);
      setActiveViewId(saved.id);
      setIsModalOpen(false);
      setNewViewName('');
      setNewViewDesc('');
    } catch (err) {
      console.error('Failed to save view:', err);
    }
  };

  const handleDeleteView = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await riskClient.deleteView(id);
      setViews((prev) => prev.filter((v) => v.id !== id));
      if (activeViewId === id) {
        setActiveViewId('view-all');
      }
    } catch (err) {
      console.error('Failed to delete view:', err);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Bookmark className="w-3.5 h-3.5 text-sky-400" />
          <span>Preset Views:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {views.map((v) => {
            const isSelected = activeViewId === v.id;
            const isCustom = !v.id.startsWith('view-');
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectView(v)}
                className={`px-2.5 py-1 text-xs rounded-full border transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-600/30 border-sky-500 text-sky-200 font-semibold shadow'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
                title={v.description || v.name}
              >
                {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                {v.name}
                {isCustom && (
                  <Trash2
                    className="w-3 h-3 text-slate-500 hover:text-rose-400 ml-1"
                    onClick={(e) => handleDeleteView(v.id, e)}
                  />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-2 py-1 text-xs rounded-full border border-dashed border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition flex items-center gap-1"
            title="Save current filters as a new custom view preset"
          >
            <Plus className="w-3 h-3" /> Save View
          </button>
        </div>
      </div>

      {/* Save View Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-400" />
              Save Current Filter Preset
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Persist your active filters and column view for fast one-click access.
            </p>

            <form onSubmit={handleSaveCurrentView} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  View Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMER Grain Swaps"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  className="filter-input w-full"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monitoring corn and wheat derivative positions in the Americas"
                  value={newViewDesc}
                  onChange={(e) => setNewViewDesc(e.target.value)}
                  className="filter-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

