import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ChartBarIcon, UsersIcon, CurrencyDollarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const VillageGovernmentDashboard = () => {
  const [stats, setStats] = useState({
    totalUMKM: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    growthRate: 0,
    topProducts: [],
    monthlyData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/village/government/dashboard');
        setStats(res.data.data);
      } catch (error) {
        console.error('Error fetching government stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🏛️ Dashboard Pemerintah Desa</h1>
        <p className="text-gray-500">Pantau pertumbuhan ekonomi desa</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <UsersIcon className="w-6 h-6 text-blue-500 mx-auto" />
          <p className="text-2xl font-bold">{stats.totalUMKM}</p>
          <p className="text-sm text-gray-500">UMKM Terdaftar</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <CurrencyDollarIcon className="w-6 h-6 text-green-500 mx-auto" />
          <p className="text-2xl font-bold">Rp{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Pendapatan</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <ShoppingBagIcon className="w-6 h-6 text-purple-500 mx-auto" />
          <p className="text-2xl font-bold">{stats.totalTransactions}</p>
          <p className="text-sm text-gray-500">Transaksi</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <ChartBarIcon className="w-6 h-6 text-orange-500 mx-auto" />
          <p className="text-2xl font-bold">{stats.growthRate}%</p>
          <p className="text-sm text-gray-500">Pertumbuhan</p>
        </div>
      </div>

      {/* Grafik bulanan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold mb-4">📈 Tren Ekonomi Desa</h3>
        <div className="h-48 flex items-end gap-2">
          {stats.monthlyData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary/20 rounded-t-lg"
                style={{ height: `${(item.value / Math.max(...stats.monthlyData.map(d => d.value))) * 100}%` }}
              >
                <div 
                  className="w-full bg-primary rounded-t-lg transition-all h-full"
                  style={{ height: `${(item.value / Math.max(...stats.monthlyData.map(d => d.value))) * 80}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VillageGovernmentDashboard;