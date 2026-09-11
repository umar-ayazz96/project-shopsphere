import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { search, category, sort, page } })
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          defaultValue={search}
          placeholder="Search products..."
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
          className="border rounded-md px-3 py-2 flex-1 min-w-[200px]"
        />
        <select value={category} onChange={(e) => updateParam('category', e.target.value)} className="border rounded-md px-3 py-2">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="border rounded-md px-3 py-2">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateParam('page', String(p))}
                className={`px-3 py-1 rounded-md border ${String(p) === page ? 'bg-brand-600 text-white' : 'bg-white'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
