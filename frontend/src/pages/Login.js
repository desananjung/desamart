import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Dapatkan redirect URL dari state
  const from = location.state?.from || '/dashboard';
  const action = location.state?.action || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      // Redirect ke halaman yang dimaksud
      if (action === 'register-umkm' || from === '/umkm/register') {
        navigate('/umkm/register');
      } else {
        navigate(from);
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">🔐 Login</h2>
          <p className="text-gray-500 mt-2">
            {action === 'register-umkm' 
              ? 'Login untuk mendaftarkan UMKM Anda'
              : 'Selamat datang kembali di DesaMart'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="input-field pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Belum punya akun? <Link to="/register" className="text-primary font-semibold hover:underline">Daftar</Link>
        </p>

        {/* Demo Akun */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 font-medium">💡 Akun Demo</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>👑 Admin: <span className="font-mono">admin@desamart.com</span> / <span className="font-mono">admin123</span></p>
            <p>🏪 Seller: <span className="font-mono">seller@desamart.com</span> / <span className="font-mono">seller123</span></p>
            <p>🛒 Buyer: <span className="font-mono">buyer@desamart.com</span> / <span className="font-mono">buyer123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;