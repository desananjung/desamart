import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MagnifyingGlassIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cartLoading, setCartLoading] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    if (!user) {
      navigate('/login', { state: { from: '/marketplace' } });
      return;
    }

    setCartLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post('/cart/items', { productId, quantity: 1 });
      alert('✅ Produk ditambahkan ke keranjang!');
    } catch (error) {
      if (error.response?.status === 403) {
        alert('🔒 Silakan login sebagai pembeli untuk menambahkan ke keranjang');
        navigate('/login', { state: { from: '/marketplace' } });
      } else {
        alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
      }
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const buyNow = (productId) => {
    if (!user) {
      navigate('/login', { state: { from: '/marketplace' } });
      return;
    }
    // Tambahkan ke keranjang lalu redirect ke checkout
    addToCart(productId);
    setTimeout(() => navigate('/checkout'), 500);
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🛒 Marketplace</h1>
          <p className="text-gray-500">Jual beli produk dengan mudah</p>
        </div>
        <Link to="/products/new" className="btn-primary">
          + Tambah Produk
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {search ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              {/* Product Image */}
              <Link to={`/product/${product.id}`} className="block">
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                  {/* Wishlist Button */}
                  <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white shadow-sm">
                    <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500 transition" />
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold hover:text-primary transition line-clamp-2">{product.name}</h3>
                </Link>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ⭐ 4.5
                  </span>
                  <span className="text-xs text-gray-400">Terjual 50+</span>
                </div>

                <p className="text-primary font-bold text-xl mt-1">
                  Rp{product.price?.toLocaleString()}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                  <span className="text-xs text-gray-400">{product.category?.name}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={cartLoading[product.id] || product.stock === 0}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {cartLoading[product.id] ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-4 h-4" />
                        Keranjang
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => buyNow(product.id)}
                    disabled={product.stock === 0}
                    className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
                  >
                    {product.stock === 0 ? 'Habis' : 'Beli'}
                  </button>
                </div>

                {product.stock === 0 && (
                  <p className="text-xs text-red-500 text-center mt-2">Stok Habis</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Marketplace;