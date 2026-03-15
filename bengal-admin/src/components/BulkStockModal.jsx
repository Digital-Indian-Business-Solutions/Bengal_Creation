import React, { useState } from 'react';
import { useProducts } from '../context/ProductsContext';

export default function BulkStockModal({ selectedIds, onClose }) {
  const { updateStock, products } = useProducts();
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('set'); // set | add | subtract
  const [loading, setLoading] = useState(false);

  const selected = products.filter(p => selectedIds.includes(p._id));

  const apply = async () => {
    if (!value || isNaN(Number(value))) return;
    setLoading(true);
    for (const p of selected) {
      let newStock = p.stock;
      if (mode === 'set') newStock = Number(value);
      else if (mode === 'add') newStock = p.stock + Number(value);
      else if (mode === 'subtract') newStock = Math.max(0, p.stock - Number(value));
      await updateStock(p._id, newStock);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-ink-950/50">
      <div className="modal-panel bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="font-display font-bold text-ink-900">Bulk Update Stock</h3>
        <p className="text-sm text-ink-500">Updating <span className="font-semibold text-ink-800">{selected.length} product{selected.length !== 1 ? 's' : ''}</span></p>
        <div>
          <label className="label">Update Mode</label>
          <div className="flex gap-2">
            {[['set','Set to'],['add','Add'],['subtract','Subtract']].map(([v,l]) => (
              <button key={v} onClick={() => setMode(v)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all
                  ${mode === v ? 'bg-saffron-500 text-white border-saffron-500' : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Stock Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} className="input" min={0} placeholder="Enter quantity…" />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={apply} disabled={loading || !value} className="btn-primary flex-1 disabled:opacity-60">
            {loading ? 'Updating…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
