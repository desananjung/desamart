import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const VillageMap = () => {
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await api.get('/village/economy');
        setVillages(res.data.data || []);
      } catch (error) {
        console.error('Error fetching villages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVillages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🗺️ Peta Ekonomi Desa</h1>
        <p className="text-gray-500">Temukan UMKM dan produk lokal di setiap desa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Desa */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-3">Desa Terdaftar</h3>
          <div className="space-y-2">
            {villages.map(village => (
              <button
                key={village.id}
                onClick={() => setSelectedVillage(village)}
                className={`w-full text-left px-4 py-3 rounded-xl transition ${
                  selectedVillage?.id === village.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="font-medium">{village.name}</p>
                <p className={`text-xs ${selectedVillage?.id === village.id ? 'text-white/70' : 'text-gray-500'}`}>
                  {village.district}, {village.regency}
                </p>
                <div className="flex gap-4 mt-1 text-xs">
                  <span>🏪 {village.umkm?.length || 0} UMKM</span>
                  <span>💰 Rp{(village.economy?.[0]?.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Desa */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {selectedVillage ? (
            <div>
              <h2 className="text-xl font-bold">{selectedVillage.name}</h2>
              <p className="text-gray-500 text-sm">{selectedVillage.district}, {selectedVillage.regency}</p>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedVillage.umkm?.length || 0}</p>
                  <p className="text-xs text-gray-500">UMKM</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-600">
                    Rp{(selectedVillage.economy?.[0]?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Pendapatan</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {(selectedVillage.economy?.[0]?.growthRate || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Pertumbuhan</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">🏪 UMKM di Desa Ini</h3>
                <div className="space-y-2">
                  {selectedVillage.umkm?.map(umkm => (
                    <Link
                      key={umkm.id}
                      to={`/umkm/${umkm.id}`}
                      className="block p-3 border border-gray-100 rounded-xl hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{umkm.name}</p>
                          <p className="text-sm text-gray-500">{umkm.category}</p>
                        </div>
                        <span className="text-sm text-primary">Lihat →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={`/products?village=${selectedVillage.id}`}
                  className="btn-primary w-full text-center"
                >
                  🛒 Belanja dari Desa Ini
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-4">🗺️</span>
              <p>Pilih desa untuk melihat detail ekonomi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VillageMap;