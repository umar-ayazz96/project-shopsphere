import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products?sort=rating&limit=8').then((res) => setFeatured(res.data.products));
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Everything you need, delivered fast.</h1>
          <p className="text-brand-50 mb-6">Electronics, home goods, fashion and more — all in one place.</p>
          <Link to="/products" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-md hover:bg-brand-50">
            Shop now
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-semibold mb-4">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition"
            >
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-400">{c.product_count} items</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">Top rated products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
