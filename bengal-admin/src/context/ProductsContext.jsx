import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts();
      // Support both array and { data: [] } response shapes
      const data = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.products || [];
      setProducts(data);
    } catch (e) {
      setError('Failed to load products. Check the API or network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateProduct = async (id, updates) => {
    try {
      await api.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...updates } : p));
      showToast('Product updated successfully');
      return true;
    } catch {
      showToast('Failed to update product', 'error');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      showToast('Product deleted');
      return true;
    } catch {
      showToast('Failed to delete product', 'error');
      return false;
    }
  };

  const updateStock = async (id, newStock) => {
    return updateProduct(id, { stock: newStock });
  };

  const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];
  const vendors = [...new Set(products.map(p => p.vendor?.shopName).filter(Boolean))];
  const districts = [...new Set(products.map(p => p.district).filter(Boolean))];

  return (
    <ProductsContext.Provider value={{
      products, loading, error, toast,
      fetchProducts, updateProduct, deleteProduct, updateStock,
      categories, vendors, districts, showToast,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
