import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const price = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-3 flex flex-col"
    >
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-44 object-cover rounded-md mb-3 bg-gray-100"
        loading="lazy"
      />
      <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
      <div className="flex items-center gap-2 mt-auto">
        <span className="font-semibold text-brand-700">${Number(price).toFixed(2)}</span>
        {hasDiscount && (
          <span className="text-xs text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
        )}
      </div>
      <div className="text-xs text-yellow-500 mt-1">
        {'★'.repeat(Math.round(product.avg_rating || 0))}{'☆'.repeat(5 - Math.round(product.avg_rating || 0))}
        <span className="text-gray-400 ml-1">({product.review_count || 0})</span>
      </div>
    </Link>
  );
}
