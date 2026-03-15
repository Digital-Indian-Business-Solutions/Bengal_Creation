import axios from 'axios';

const BASE = 'https://api.bengalcreations.in/api/products';

export const api = {
  getProducts: () => axios.get(BASE),
  getProduct: (id) => axios.get(`${BASE}/${id}`),
  updateProduct: (id, data) => axios.put(`${BASE}/${id}`, data),
  deleteProduct: (id) => axios.delete(`${BASE}/${id}`),
};

export default api;
