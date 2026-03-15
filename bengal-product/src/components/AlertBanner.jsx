import React, { useState } from 'react';
import { useProducts } from '../context/ProductsContext';
import { useNavigate } from 'react-router-dom';

export default function AlertBanner() {
  const { products } = useProducts();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed || products.length === 0) return null;

  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);

  if (outOfStock.length === 0 && lowStock.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-4 fade-in">
      {outOfStock.length > 0 && (
        <div className="flex items-center justify-between bg-crimson-50 border border-crimson-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-crimson-700 text-sm">
            <span className="text-base">❌</span>
            <span className="font-semibold">{outOfStock.length} product{outOfStock.length !== 1 ? 's' : ''} out of stock</span>
            <span className="hidden sm:inline text-crimson-500">— {outOfStock.slice(0,3).map(p => p.name).join(', ')}{outOfStock.length > 3 ? '…' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/products?filter=out')} className="text-xs text-crimson-600 font-semibold hover:underline">View</button>
            <button onClick={() => setDismissed(true)} className="text-crimson-300 hover:text-crimson-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="flex items-center justify-between bg-saffron-50 border border-saffron-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-saffron-700 text-sm">
            <span className="text-base">⚠️</span>
            <span className="font-semibold">{lowStock.length} product{lowStock.length !== 1 ? 's' : ''} low in stock</span>
            <span className="hidden sm:inline text-saffron-600">— {lowStock.slice(0,3).map(p => p.name).join(', ')}{lowStock.length > 3 ? '…' : ''}</span>
          </div>
          <button onClick={() => navigate('/products?filter=low')} className="text-xs text-saffron-600 font-semibold hover:underline">View</button>
        </div>
      )}
    </div>
  );
}
