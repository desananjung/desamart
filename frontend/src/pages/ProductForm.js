// frontend/src/pages/ProductForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        const product = response.data.data;
        setForm({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          categoryId: product.categoryId || '',
          imageUrl: product.imageUrl || ''
        });
        if (product.imageUrl) {
          setImagePreview(product.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  // ============================================
  // HANDLE IMAGE UPLOAD
  // ============================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    // Validasi ukuran
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB');
      return;
    }

    // Validasi tipe
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format gambar tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ============================================
  // DRAG & DROP HANDLERS
  // ============================================
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await api.post('/upload/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.data.imageUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal upload gambar. Silakan coba lagi.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setForm({ ...form, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================
  // SUBMIT FORM
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.imageUrl;

      // Upload image if new file selected
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setLoading(false);
          return;
        }
      }

      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
        imageUrl: imageUrl
      };

      let response;
      if (id) {
        response = await api.put(`/products/${id}`, data);
      } else {
        response = await api.post('/products', data);
      }

      if (response.data.success) {
        alert(id ? '✅ Produk berhasil diupdate!' : '✅ Produk berhasil ditambahkan!');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {id ? '✏️ Edit Produk' : '📦 Tambah Produk'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ============================================ */}
          {/* IMAGE UPLOAD - DRAG & DROP */}
          {/* ============================================ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Gambar Produk
            </label>
            
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative">
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                >
                  ✕
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mx-auto"></div>
                      <p className="mt-2 text-sm">Mengupload...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Drop Zone
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-5xl">📤</span>
                  <p className="text-gray-600 font-medium">
                    {dragActive ? 'Lepaskan untuk upload' : 'Seret & letakkan gambar di sini'}
                  </p>
                  <p className="text-sm text-gray-400">atau</p>
                  <label className="cursor-pointer bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
                    <span>Pilih Gambar</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Maks 5MB • JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* FORM FIELDS */}
          {/* ============================================ */}
          
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan nama produk"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan deskripsi produk"
            />
          </div>

          {/* Harga & Stok */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga (Rp) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ============================================ */}
          {/* ACTION BUTTONS */}
          {/* ============================================ */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span>
                  {uploading ? 'Mengupload gambar...' : 'Menyimpan...'}
                </span>
              ) : (
                id ? '✏️ Update Produk' : '📦 Tambah Produk'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium">💡 Tips Upload Gambar:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
              <li>Gunakan gambar dengan resolusi minimal 300x300px</li>
              <li>Format gambar: JPG, PNG, GIF, WEBP</li>
              <li>Maksimal ukuran file 5MB</li>
              <li>Gambar akan otomatis di-crop ke rasio 1:1</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;