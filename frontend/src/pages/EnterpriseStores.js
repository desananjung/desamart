import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EnterpriseStores = () => {
  const [stores, setStores] = useState([]);
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    storeId: '',
    name: ''
  });
  const [searchStore, setSearchStore] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [userStores, setUserStores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enterpriseRes, storesRes] = await Promise.all([
          api.get('/enterprise'),
          api.get('/seller/stores') // Ambil toko milik user
        ]);
        
        const data = enterpriseRes.data.data;
        if (data) {
          setEnterprise(data);
          setStores(data.stores || []);
        }
        
        setUserStores(storesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching enterprise stores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search store by name
  useEffect(() => {
    if (searchStore.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = userStores.filter(store =>
      store.name?.toLowerCase().includes(searchStore.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchStore.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchStore, userStores]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    
    if (!selectedStore) {
      alert('Pilih toko terlebih dahulu');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/enterprise/${enterprise.id}/stores`, {
        storeId: selectedStore.id,
        name: form.name || selectedStore.name
      });
      
      alert('✅ Toko berhasil ditambahkan ke enterprise!');
      setShowModal(false);
      setSelectedStore(null);
      setSearchStore('');
      setForm({ storeId: '', name: '' });
      
      // Refresh data
      const res = await api.get('/enterprise');
      const data = res.data.data;
      if (data) {
        setStores(data.stores || []);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan toko');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">🏪 Toko Enterprise</h1>
          <p className="text-gray-500">Kelola semua toko dalam enterprise</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Toko
        </button>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">🏪</span>
          <h3 className="text-xl font-semibold">Belum Ada Toko</h3>
          <p className="text-gray-500 mt-2">Tambahkan toko ke enterprise</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{item.store?.name || item.name}</h3>
                  <p className="text-sm text-gray-500">{item.store?.address || '-'}</p>
                  <p className="text-sm text-gray-500">📞 {item.store?.phone || '-'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.isActive)}`}>
                  {item.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Bergabung: {new Date(item.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Toko */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🏪 Tambah Toko</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedStore(null);
                  setSearchStore('');
                  setForm({ storeId: '', name: '' });
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStore} className="space-y-4">
              {/* Cari Toko */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari Toko *
                </label>
                <input
                  type="text"
                  placeholder="Cari nama toko..."
                  value={searchStore}
                  onChange={(e) => setSearchStore(e.target.value)}
                  className="input-field"
                />
                
                {/* Hasil Pencarian */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((store) => (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => {
                          setSelectedStore(store);
                          setSearchStore(store.name);
                          setForm({ ...form, storeId: store.id, name: store.name });
                          setSearchResults([]);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                          selectedStore?.id === store.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                        }`}
                      >
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-gray-500">{store.address || 'Tidak ada alamat'}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedStore && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    ✅ Dipilih: {selectedStore.name}
                  </div>
                )}
              </div>

              {/* Nama di Enterprise (Opsional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama di Enterprise (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Nama toko di enterprise"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Kosongkan untuk menggunakan nama toko asli
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting || !selectedStore}
                  className="btn-primary flex-1 py-2.5"
                >
                  {submitting ? 'Menambahkan...' : '➕ Tambah Toko'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedStore(null);
                    setSearchStore('');
                    setForm({ storeId: '', name: '' });
                  }}
                  className="btn-secondary px-6 py-2.5"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseStores;