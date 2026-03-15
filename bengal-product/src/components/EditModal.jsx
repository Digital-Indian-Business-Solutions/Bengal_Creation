import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';

export default function EditModal({ product, onClose }) {
  const { updateProduct, categories, districts } = useProducts();
  const [form, setForm] = useState({
    name: '', description: '', price: '', orginalPrice: '', stock: '', district: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        orginalPrice: product.orginalPrice ?? '',
        stock: product.stock ?? '',
        district: product.district || '',
      });
    }
  }, [product]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    const ok = await updateProduct(product._id, {
      ...form,
      price: Number(form.price),
      orginalPrice: Number(form.orginalPrice),
      stock: Number(form.stock),
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-ink-950/50">
      <div className="modal-panel bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-ink-900">Edit Product</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-50 text-ink-400 hover:text-ink-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="label">Product Name</label>
            <input name="name" value={form.name} onChange={handle} className="input" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handle} className="input" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <input name="price" type="number" value={form.price} onChange={handle} className="input" min={0} required />
            </div>
            <div>
              <label className="label">Original Price (₹)</label>
              <input name="orginalPrice" type="number" value={form.orginalPrice} onChange={handle} className="input" min={0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={handle} className="input" min={0} required />
            </div>
            <div>
              <label className="label">District</label>
              <input name="district" value={form.district} onChange={handle} className="input" list="district-list" />
              <datalist id="district-list">
                {districts.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
