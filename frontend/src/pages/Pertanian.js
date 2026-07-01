import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, TruckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const Pertanian = () => {
  const [farms, setFarms] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [farmsRes, pricesRes] = await Promise.all([
          api.get('/agriculture/farm'),
          api.get('/agriculture/prices?limit=5')
        ]);
        setFarms(farmsRes.data.data || []);
        setPrices(pricesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching agriculture data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🌾 Pasar Tani Digital</h1>
          <p className="text-gray-500">Jual beli hasil pertanian</p>
        </div>
        <Link to="/agriculture/farms/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Tambah Lahan
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <span className="text-2xl block">🌱</span>
          <p className="text-2xl font-bold">{farms.length}</p>
          <p className="text-sm text-gray-500">Lahan</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <span className="text-2xl block">🌾</span>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Komoditas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <TruckIcon className="w-6 h-6 text-blue-500 mx-auto" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Panen</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <CurrencyDollarIcon className="w-6 h-6 text-purple-500 mx-auto" />
          <p className="text-2xl font-bold">Rp0</p>
          <p className="text-sm text-gray-500">Pendapatan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold">🌱 Lahan Saya</div>
          <div className="divide-y divide-gray-100">
            {farms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada lahan</div>
            ) : (
              farms.map(farm => (
                <div key={farm.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <p className="font-medium">{farm.name}</p>
                  <p className="text-sm text-gray-500">📍 {farm.location} • {farm.area} Ha</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold">📊 Harga Pasaran</div>
          <div className="divide-y divide-gray-100">
            {prices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada data harga</div>
            ) : (
              prices.map(price => (
                <div key={price.id} className="px-6 py-4 hover:bg-gray-50 transition flex justify-between">
                  <div>
                    <p className="font-medium">{price.commodity}</p>
                    <p className="text-sm text-gray-500">{price.market}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rp{price.price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">/{price.unit}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pertanian;