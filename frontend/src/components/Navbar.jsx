import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-brand-600">ShopSphere</Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link to="/products" className="hover:text-brand-600">Shop</Link>
          {user && <Link to="/orders" className="hover:text-brand-600">Orders</Link>}
          {isAdmin && <Link to="/admin" className="hover:text-brand-600">Admin</Link>}

          <Link to="/cart" className="relative hover:text-brand-600">
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-xs rounded-full px-1.5">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-gray-500 hover:text-red-600"
            >
              Logout ({user.first_name})
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:text-brand-600">Login</Link>
              <Link to="/register" className="bg-brand-600 text-white px-3 py-1.5 rounded-md hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
