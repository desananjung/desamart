import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

const AgricultureFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await api.get('/agriculture/farms');
        setFarms(res.data.data || []);
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">🌱 Lahan Pertanian</h1>
          <p className="text-gray-500">Kelola lahan pertanian Anda</p>
        </div>
        <Link to="/agriculture/farms/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Tambah Lahan
        </Link>
      </div>

      {farms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">🌱</span>
          <h3 className="text-xl font-semibold">Belum Ada Lahan</h3>
          <p className="text-gray-500 mt-2">Tambahkan lahan pertanian pertama Anda</p>
          <Link to="/agriculture/farms/new" className="btn-primary inline-block mt-4">
            + Tambah Lahan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">{farm.name}</h3>
              <p className="text-sm text-gray-500">📍 {farm.location}</p>
              <p className="text-sm text-gray-500">📐 {farm.area} Ha</p>
              <p className="text-xs text-gray-400 mt-2">
                {farm.commodities?.length || 0} komoditas
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgricultureFarms;