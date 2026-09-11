import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ sku: '', name: '', price: '', stockQuantity: '', categoryId: '', imageUrl: '', description: '' });

  const loadProducts = () => api.get('/products?limit=100').then((res) => setProducts(res.data.products));
  const loadOrders = () => api.get('/orders/admin/all').then((res) => setOrders(res.data));
  const loadCategories = () => api.get('/categories').then((res) => setCategories(res.data));

  useEffect(() => { loadProducts(); loadOrders(); loadCategories(); }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    await api.post('/products', { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) });
    setForm({ sku: '', name: '', price: '', stockQuantity: '', categoryId: '', imageUrl: '', description: '' });
    loadProducts();
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    loadOrders();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6 border-b">
        {['products', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 capitalize ${tab === t ? 'border-b-2 border-brand-600 text-brand-600 font-medium' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-medium mb-3">Add new product</h2>
            <form onSubmit={handleCreateProduct} className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
              <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border rounded-md px-2 py-1" />
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-2 py-1" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-md px-2 py-1" />
              <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded-md px-2 py-1" />
              <input required type="number" placeholder="Stock quantity" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="w-full border rounded-md px-2 py-1" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full border rounded-md px-2 py-1">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full border rounded-md px-2 py-1" />
              <button className="bg-brand-600 text-white rounded-md px-4 py-2">Create Product</button>
            </form>
          </div>

          <div>
            <h2 className="font-medium mb-3">Existing products ({products.length})</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-md p-3 shadow-sm flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span>${Number(p.price).toFixed(2)} &middot; {p.stock_quantity} in stock</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{o.order_number} &mdash; {o.first_name} {o.last_name}</p>
                <p className="text-sm text-gray-500">{o.email} &middot; ${Number(o.total_amount).toFixed(2)}</p>
              </div>
              <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)} className="border rounded-md px-2 py-1 text-sm">
                {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
