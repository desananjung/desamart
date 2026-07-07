import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  DocumentIcon, 
  PlusIcon, 
  BanknotesIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VillageAdminProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'TEMPLATE_SURAT',
    price: '',
    fileUrl: '',
    imageUrl: '',
    category: 'Administrasi',
    sample: '',
    duration: '',
    level: 'Pemula',
    serviceTime: '',
    includes: ''
  });

  const productTypes = [
    { value: 'TEMPLATE_SURAT', label: '📄 Template Surat', icon: DocumentIcon },
    { value: 'FORMAT_APBDES', label: '📊 Format APBDes', icon: BanknotesIcon },
    { value: 'EBOOK_ADMIN', label: '📚 Ebook Administrasi', icon: BookOpenIcon },
    { value: 'JASA_DOKUMEN', label: '✍️ Jasa Pembuatan Dokumen', icon: ClipboardDocumentListIcon },
    { value: 'KURSUS_ONLINE', label: '🎓 Kursus Online', icon: AcademicCapIcon }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/desa-admin/products');
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching admin products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/desa-admin/products', form);
      alert('✅ Produk berhasil ditambahkan!');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        type: 'TEMPLATE_SURAT',
        price: '',
        fileUrl: '',
        imageUrl: '',
        category: 'Administrasi',
        sample: '',
        duration: '',
        level: 'Pemula',
        serviceTime: '',
        includes: ''
      });
      const res = await api.get('/desa-admin/products');
      setProducts(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan produk');
    }
  };

  const getTypeIcon = (type) => {
    const found = productTypes.find(t => t.value === type);
    return found ? found.icon : DocumentIcon;
  };

  const getTypeLabel = (type) => {
    const found = productTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

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
          <h1 className="text-2xl font-bold">📋 Administrasi Desa</h1>
          <p className="text-gray-500">Template surat, APBDes, ebook, jasa, dan kursus</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Produk
          </button>
        )}
      </div>

      {/* Form Tambah Produk */}
      {showForm && user?.role === 'ADMIN' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">📝 Tambah Produk Administrasi</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Produk *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field"
              >
                {productTypes.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                  placeholder="Administrasi, Keuangan, dll"
                />
              </div>
            </div>

            {(form.type === 'TEMPLATE_SURAT' || form.type === 'FORMAT_APBDES' || form.type === 'EBOOK_ADMIN') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL File</label>
                <input
                  type="url"
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://drive.google.com/file/xxx"
                />
              </div>
            )}

            {form.type === 'JASA_DOKUMEN' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Pengerjaan</label>
                  <input
                    type="text"
                    value={form.serviceTime}
                    onChange={(e) => setForm({ ...form, serviceTime: e.target.value })}
                    className="input-field"
                    placeholder="3-5 hari kerja"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yang Termasuk</label>
                  <textarea
                    value={form.includes}
                    onChange={(e) => setForm({ ...form, includes: e.target.value })}
                    className="input-field"
                    rows="2"
                    placeholder="Konsultasi, Revisi, Finalisasi"
                  />
                </div>
              </>
            )}

            {form.type === 'KURSUS_ONLINE' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="input-field"
                      placeholder="4 minggu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="input-field"
                    >
                      <option value="Pemula">Pemula</option>
                      <option value="Menengah">Menengah</option>
                      <option value="Mahir">Mahir</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sample/Contoh</label>
                  <input
                    type="url"
                    value={form.sample}
                    onChange={(e) => setForm({ ...form, sample: e.target.value })}
                    className="input-field"
                    placeholder="URL contoh hasil"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Produk */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <DocumentIcon className="w-20 h-20 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold mt-4">Belum Ada Produk Administrasi</h3>
          <p className="text-gray-500 mt-2">Tambahkan produk administrasi desa</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => {
            const TypeIcon = getTypeIcon(product.type);
            return (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeIcon className="w-5 h-5 text-primary" />
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{getTypeLabel(product.type)}</span>
                    <span className="text-xs text-gray-400">{product.category}</span>
                  </div>
                  <h3 className="font-bold">{product.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  
                  {product.type === 'JASA_DOKUMEN' && product.serviceTime && (
                    <p className="text-xs text-gray-500 mt-1">⏱️ {product.serviceTime}</p>
                  )}
                  {product.type === 'KURSUS_ONLINE' && product.duration && (
                    <p className="text-xs text-gray-500 mt-1">📚 {product.duration} • {product.level}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-primary">
                      {product.price > 0 ? `Rp${product.price.toLocaleString()}` : 'Gratis'}
                    </p>
                    <Link
                      to={`/village/admin-products/${product.id}`}
                      className="btn-primary text-sm py-1.5 px-4"
                    >
                      {product.type === 'JASA_DOKUMEN' ? 'Pesan Jasa' : 
                       product.type === 'KURSUS_ONLINE' ? 'Daftar Kursus' : 'Lihat Detail'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VillageAdminProducts;