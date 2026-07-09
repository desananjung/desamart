// frontend/src/pages/ProductForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Konversi URL relative ke absolute
 */
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
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
  
  // Jika masih local path (file:// atau C:)
  if (imageUrl.startsWith('file://') || imageUrl.startsWith('C:')) {
    return null;
  }
  
  return imageUrl;
};

/**
 * Dapatkan URL gambar untuk ditampilkan (dengan fallback)
 */
const getDisplayImageUrl = (imageUrl) => {
  const fullUrl = getFullImageUrl(imageUrl);
  return fullUrl || 'https://via.placeholder.com/300x300?text=No+Image';
};

// ============================================
// MAIN COMPONENT
// ============================================

const ProductForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ============================================
  // FETCH CATEGORIES
  // ============================================

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      console.log('📂 Fetching categories...');
      const response = await api.get('/categories');
      console.log('📥 Categories response:', response.data);
      
      let categoriesData = [];
      
      if (response.data) {
        // Format 1: { success: true, data: [...] }
        if (response.data.success === true && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
          console.log('✅ Format 1 (success: true):', categoriesData.length);
        }
        // Format 2: { status: 'success', data: [...] }
        else if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
          console.log('✅ Format 2 (status: success):', categoriesData.length);
        }
        // Format 3: langsung array
        else if (Array.isArray(response.data)) {
          categoriesData = response.data;
          console.log('✅ Format 3 (array):', categoriesData.length);
        }
        // Format 4: { data: [...] } tanpa success/status
        else if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
          console.log('✅ Format 4 (data only):', categoriesData.length);
        }
      }
      
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
        console.log('✅ Categories loaded:', categoriesData.length);
      } else {
        console.warn('⚠️ No categories found, using fallback');
        setCategories(getFallbackCategories());
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories(getFallbackCategories());
    } finally {
      setLoadingCategories(false);
    }
  };

  const getFallbackCategories = () => [
    { id: 1, name: 'Makanan & Minuman' },
    { id: 2, name: 'Fashion' },
    { id: 3, name: 'Elektronik' },
    { id: 4, name: 'Kerajinan' },
    { id: 5, name: 'Pertanian' },
    { id: 6, name: 'Kesehatan & Kecantikan' },
    { id: 7, name: 'Peralatan Rumah Tangga' },
    { id: 8, name: 'Otomotif' },
    { id: 9, name: 'Lainnya' }
  ];

  // ============================================
  // FETCH PRODUCT (untuk edit)
  // ============================================

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
          const fullUrl = getFullImageUrl(product.imageUrl);
          setImagePreview(fullUrl || '');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      alert('Gagal mengambil data produk');
    }
  };

  // ============================================
  // IMAGE HANDLING
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

    // Validasi tipe file
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

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setForm({ ...form, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================
// UPLOAD IMAGE - VERSI FINAL
// ============================================
const uploadImage = async () => {
  if (!imageFile) return null;

  setUploading(true);
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    console.log('📤 Uploading image:', imageFile.name);
    
    const response = await api.post('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('📥 Upload Response:', response.data);

    // ============================================
    // HANDLE RESPONSE - SUPPORT MULTIPLE FORMATS
    // ============================================
    let imageUrl = null;
    
    // Format 1: { success: true, data: { imageUrl: '...' } }
    if (response.data.success && response.data.data?.imageUrl) {
      imageUrl = response.data.data.imageUrl;
      console.log('✅ Format 1 (success.data.imageUrl):', imageUrl);
    }
    // Format 2: { success: true, imageUrl: '...' }
    else if (response.data.success && response.data.imageUrl) {
      imageUrl = response.data.imageUrl;
      console.log('✅ Format 2 (success.imageUrl):', imageUrl);
    }
    // Format 3: { imageUrl: '...' }
    else if (response.data.imageUrl) {
      imageUrl = response.data.imageUrl;
      console.log('✅ Format 3 (imageUrl):', imageUrl);
    }
    // Format 4: { data: { imageUrl: '...' } }
    else if (response.data.data?.imageUrl) {
      imageUrl = response.data.data.imageUrl;
      console.log('✅ Format 4 (data.imageUrl):', imageUrl);
    }
    // Format 5: { url: '...' }
    else if (response.data.url) {
      imageUrl = response.data.url;
      console.log('✅ Format 5 (url):', imageUrl);
    }
    // Format 6: langsung string
    else if (typeof response.data === 'string') {
      imageUrl = response.data;
      console.log('✅ Format 6 (string):', imageUrl);
    }
    // Format 7: data langsung string
    else if (typeof response.data.data === 'string') {
      imageUrl = response.data.data;
      console.log('✅ Format 7 (data string):', imageUrl);
    }
    else {
      // Coba ekstrak URL dari response
      console.warn('⚠️ Unknown response format:', response.data);
      const stringified = JSON.stringify(response.data);
      const urlMatch = stringified.match(/\/uploads\/[^\s"']+/);
      if (urlMatch) {
        imageUrl = urlMatch[0];
        console.log('✅ Extracted URL from response:', imageUrl);
      }
    }

    // ============================================
    // ✅ VALIDASI URL
    // ============================================
    if (imageUrl) {
      // Jika URL masih path lokal (C: atau file://)
      if (imageUrl.startsWith('C:') || 
          imageUrl.startsWith('file://') || 
          imageUrl.includes('Downloads') ||
          imageUrl.includes('Users')) {
        console.warn('⚠️ Local path detected, ignoring:', imageUrl);
        return null;
      }
      
      // Pastikan URL dimulai dengan /
      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = '/' + imageUrl;
      }
      
      console.log('✅ Final image URL:', imageUrl);
      return imageUrl;
    } else {
      console.error('❌ Failed to extract image URL');
      toast.error('Gagal upload gambar: Format response tidak dikenali');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('❌ Response:', error.response?.data);
    
    if (error.response?.status === 413) {
      toast.error('Ukuran file terlalu besar (maks 5MB)');
    } else {
      toast.error(error.response?.data?.message || 'Gagal upload gambar');
    }
    return null;
  } finally {
    setUploading(false);
  }
};

  // ============================================
  // SUBMIT FORM
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📦 Menyimpan produk...');
      
      let imageUrl = form.imageUrl;

      // Upload gambar jika ada file baru
      if (imageFile) {
        console.log('📤 Mengupload gambar...');
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('✅ Gambar berhasil diupload:', imageUrl);
        } else {
          console.warn('⚠️ Upload gambar gagal');
          if (!form.imageUrl) {
            const lanjut = window.confirm('Gagal upload gambar. Lanjutkan tanpa gambar?');
            if (!lanjut) {
              setLoading(false);
              return;
            }
          }
        }
      }

      // Siapkan data produk
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
        imageUrl: imageUrl || ''
      };

      console.log('📤 Data produk:', data);

      // Simpan produk
      let response;
      if (id) {
        response = await api.put(`/products/${id}`, data);
      } else {
        response = await api.post('/products', data);
      }

      console.log('📥 Response:', response.data);

      if (response.data.success) {
        alert(id ? '✅ Produk berhasil diupdate!' : '✅ Produk berhasil ditambahkan!');
        navigate('/products');
      } else {
        alert(response.data.message || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('❌ Response error:', error.response?.data);
      alert(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {id ? '✏️ Edit Produk' : '📦 Tambah Produk'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Gambar Produk
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Error';
                    }}
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
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
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
                  <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            {loadingCategories ? (
              <div className="text-gray-500 text-sm py-2">Memuat kategori...</div>
            ) : (
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
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
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;