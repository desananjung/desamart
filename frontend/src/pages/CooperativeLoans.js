import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const CooperativeLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    tenure: '',
    interestRate: '0',
    purpose: ''
  });

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const statusRes = await api.get('/koperasi/status');
        const cooperativeId = statusRes.data.data?.id;
        if (cooperativeId) {
          const res = await api.get('/koperasi/loans', {
            params: { cooperativeId }
          });
          setLoans(res.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/koperasi/loans/request', {
        memberId: parseInt(form.memberId),
        amount: parseFloat(form.amount),
        tenure: parseInt(form.tenure),
        interestRate: parseFloat(form.interestRate),
        purpose: form.purpose
      });
      alert('✅ Pengajuan pinjaman berhasil!');
      setShowForm(false);
      setForm({ memberId: '', amount: '', tenure: '', interestRate: '0', purpose: '' });
      // Refresh
      const statusRes = await api.get('/koperasi/status');
      const res = await api.get('/koperasi/loans', {
        params: { cooperativeId: statusRes.data.data?.id }
      });
      setLoans(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengajukan pinjaman');
    }
  };

  const handleAction = async (loanId, action) => {
    try {
      if (action === 'approve') {
        await api.put(`/koperasi/loans/${loanId}/approve`);
        alert('✅ Pinjaman disetujui!');
      } else if (action === 'disburse') {
        await api.put(`/koperasi/loans/${loanId}/disburse`);
        alert('✅ Pinjaman dicairkan!');
      }
      // Refresh
      const statusRes = await api.get('/koperasi/status');
      const res = await api.get('/koperasi/loans', {
        params: { cooperativeId: statusRes.data.data?.id }
      });
      setLoans(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal melakukan aksi');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAID: 'bg-gray-100 text-gray-800',
      OVERDUE: 'bg-red-100 text-red-800',
      DEFAULTED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold">💰 Pinjaman Koperasi</h1>
          <p className="text-gray-500">Kelola pinjaman anggota koperasi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Ajukan Pinjaman</span>
        </button>
      </div>

      {/* Form Pengajuan */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">Form Pengajuan Pinjaman</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="ID Anggota"
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="Jumlah Pinjaman"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="Tenure (Bulan)"
              value={form.tenure}
              onChange={(e) => setForm({ ...form, tenure: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="Suku Bunga (%)"
              value={form.interestRate}
              onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
              className="input-field"
            />
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Tujuan Pinjaman"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2 flex space-x-2">
              <button type="submit" className="btn-primary flex-1">Ajukan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Pinjaman */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Anggota</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Tenure</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Belum ada pinjaman</td>
                </tr>
              ) : (
                loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 font-mono text-sm">#{loan.id}</td>
                    <td className="py-3 px-6">{loan.member?.user?.name}</td>
                    <td className="py-3 px-6 font-bold">Rp{loan.amount?.toLocaleString()}</td>
                    <td className="py-3 px-6">{loan.tenure} bulan</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex space-x-2">
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(loan.id, 'approve')}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {loan.status === 'APPROVED' && (
                          <button
                            onClick={() => handleAction(loan.id, 'disburse')}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ClockIcon className="w-5 h-5" />
                            Cairkan
                          </button>
                        )}
                      </div>
                    </td>
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

export default CooperativeLoans;