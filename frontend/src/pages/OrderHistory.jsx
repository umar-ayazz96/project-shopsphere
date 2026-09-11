import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine').then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 && <p className="text-gray-400">No orders yet.</p>}
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md">
            <div className="flex justify-between">
              <span className="font-medium">{o.order_number}</span>
              <span className="text-sm capitalize px-2 py-0.5 rounded-full bg-gray-100">{o.status}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{new Date(o.created_at).toLocaleDateString()}</span>
              <span className="font-semibold text-brand-700">${Number(o.total_amount).toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
