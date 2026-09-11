import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <div className="max-w-2xl mx-auto px-4 py-10 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">Order {order.order_number}</h1>
      <p className="text-sm text-gray-500 mb-6 capitalize">Status: {order.status}</p>

      <div className="bg-white rounded-lg shadow-sm p-4 divide-y">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 text-sm">
            <span>{item.product_name} &times; {item.quantity}</span>
            <span>${Number(item.subtotal).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mt-4 text-sm space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>${Number(order.shipping_fee).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>${Number(order.tax_amount).toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>${Number(order.total_amount).toFixed(2)}</span></div>
      </div>
    </div>
  );
}
