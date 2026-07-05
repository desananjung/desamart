import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EnterpriseMembers = () => {
  const [members, setMembers] = useState([]);
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    role: 'STAFF',
    permissions: {}
  });
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/enterprise');
        const data = res.data.data;
        if (data) {
          setEnterprise(data);
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error('Error fetching enterprise members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search user by email/name
  useEffect(() => {
    const searchUsers = async () => {
      if (searchUser.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await api.get(`/admin/users?search=${searchUser}`);
        setSearchResults(res.data.data || []);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };
    const debounce = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounce);
  }, [searchUser]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      alert('Pilih user terlebih dahulu');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/enterprise/${enterprise.id}/members`, {
        userId: selectedUser.id,
        role: form.role,
        permissions: form.permissions
      });
      
      alert('✅ Anggota berhasil ditambahkan!');
      setShowModal(false);
      setSelectedUser(null);
      setSearchUser('');
      
      // Refresh data
      const res = await api.get('/enterprise');
      const data = res.data.data;
      if (data) {
        setMembers(data.members || []);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan anggota');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      OWNER: 'bg-purple-100 text-purple-700',
      ADMIN: 'bg-blue-100 text-blue-700',
      MANAGER: 'bg-green-100 text-green-700',
      STAFF: 'bg-gray-100 text-gray-700',
      VIEWER: 'bg-yellow-100 text-yellow-700'
    };
    return styles[role] || 'bg-gray-100 text-gray-700';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">👥 Anggota Enterprise</h1>
          <p className="text-gray-500">Kelola anggota enterprise</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlusIcon className="w-5 h-5" />
          Tambah Anggota
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">👥</span>
          <h3 className="text-xl font-semibold">Belum Ada Anggota</h3>
          <p className="text-gray-500 mt-2">Tambahkan anggota ke enterprise</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Bergabung</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 font-medium">{member.user?.name}</td>
                  <td className="py-3 px-6 text-gray-600">{member.user?.email}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`text-sm ${member.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {member.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Anggota */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">👤 Tambah Anggota</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                  setSearchUser('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              {/* Cari User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari User *
                </label>
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="input-field"
                />
                
                {/* Hasil Pencarian */}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchUser(`${user.name} (${user.email})`);
                          setSearchResults([]);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                          selectedUser?.id === user.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                        }`}
                      >
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    ✅ Dipilih: {selectedUser.name} ({selectedUser.email})
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting || !selectedUser}
                  className="btn-primary flex-1 py-2.5"
                >
                  {submitting ? 'Menambahkan...' : '➕ Tambah Anggota'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                    setSearchUser('');
                  }}
                  className="btn-secondary px-6 py-2.5"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseMembers;