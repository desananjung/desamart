import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProductForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });

  // Cek login & role
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/products/new' } });
      return;
    }
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  // Fetch categories - gunakan endpoint public
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);
        // Gunakan endpoint public /api/categories
        const res = await api.get('/categories');
        console.log('📦 Categories fetched:', res.data.data);
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback: coba endpoint admin jika public gagal
        try {
          const res = await api.get('/admin/categories');
          setCategories(res.data.data || []);
        } catch (err) {
          console.error('Admin categories also failed:', err);
          // Jika semua gagal, gunakan kategori default
          setCategories([
            { id: 1, name: 'Makanan' },
            { id: 2, name: 'Minuman' },
            { id: 3, name: 'Fashion' },
            { id: 4, name: 'Elektronik' },
            { id: 5, name: 'Kerajinan' },
            { id: 6, name: 'Pertanian' },
            { id: 7, name: 'Lainnya' }
          ]);
        }
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const product = res.data.data;
          setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
            categoryId: product.categoryId || '',
            imageUrl: product.imageUrl || ''
          });
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi
    if (!form.name.trim()) {
      alert('Nama produk wajib diisi');
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      alert('Harga harus lebih dari 0');
      return;
    }
    if (!form.categoryId) {
      alert('Kategori wajib dipilih');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        categoryId: parseInt(form.categoryId)
      };

      if (id) {
        await api.put(`/products/${id}`, payload);
        alert('✅ Produk berhasil diperbarui!');
      } else {
        await api.post('/products', payload);
        alert('✅ Produk berhasil dibuat!');
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Tambah'} Produk</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Produk *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Deskripsi produk"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Harga *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stok</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.length === 0 ? (
                <option value="" disabled>Belum ada kategori</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            {categories.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                ⚠️ Belum ada kategori. Hubungi admin untuk menambah kategori.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Gambar</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
            {form.imageUrl && (
              <div className="mt-2">
                <img 
                  src={form.imageUrl} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-2.5"
            >
              {loading ? 'Menyimpan...' : '💾 Simpan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn-secondary px-8 py-2.5"
            >
              Batal
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;