import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState({ line1: '', city: '', state: '', postalCode: '', country: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/addresses').then((res) => {
      setAddresses(res.data);
      if (res.data.length) setSelectedAddress(res.data[0].id);
      else setShowNewForm(true);
    });
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/users/addresses', { ...newAddress, isDefault: true });
    setAddresses([data, ...addresses]);
    setSelectedAddress(data.id);
    setShowNewForm(false);
  };

  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const { data } = await api.post('/orders', { shippingAddressId: selectedAddress });
      await refreshCart();
      navigate(`/orders/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Checkout</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">Shipping Address</h2>
        {addresses.map((a) => (
          <label key={a.id} className="flex items-start gap-2 mb-2 text-sm">
            <input
              type="radio" name="address" checked={selectedAddress === a.id}
              onChange={() => setSelectedAddress(a.id)}
            />
            <span>{a.line1}, {a.city}, {a.state} {a.postal_code}, {a.country}</span>
          </label>
        ))}
        <button onClick={() => setShowNewForm(!showNewForm)} className="text-brand-600 text-sm mt-2">
          + Add new address
        </button>

        {showNewForm && (
          <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-2 mt-3">
            <input placeholder="Address line 1" required className="border rounded-md px-2 py-1 col-span-2"
              value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
            <input placeholder="City" required className="border rounded-md px-2 py-1"
              value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
            <input placeholder="State/Region" className="border rounded-md px-2 py-1"
              value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
            <input placeholder="Postal code" required className="border rounded-md px-2 py-1"
              value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
            <input placeholder="Country" required className="border rounded-md px-2 py-1"
              value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
            <button className="bg-gray-800 text-white rounded-md py-1 col-span-2">Save address</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="font-medium mb-3">Order Summary</h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>{item.name} &times; {item.quantity}</span>
            <span>${(Number(item.discount_price ?? item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold border-t mt-2 pt-2">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Shipping and tax calculated at order placement.</p>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={placeOrder}
        disabled={!selectedAddress || placing}
        className="w-full bg-brand-600 text-white py-3 rounded-md hover:bg-brand-700 disabled:opacity-50"
      >
        {placing ? 'Placing order...' : 'Place Order'}
      </button>
    </div>
  );
}
