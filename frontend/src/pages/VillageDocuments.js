import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PlusIcon, DocumentIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const VillageDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'SURAT_KETERANGAN',
    fileUrl: ''
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get('/village/documents');
        setDocuments(res.data.data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village/documents', form);
      alert('✅ Dokumen berhasil diajukan!');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'SURAT_KETERANGAN', fileUrl: '' });
      const res = await api.get('/village/documents');
      setDocuments(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengajukan dokumen');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'REJECTED': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default: return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const documentTypes = [
    { value: 'KTP', label: 'KTP' },
    { value: 'KK', label: 'Kartu Keluarga' },
    { value: 'SURAT_KETERANGAN', label: 'Surat Keterangan' },
    { value: 'SURAT_USAHA', label: 'Surat Usaha' },
    { value: 'REKOMENDASI', label: 'Rekomendasi' },
    { value: 'LAINNYA', label: 'Lainnya' }
  ];

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
          <h1 className="text-2xl font-bold">📄 Dokumen Administrasi</h1>
          <p className="text-gray-500">Pengurusan surat dan dokumen</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Ajukan Dokumen
        </button>
      </div>

      {/* Form Ajukan Dokumen */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">📝 Ajukan Dokumen</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Contoh: Pengajuan KTP"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Deskripsi dokumen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field"
              >
                {documentTypes.map(doc => (
                  <option key={doc.value} value={doc.value}>{doc.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL File</label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                className="input-field"
                placeholder="https://drive.google.com/file/..."
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Upload file ke cloud storage dan paste URL-nya
              </p>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Ajukan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Dokumen */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <DocumentIcon className="w-20 h-20 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold mt-4">Belum Ada Dokumen</h3>
          <p className="text-gray-500 mt-2">Ajukan dokumen Anda sekarang</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <DocumentIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-xs text-gray-500">{doc.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(doc.status)}`}>
                  {getStatusIcon(doc.status)}
                  {doc.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
              <div className="mt-3 text-xs text-gray-400">
                <p>📅 {new Date(doc.createdAt).toLocaleDateString('id-ID')}</p>
                <p>👤 {doc.requester?.name}</p>
                {doc.officer && <p>👮 Diproses: {doc.officer.name}</p>}
              </div>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-sm text-primary hover:underline block"
                >
                  📎 Lihat File
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VillageDocuments;