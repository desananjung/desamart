import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

const UMKM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [umkm, setUmkm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUMKM = async () => {
      // Jika user tidak login, stop loading
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching UMKM status...');
        const res = await api.get('/umkm/status');
        console.log('📦 UMKM response:', res.data);
        
        // Jika data null, berarti belum terdaftar
        if (res.data.data === null) {
          setUmkm(null);
        } else {
          setUmkm(res.data.data);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching UMKM:', err);
        // Jika error 401/403, redirect ke login
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login', { 
            state: { from: '/umkm', action: 'register-umkm' } 
          });
          return;
        }
        // Untuk error lain, tampilkan pesan
        setError(err.response?.data?.message || 'Gagal memuat data UMKM');
        setUmkm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUMKM();
  }, [user, navigate]);

  const handleRegisterClick = () => {
  if (!user) {
    navigate('/login', { 
      state: { from: '/umkm/register', action: 'register-umkm' } 
    });
  } else {
    navigate('/umkm/register');
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Jika user belum login
  if (!user) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🔐</span>
        <h2 className="text-2xl font-bold">Login untuk Daftar UMKM</h2>
        <p className="text-gray-500 mt-2">Silakan login terlebih dahulu untuk mendaftarkan UMKM Anda</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button 
            onClick={() => navigate('/login', { state: { from: '/umkm/register' } })}
            className="btn-primary inline-block"
          >
            🔑 Login Sekarang
          </button>
          <Link to="/register" className="btn-secondary inline-block">
            📝 Daftar Akun
          </Link>
        </div>
      </div>
    );
  }

  // Jika error
  if (error) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">⚠️</span>
        <h2 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary inline-block mt-4"
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  // Jika sudah login tapi belum punya UMKM
 if (!umkm) {
  return (
    <div className="text-center py-12">
      <span className="text-6xl block mb-4">🏪</span>
      <h2 className="text-2xl font-bold">Daftar UMKM Sekarang!</h2>
      <p className="text-gray-500 mt-2">
        Daftarkan usaha Anda sebagai UMKM dan dapatkan akses ke berbagai fitur:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mt-4 text-left">
        <div className="bg-gray-50 p-3 rounded-lg">✅ Toko Online Gratis</div>
        <div className="bg-gray-50 p-3 rounded-lg">✅ Akses ke Marketplace</div>
        <div className="bg-gray-50 p-3 rounded-lg">✅ Program Pendampingan</div>
        <div className="bg-gray-50 p-3 rounded-lg">✅ Komunitas UMKM</div>
      </div>
      {/* TOMBOL INI HARUSNYA MUNCUL */}
      <button 
        onClick={handleRegisterClick}
        className="btn-primary inline-block mt-6"
      >
        📝 Daftar UMKM Sekarang
      </button>
    </div>
  );
}

  // Jika sudah punya UMKM
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🏪 UMKM Dashboard</h1>
          <p className="text-gray-500">
            {umkm.name} • 
            <span className={umkm.status === 'PENDING' ? 'text-yellow-500' : 'text-green-500'}>
              {' '}{umkm.status === 'PENDING' ? '⏳ Menunggu Verifikasi' : '✅ Terverifikasi'}
            </span>
          </p>
        </div>
        <Link to="/products/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Tambah Produk
        </Link>
      </div>

      {/* Informasi UMKM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Kategori</p>
          <p className="text-lg font-semibold">{umkm.category}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Alamat</p>
          <p className="text-lg font-semibold">{umkm.address}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Telepon</p>
          <p className="text-lg font-semibold">{umkm.phone}</p>
        </div>
      </div>

      {/* Status Verifikasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold mb-2">Status Registrasi</h3>
        {umkm.status === 'PENDING' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-700">⏳ Registrasi Anda sedang dalam proses verifikasi oleh admin. Mohon tunggu 1-3 hari kerja.</p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700">✅ Selamat! UMKM Anda sudah terverifikasi. Sekarang Anda bisa mulai menjual produk.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UMKM;