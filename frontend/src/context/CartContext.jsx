import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    const { data } = await api.get('/cart');
    setItems(data.items);
    setSubtotal(data.subtotal);
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post('/cart', { productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await refreshCart();
  };

  return (
    <CartContext.Provider value={{ items, subtotal, addToCart, updateQuantity, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
