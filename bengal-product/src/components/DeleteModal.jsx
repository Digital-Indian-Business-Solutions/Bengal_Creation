import React, { useState } from 'react';
import { useProducts } from '../context/ProductsContext';

export default function DeleteModal({ product, onClose }) {
  const { deleteProduct } = useProducts();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    await deleteProduct(product._id);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-ink-950/50">
      <div className="modal-panel bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="w-12 h-12 rounded-full bg-crimson-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-crimson-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-display font-bold text-ink-900 text-lg">Delete Product?</h3>
          <p className="text-ink-500 text-sm mt-1">
            <span className="font-medium text-ink-700">"{product?.name}"</span> will be permanently removed. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={confirm} disabled={loading} className="btn-danger flex-1 disabled:opacity-60">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
