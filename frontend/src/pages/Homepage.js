import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/admin/categories')
        ]);
        setProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const banners = [
    { id: 1, title: 'Flash Sale', subtitle: 'Diskon up to 70%', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { id: 2, title: 'Elektronik', subtitle: 'Gadget terbaru', color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { id: 3, title: 'Fashion', subtitle: 'Trend terbaru', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`${banner.color} rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-300`}
          >
            <h3 className="text-2xl font-bold">{banner.title}</h3>
            <p className="text-sm opacity-90">{banner.subtitle}</p>
            <button className="mt-4 bg-white/20 px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition">
              Belanja Sekarang →
            </button>
          </div>
        ))}
      </div>

      {/* Kategori */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Kategori Populer</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Produk Terbaru */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produk Terbaru</h2>
          <Link to="/products" className="text-primary hover:underline">Lihat Semua →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                <p className="text-primary font-bold mt-1">Rp{product.price?.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-xs text-gray-500 ml-1">4.5 (120)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;