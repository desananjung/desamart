import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CooperativeSHU = () => {
  const [shuData, setShuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    const fetchSHU = async () => {
      try {
        const statusRes = await api.get('/koperasi/status');
        const cooperativeId = statusRes.data.data?.id;
        if (cooperativeId) {
          const res = await api.get('/koperasi/shu/calculate', {
            params: { cooperativeId, year }
          });
          setShuData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching SHU:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSHU();
  }, [year]);

  const handleDistribute = async () => {
    if (!window.confirm(`Bagikan SHU tahun ${year} kepada semua anggota?`)) return;
    
    setDistributing(true);
    try {
      const statusRes = await api.get('/koperasi/status');
      const cooperativeId = statusRes.data.data?.id;
      await api.post('/koperasi/shu/distribute', { cooperativeId, year });
      alert('✅ SHU berhasil dibagikan!');
      // Refresh data
      const res = await api.get('/koperasi/shu/calculate', {
        params: { cooperativeId, year }
      });
      setShuData(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membagikan SHU');
    } finally {
      setDistributing(false);
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📊 Sisa Hasil Usaha (SHU)</h1>
          <p className="text-gray-500">Perhitungan dan pembagian SHU koperasi</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-32"
            min="2020"
            max={new Date().getFullYear()}
          />
          <button
            onClick={handleDistribute}
            disabled={distributing || !shuData || shuData.totalSHU <= 0}
            className="btn-primary"
          >
            {distributing ? 'Memproses...' : 'Bagikan SHU'}
          </button>
        </div>
      </div>

      {shuData ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500">Total SHU</p>
              <p className="text-2xl font-bold text-primary">Rp{shuData.totalSHU?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500">Dibagikan (70%)</p>
              <p className="text-2xl font-bold text-green-500">Rp{shuData.distributedSHU?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500">Total Anggota</p>
              <p className="text-2xl font-bold text-blue-500">{shuData.totalMembers}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-500">Rata-rata SHU</p>
              <p className="text-2xl font-bold text-purple-500">
                Rp{shuData.totalMembers > 0 ? (shuData.distributedSHU / shuData.totalMembers).toLocaleString() : 0}
              </p>
            </div>
          </div>

          {/* Detail Pembagian */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold">Detail Pembagian SHU per Anggota</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">No</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Anggota</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Total Simpanan</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Persentase</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">SHU Diterima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shuData.shuResults?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">Belum ada data</td>
                    </tr>
                  ) : (
                    shuData.shuResults?.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-6">{idx + 1}</td>
                        <td className="py-3 px-6 font-medium">Anggota #{result.memberId}</td>
                        <td className="py-3 px-6">-</td>
                        <td className="py-3 px-6">{result.percentage?.toFixed(2)}%</td>
                        <td className="py-3 px-6 font-bold text-green-600">Rp{result.shuAmount?.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500">Belum ada data SHU untuk tahun {year}</p>
        </div>
      )}
    </div>
  );
};

export default CooperativeSHU;