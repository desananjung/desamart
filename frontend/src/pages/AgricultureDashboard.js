import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  // Gunakan ikon yang tersedia di Heroicons
  ChartBarIcon,
  PlusIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const AgricultureDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [prices, setPrices] = useState([]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🌾 Pasar Tani Digital</h1>
        <p className="text-gray-500 mt-1">Kelola hasil pertanian dan panen</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/agriculture/farms" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-2xl">🌱</span>
          </div>
          <p className="text-2xl font-bold mt-2">{farms.length}</p>
          <p className="text-sm text-gray-500">Lahan</p>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-2xl">🌾</span>
          </div>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500">Komoditas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
            <TruckIcon className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500">Panen</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold mt-2">Rp0</p>
          <p className="text-sm text-gray-500">Pendapatan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daftar Lahan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold">🌱 Lahan Saya</h3>
            <Link to="/agriculture/farms/new" className="text-sm text-primary hover:underline">
              + Tambah Lahan
            </Link>
          </div>
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

        {/* Harga Pasaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold">📊 Harga Pasaran</h3>
            <Link to="/agriculture/prices" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {prices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada data harga</div>
            ) : (
              prices.map(price => (
                <div key={price.id} className="px-6 py-3 hover:bg-gray-50 transition flex justify-between">
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

export default AgricultureDashboard;