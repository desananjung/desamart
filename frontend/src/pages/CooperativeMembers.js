import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CooperativeMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ userId: '', role: 'MEMBER' });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const statusRes = await api.get('/koperasi/status');
        const cooperativeId = statusRes.data.data?.id;
        if (cooperativeId) {
          const res = await api.get('/koperasi/members', {
            params: { cooperativeId }
          });
          setMembers(res.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleAddMember = async () => {
    try {
      const statusRes = await api.get('/koperasi/status');
      const cooperativeId = statusRes.data.data?.id;
      await api.post('/koperasi/members', {
        cooperativeId,
        userId: parseInt(newMember.userId),
        role: newMember.role
      });
      alert('✅ Anggota berhasil ditambahkan!');
      setShowAddForm(false);
      // Refresh list
      const res = await api.get('/koperasi/members', {
        params: { cooperativeId }
      });
      setMembers(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan anggota');
    }
  };

  const filteredMembers = members.filter(m =>
    m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.memberNumber?.includes(search)
  );

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
          <h1 className="text-2xl font-bold">👥 Anggota Koperasi</h1>
          <p className="text-gray-500">Kelola anggota koperasi Anda</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">Tambah Anggota Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="ID User"
              value={newMember.userId}
              onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
              className="input-field"
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="input-field"
            >
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
            <div className="flex space-x-2">
              <button onClick={handleAddMember} className="btn-primary flex-1">
                Tambah
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari anggota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">No. Anggota</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Bergabung</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Belum ada anggota
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-6 font-mono text-sm">{member.memberNumber}</td>
                    <td className="py-3 px-6 font-medium">{member.user?.name}</td>
                    <td className="py-3 px-6 text-gray-600">{member.user?.email}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500">
                      {new Date(member.joinDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {member.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
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

export default CooperativeMembers;