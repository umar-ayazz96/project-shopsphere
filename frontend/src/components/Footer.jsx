import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 flex justify-between flex-wrap gap-4">
        <p>&copy; {new Date().getFullYear()} ShopSphere. Demo project for portfolio purposes.</p>
        <p>Built with React &middot; Node.js &middot; PostgreSQL &middot; Docker &middot; Kubernetes</p>
      </div>
    </footer>
  );
}
