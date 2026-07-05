import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AgriculturePrices = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await api.get('/agriculture/prices');
        setPrices(res.data.data || []);
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
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
      <h1 className="text-2xl font-bold mb-6">📊 Harga Pasaran Pertanian</h1>

      {prices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📊</span>
          <h3 className="text-xl font-semibold">Belum Ada Data Harga</h3>
          <p className="text-gray-500 mt-2">Data harga akan muncul di sini</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Komoditas</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Pasar</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 font-medium">{price.commodity}</td>
                  <td className="py-3 px-6 font-bold text-primary">Rp{price.price?.toLocaleString()}</td>
                  <td className="py-3 px-6 text-gray-600">{price.market}</td>
                  <td className="py-3 px-6 text-sm text-gray-500">
                    {new Date(price.date).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgriculturePrices;