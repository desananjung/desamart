import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: '',
    maxPrice: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    // Fetch categories for filter
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        
        const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await api.get(url);
        setProducts(res.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

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

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h2>Loading produk...</h2>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Daftar Produk</h1>
        {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
          <Link to="/products/new">
            <button style={{ padding: '10px 20px' }}>+ Tambah Produk</button>
          </Link>
        )}
      </div>

      {/* Filter Section */}
      <div style={{ 
        background: 'white', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
          <input
            type="text"
            name="search"
            placeholder="Cari produk..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="number"
            name="minPrice"
            placeholder="Harga min"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Harga max"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 50, background: 'white', borderRadius: 8 }}>
          <h3>Belum ada produk</h3>
          <p>Mulai jual produk Anda sekarang!</p>
          {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
            <Link to="/products/new">
              <button>Tambah Produk Pertama</button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 20 
        }}>
          {products.map(product => (
            <div key={product.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: 8, 
              overflow: 'hidden',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: 200, 
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999'
                }}>
                  No Image
                </div>
              )}
              
              <div style={{ padding: 15 }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
                <p style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  color: '#4CAF50',
                  margin: '5px 0'
                }}>
                  Rp{product.price.toLocaleString('id-ID')}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <span style={{ color: '#666' }}>Stok: </span>
                  <span style={{ fontWeight: 'bold' }}>{product.stock}</span>
                </p>
                <p style={{ margin: '5px 0', fontSize: 14, color: '#666' }}>
                  <span style={{ color: '#666' }}>Kategori: </span>
                  {product.category?.name || 'Tidak ada kategori'}
                </p>
                <p style={{ margin: '5px 0', fontSize: 14, color: '#666' }}>
                  <span style={{ color: '#666' }}>Seller: </span>
                  {product.seller?.name || 'Tidak diketahui'}
                </p>
                
                {product.description && (
                  <p style={{ 
                    margin: '10px 0', 
                    fontSize: 14, 
                    color: '#666',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>
                )}

                <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                  {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                    <>
                      <Link to={`/products/edit/${product.id}`} style={{ flex: 1 }}>
                        <button style={{ 
                          width: '100%', 
                          backgroundColor: '#2196F3',
                          padding: '8px'
                        }}>
                          Edit
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ 
                          flex: 1,
                          backgroundColor: '#f44336',
                          padding: '8px'
                        }}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                  {user?.role === 'BUYER' && (
                    <button 
                      onClick={async () => {
                        try {
                          await api.post('/cart/items', { 
                            productId: product.id, 
                            quantity: 1 
                          });
                          alert('Produk ditambahkan ke keranjang!');
                        } catch (error) {
                          alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
                        }
                      }}
                      style={{ 
                        width: '100%',
                        backgroundColor: '#FF9800',
                        padding: '8px'
                      }}
                    >
                      + Keranjang
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