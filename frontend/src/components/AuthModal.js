import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = await login(form.email, form.password);
      if (!result.success) {
        setError(result.message);
      } else {
        document.getElementById('auth-modal').close();
      }
    } else {
      if (form.password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }
      const result = await register(form.name, form.email, form.password, form.role);
      if (!result.success) {
        setError(result.message);
      } else {
        setIsLogin(true);
        setError('✅ Registrasi berhasil! Silakan login.');
      }
    }
  };

  return (
    <dialog id="auth-modal" className="modal">
      <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-red-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">
              {isLogin ? '🔐 Login' : '📝 Daftar'}
            </h3>
            <button 
              onClick={() => document.getElementById('auth-modal').close()}
              className="text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            {isLogin ? 'Masuk ke akun DesaMart Anda' : 'Buat akun DesaMart baru'}
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Masukkan nama lengkap"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder={isLogin ? 'Masukkan password' : 'Minimal 6 karakter'}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Sebagai</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  <option value="BUYER">🛒 Pembeli</option>
                  <option value="SELLER">🏪 Penjual</option>
                  <option value="ADMIN">👑 Admin</option>
                </select>
              </div>
            )}

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Memproses...' : (isLogin ? 'Login' : 'Daftar')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
            </button>
          </div>

          {/* Demo Akun */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 font-medium mb-2">💡 Akun Demo</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <div>👑 Admin: admin@desamart.com</div>
              <div>🔑 admin123</div>
              <div>🏪 Seller: seller@desamart.com</div>
              <div>🔑 seller123</div>
              <div>🛒 Buyer: buyer@desamart.com</div>
              <div>🔑 buyer123</div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default AuthModal;