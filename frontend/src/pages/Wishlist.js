import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { HeartIcon } from '@heroicons/react/24/solid';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/buyer/wishlist');
        setItems(res.data.data || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await api.post('/buyer/wishlist/toggle', { productId });
      setItems(items.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="w-20 h-20 text-gray-300 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Wishlist Kosong</h2>
        <p className="text-gray-500 mt-2">Mulai tambahkan produk favoritmu!</p>
        <Link to="/products" className="btn-primary inline-block mt-4">Belanja Sekarang</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">❤️ Wishlist Saya</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
            <Link to={`/product/${item.product.id}`}>
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/product/${item.product.id}`}>
                <h3 className="font-semibold hover:text-primary">{item.product.name}</h3>
              </Link>
              <p className="text-primary font-bold mt-1">Rp{item.product.price?.toLocaleString()}</p>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="mt-3 text-red-500 text-sm hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;