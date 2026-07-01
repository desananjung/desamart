import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CooperativeSavings = () => {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, mandatory: 0, voluntary: 0 });

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const statusRes = await api.get('/koperasi/status');
        const cooperativeId = statusRes.data.data?.id;
        if (cooperativeId) {
          // Ambil data simpanan dari anggota
          const membersRes = await api.get('/koperasi/members', {
            params: { cooperativeId }
          });
          const members = membersRes.data.data || [];
          
          let total = 0;
          let mandatory = 0;
          let voluntary = 0;
          
          members.forEach(m => {
            total += m.totalSavings || 0;
            mandatory += m.mandatorySavings || 0;
            voluntary += m.voluntarySavings || 0;
          });
          
          setSummary({ total, mandatory, voluntary });
          setSavings(members);
        }
      } catch (error) {
        console.error('Error fetching savings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
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
          <h1 className="text-2xl font-bold">🏦 Simpanan Koperasi</h1>
          <p className="text-gray-500">Ringkasan simpanan anggota koperasi</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Simpanan</p>
          <p className="text-3xl font-bold text-primary">Rp{summary.total?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Simpanan Wajib</p>
          <p className="text-3xl font-bold text-blue-500">Rp{summary.mandatory?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Simpanan Sukarela</p>
          <p className="text-3xl font-bold text-green-500">Rp{summary.voluntary?.toLocaleString()}</p>
        </div>
      </div>

      {/* List Anggota dengan Simpanan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold">Rincian Simpanan Anggota</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">No. Anggota</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Total Simpanan</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Wajib</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Sukarela</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {savings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Belum ada data simpanan</td>
                </tr>
              ) : (
                savings.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 font-mono text-sm">{member.memberNumber}</td>
                    <td className="py-3 px-6 font-medium">{member.user?.name}</td>
                    <td className="py-3 px-6 font-bold text-primary">Rp{member.totalSavings?.toLocaleString()}</td>
                    <td className="py-3 px-6">Rp{member.mandatorySavings?.toLocaleString()}</td>
                    <td className="py-3 px-6">Rp{member.voluntarySavings?.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CooperativeSavings;