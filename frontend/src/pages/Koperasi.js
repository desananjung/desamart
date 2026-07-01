import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { UsersIcon, BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const Koperasi = () => {
  const [cooperative, setCooperative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCooperative = async () => {
      try {
        const res = await api.get('/koperasi/status');
        setCooperative(res.data.data);
      } catch (error) {
        console.error('Error fetching cooperative:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCooperative();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!cooperative) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🏛️</span>
        <h2 className="text-2xl font-bold">Koperasi Digital</h2>
        <p className="text-gray-500 mt-2">Daftarkan koperasi Anda</p>
        <Link to="/koperasi/register" className="btn-primary inline-block mt-4">
          📝 Daftar Koperasi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🏛️ {cooperative.name}</h1>
          <p className="text-gray-500">{cooperative.type} • {cooperative.status}</p>
        </div>
        <Link to="/koperasi/members" className="btn-secondary">
          👥 Kelola Anggota
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Anggota</p>
            <p className="text-2xl font-bold">{cooperative.members?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Simpanan</p>
            <p className="text-2xl font-bold">Rp0</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pinjaman Aktif</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold mb-4">Informasi Koperasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="font-medium">{cooperative.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telepon</p>
            <p className="font-medium">{cooperative.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{cooperative.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">No. Registrasi</p>
            <p className="font-medium">{cooperative.registrationNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Koperasi;