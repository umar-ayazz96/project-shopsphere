import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold mb-6 text-center">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input required placeholder="First name" value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-1/2 border rounded-md px-3 py-2" />
          <input required placeholder="Last name" value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-1/2 border rounded-md px-3 py-2" />
        </div>
        <input type="email" required placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded-md px-3 py-2" />
        <input type="password" required placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded-md px-3 py-2" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700">Sign up</button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  );
}
