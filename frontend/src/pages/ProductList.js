// frontend/src/pages/ProductList.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ============================================
// HELPER FUNCTIONS UNTUK GAMBAR
// ============================================

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // ✅ CEK: Jika path lokal, return null
  if (imageUrl.startsWith('C:') || 
      imageUrl.startsWith('file://') || 
      imageUrl.includes('Downloads') ||
      imageUrl.includes('Users') ||
      imageUrl.includes('desktop') ||
      imageUrl.includes('Desktop')) {
    console.log(`⚠️ Local path detected, using placeholder: ${imageUrl}`);
    return null;
  }

  // Jika sudah absolute URL (http atau https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Jika relative URL (dimulai dengan /)
  if (imageUrl.startsWith('/')) {
    const baseURL = api.defaults.baseURL || 'https://73e9-182-10-130-155.ngrok-free.app/api';
    const baseWithoutApi = baseURL.replace('/api', '');
    return baseWithoutApi + imageUrl;
  }

  // Jika path seperti "uploads/xxx.jpg"
  if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
    const baseURL = api.defaults.baseURL || 'https://73e9-182-10-130-155.ngrok-free.app/api';
    const baseWithoutApi = baseURL.replace('/api', '');
    return baseWithoutApi + '/' + imageUrl;
  }

  return imageUrl;
};

const getDisplayImageUrl = (imageUrl) => {
  const fullUrl = getFullImageUrl(imageUrl);
  return fullUrl || 'https://via.placeholder.com/300x300?text=No+Image';
};

const getPlaceholderImage = (productName) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9FF3', '#54A0FF'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initial = productName ? productName.charAt(0).toUpperCase() : '?';
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='${randomColor.replace('#', '%23')}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='120' fill='white' font-weight='bold' font-family='sans-serif'%3E${initial}%3C/text%3E%3C/svg%3E`;
};

// ============================================
// MAIN COMPONENT
// ============================================

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
        
        if (res.data.data && res.data.data.length > 0) {
          console.log('📸 Sample image URL:', res.data.data[0].imageUrl);
          console.log('📸 Full image URL:', getFullImageUrl(res.data.data[0].imageUrl));
        }
        
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

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">❌ Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mt-4"
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">📦</span>
        <h2 className="text-2xl font-bold">Belum Ada Produk</h2>
        <p className="text-gray-500 mt-2">Mulai jual produk Anda sekarang!</p>
        {user && (user.role === 'SELLER' || user.role === 'ADMIN') && (
          <Link to="/products/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-block mt-4">
            + Tambah Produk
          </Link>
        )}
      </div>
    );
  }

  // Product List
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">📦 Produk DesaMart</h1>
        {user && (user.role === 'SELLER' || user.role === 'ADMIN') && (
          <Link to="/products/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            + Tambah Produk
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const imageUrl = getDisplayImageUrl(product.imageUrl);
          const placeholderImage = getPlaceholderImage(product.name);
          // Ambil nama store
          const storeName = product.store?.name || 
                            product.seller?.store?.name || 
                            product.storeName ||
                            'Toko Makmur';
          
          return (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <Link to={`/product/${product.id}`}>
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImage;
                    }}
                    loading="lazy"
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-lg hover:text-blue-600 transition line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-blue-600 font-bold text-xl mt-1">
                  Rp{product.price?.toLocaleString()}
                </p>
                
                {/* ✅ TAMPILKAN NAMA TOKO / UMKM */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">
                    🏪 {storeName}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>Stok: {product.stock}</span>
                  <span>•</span>
                  <span>{product.category?.name || 'Tanpa Kategori'}</span>
                </div>
                
                <p className="text-xs text-gray-400 mt-1 truncate">
                  Seller: {product.seller?.name || 'Toko Makmur'}
                </p>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="flex-1 bg-gray-100 text-gray-700 text-sm py-1.5 rounded-lg hover:bg-gray-200 transition"
                      >
                        🛒 Keranjang
                      </button>
                      <Link 
                        to={`/product/${product.id}`} 
                        className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 transition text-center"
                      >
                        Lihat
                      </Link>
                    </>
                  ) : (
                    <button 
                      onClick={() => navigate('/login', { state: { from: '/products' } })}
                      className="w-full bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 transition"
                    >
                      🔑 Login untuk Beli
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Products */}
      <div className="text-center text-gray-500 text-sm mt-6">
        Menampilkan {products.length} produk
      </div>
    </div>
  );
};

export default ProductList;