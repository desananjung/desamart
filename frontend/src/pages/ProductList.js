import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProductList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📦 Fetching products...');
        const res = await api.get('/products');
        console.log('✅ Products response:', res.data);
        
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError(err.message || 'Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    if (!user) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    try {
      await api.post('/cart/items', { productId, quantity: 1 });
      alert('✅ Produk ditambahkan ke keranjang!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">❌ Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary mt-4"
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">📦</span>
        <h2 className="text-2xl font-bold">Belum Ada Produk</h2>
        <p className="text-gray-500 mt-2">Mulai jual produk Anda sekarang!</p>
        {user && (user.role === 'SELLER' || user.role === 'ADMIN') && (
          <Link to="/products/new" className="btn-primary inline-block mt-4">
            + Tambah Produk
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Produk DesaMart</h1>
        {user && (user.role === 'SELLER' || user.role === 'ADMIN') && (
          <Link to="/products/new" className="btn-primary">
            + Tambah Produk
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <Link to={`/product/${product.id}`}>
              <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://picsum.photos/seed/1/300/200';
                    }}
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-lg hover:text-primary transition line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              <p className="text-primary font-bold text-xl mt-1">
                Rp{product.price?.toLocaleString()}
              </p>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>Stok: {product.stock}</span>
                <span>•</span>
                <span>{product.category?.name || 'Tanpa Kategori'}</span>
              </div>
              
              <p className="text-xs text-gray-400 mt-1">
                Seller: {product.seller?.name}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                {user ? (
                  <>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="flex-1 btn-secondary text-sm py-1.5"
                    >
                      🛒 Keranjang
                    </button>
                    <Link 
                      to={`/product/${product.id}`} 
                      className="flex-1 btn-primary text-sm py-1.5 text-center"
                    >
                      Lihat
                    </Link>
                  </>
                ) : (
                  <button 
                    onClick={() => navigate('/login', { state: { from: '/products' } })}
                    className="w-full btn-primary text-sm py-1.5"
                  >
                    🔑 Login untuk Beli
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;