import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BuildingOfficeIcon, UsersIcon, ShoppingBagIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const Enterprise = () => {
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnterprise = async () => {
      try {
        const res = await api.get('/enterprise/dashboard');
        setEnterprise(res.data.data?.enterprise || null);
      } catch (error) {
        console.error('Error fetching enterprise:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprise();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🏢</span>
        <h2 className="text-2xl font-bold">Enterprise Dashboard</h2>
        <p className="text-gray-500 mt-2">Daftarkan bisnis Anda</p>
        <Link to="/enterprise/create" className="btn-primary inline-block mt-4">
          📝 Buat Enterprise
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🏢 {enterprise.name}</h1>
          <p className="text-gray-500">{enterprise.type} • {enterprise.status}</p>
        </div>
        <Link to="/enterprise/stores" className="btn-secondary">
          🏪 Kelola Toko
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <UsersIcon className="w-6 h-6 text-blue-500 mx-auto" />
          <p className="text-2xl font-bold">{enterprise.members?.length || 0}</p>
          <p className="text-sm text-gray-500">Anggota</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <ShoppingBagIcon className="w-6 h-6 text-green-500 mx-auto" />
          <p className="text-2xl font-bold">{enterprise.stores?.length || 0}</p>
          <p className="text-sm text-gray-500">Toko</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <CurrencyDollarIcon className="w-6 h-6 text-purple-500 mx-auto" />
          <p className="text-2xl font-bold">Rp0</p>
          <p className="text-sm text-gray-500">Pendapatan</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <BuildingOfficeIcon className="w-6 h-6 text-orange-500 mx-auto" />
          <p className="text-2xl font-bold">{enterprise.products?.length || 0}</p>
          <p className="text-sm text-gray-500">Produk</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold mb-4">Informasi Enterprise</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="font-medium">{enterprise.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telepon</p>
            <p className="font-medium">{enterprise.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{enterprise.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="font-medium">{enterprise.website || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;