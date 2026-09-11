import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

  const loadProduct = () => {
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data);
      setActiveImage(res.data.image_url);
    });
  };

  useEffect(loadProduct, [slug]);

  if (!product) return <div className="max-w-6xl mx-auto px-4 py-10 text-gray-400">Loading...</div>;

  const price = product.discount_price ?? product.price;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not add to cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    await api.post('/reviews', { productId: product.id, ...reviewForm });
    setReviewForm({ rating: 5, title: '', comment: '' });
    loadProduct();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div>
        <img src={activeImage} alt={product.name} className="w-full h-96 object-cover rounded-lg bg-gray-100" />
        <div className="flex gap-2 mt-3">
          {[product.image_url, ...product.images.map((i) => i.image_url)].map((img, idx) => (
            <button key={idx} onClick={() => setActiveImage(img)}>
              <img src={img} className="w-16 h-16 object-cover rounded-md border" alt="" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-brand-600 uppercase tracking-wide">{product.category_name}</p>
        <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
        <div className="text-yellow-500 text-sm mt-2">
          {'★'.repeat(Math.round(product.avg_rating || 0))}{'☆'.repeat(5 - Math.round(product.avg_rating || 0))}
          <span className="text-gray-400 ml-1">({product.review_count} reviews)</span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-2xl font-bold text-brand-700">${Number(price).toFixed(2)}</span>
          {product.discount_price && (
            <span className="text-gray-400 line-through">${Number(product.price).toFixed(2)}</span>
          )}
        </div>

        <p className="text-gray-600 mt-4">{product.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
        </p>

        <div className="flex items-center gap-3 mt-6">
          <input
            type="number" min="1" max={product.stock_quantity} value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
            className="w-20 border rounded-md px-2 py-2"
          />
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
          >
            Add to Cart
          </button>
          {message && <span className="text-sm text-green-600">{message}</span>}
        </div>

        <div className="mt-10">
          <h2 className="font-semibold mb-3">Customer Reviews</h2>
          <div className="space-y-3 mb-6">
            {product.reviews.length === 0 && <p className="text-sm text-gray-400">No reviews yet.</p>}
            {product.reviews.map((r) => (
              <div key={r.id} className="border rounded-md p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{r.first_name} {r.last_name}</span>
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                </div>
                {r.title && <p className="font-medium text-sm mt-1">{r.title}</p>}
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>

          {user && (
            <form onSubmit={handleReviewSubmit} className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium">Leave a review</p>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="border rounded-md px-2 py-1"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
              </select>
              <input
                placeholder="Title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="border rounded-md px-2 py-1 w-full"
              />
              <textarea
                placeholder="Your thoughts..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="border rounded-md px-2 py-1 w-full"
              />
              <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm">Submit review</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
