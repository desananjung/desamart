import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [villages, setVillages] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: '',
    maxPrice: ''
  });
  const [filterVillage, setFilterVillage] = useState('');
  const { user } = useAuth();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback ke admin endpoint
        try {
          const res2 = await api.get('/admin/categories');
          setCategories(res2.data.data || []);
        } catch (err) {
          console.error('Admin categories also failed:', err);
        }
      }
    };
    fetchCategories();
  }, []);

  // Fetch villages
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await api.get('/villages');
        setVillages(res.data.data || []);
      } catch (error) {
        console.error('Error fetching villages:', error);
      }
    };
    fetchVillages();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filterVillage) params.append('villageId', filterVillage);
        
        const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await api.get(url);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, filterVillage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      alert('Produk berhasil dihapus');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus produk');
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart/items', { 
        productId: productId, 
        quantity: 1 
      });
      alert('✅ Produk ditambahkan ke keranjang!');
    } catch (error) {
      if (error.response?.status === 403) {
        alert('🔒 Silakan login sebagai pembeli');
      } else {
        alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Daftar Produk</h1>
        {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
          <Link to="/products/new" className="btn-primary">
            + Tambah Produk
          </Link>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            name="search"
            placeholder="🔍 Cari produk..."
            value={filters.search}
            onChange={handleFilterChange}
            className="input-field"
          />
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={filterVillage}
            onChange={(e) => setFilterVillage(e.target.value)}
            className="input-field"
          >
            <option value="">Semua Desa</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <input
            type="number"
            name="minPrice"
            placeholder="Harga min"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="input-field"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Harga max"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="input-field"
          />
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📦</span>
          <h3 className="text-xl font-semibold text-gray-700">Belum ada produk</h3>
          <p className="text-gray-500 mt-2">Mulai jual produk Anda sekarang!</p>
          {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
            <Link to="/products/new" className="btn-primary inline-block mt-4">
              Tambah Produk Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              {/* Badge Produk Desa - hanya jika ada villageId */}
              {product.villageId && user?.villageId && product.villageId === user.villageId && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  🌾 Produk Desa
                </span>
              )}
              
              {/* Image */}
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="text-4xl">📦</span>
                </div>
              )}
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-primary font-bold text-xl mt-1">
                  Rp{product.price?.toLocaleString('id-ID')}
                </p>
                
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>Stok: {product.stock}</span>
                  <span>•</span>
                  <span>{product.category?.name || 'No Category'}</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  Seller: {product.seller?.name || 'Tidak diketahui'}
                </p>
                
                {product.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                    <>
                      <Link to={`/products/edit/${product.id}`} className="flex-1">
                        <button className="w-full bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition text-sm">
                          ✏️ Edit
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        🗑️ Hapus
                      </button>
                    </>
                  )}
                  {user?.role === 'BUYER' && product.stock > 0 && (
                    <button 
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition text-sm"
                    >
                      🛒 + Keranjang
                    </button>
                  )}
                  {user?.role === 'BUYER' && product.stock === 0 && (
                    <button className="w-full bg-gray-300 text-gray-500 px-3 py-1.5 rounded-lg cursor-not-allowed text-sm">
                      Stok Habis
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;