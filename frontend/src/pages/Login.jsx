import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold mb-6 text-center">Log in to ShopSphere</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="email" required placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded-md px-3 py-2" />
        <input type="password" required placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded-md px-3 py-2" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700">Log in</button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        No account? <Link to="/register" className="text-brand-600 font-medium">Sign up</Link>
      </p>
    </div>
  );
}
