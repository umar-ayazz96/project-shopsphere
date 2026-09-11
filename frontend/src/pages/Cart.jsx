import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-brand-600 font-medium">Browse products &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => {
          const price = item.discount_price ?? item.price;
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
              <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-gray-100" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-brand-700 font-semibold">${Number(price).toFixed(2)}</p>
              </div>
              <input
                type="number" min="1" max={item.stock_quantity} value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-16 border rounded-md px-2 py-1"
              />
              <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm">Remove</button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-8 border-t pt-4">
        <span className="text-lg font-semibold">Subtotal: ${subtotal.toFixed(2)}</span>
        <button
          onClick={() => navigate('/checkout')}
          className="bg-brand-600 text-white px-6 py-3 rounded-md hover:bg-brand-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
