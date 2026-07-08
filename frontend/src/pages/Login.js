// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dapatkan redirect URL dari state
  const from = location.state?.from || '/dashboard';
  const action = location.state?.action || '';

  // Auto-fill demo akun (opsional)
  useEffect(() => {
    // Isi dengan buyer untuk kemudahan testing
    // setForm({ email: 'buyer@desamart.com', password: 'buyer123' });
  }, []);

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validasi client-side
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi');
      setIsSubmitting(false);
      return;
    }

    if (!form.email.includes('@')) {
      setError('Format email tidak valid');
      setIsSubmitting(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      setIsSubmitting(false);
      return;
    }

    console.log('📤 Login attempt:', { email: form.email });

    try {
      const result = await login(form.email, form.password);
      
      console.log('📥 Login result:', result);
      
      if (result.success) {
        // Redirect ke halaman yang dimaksud
        if (action === 'register-umkm' || from === '/umkm/register') {
          navigate('/umkm/register');
        } else {
          navigate(from);
        }
      } else {
        setError(result.message || 'Login gagal. Periksa email dan password Anda.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // AUTO-FILL DEMO (Klik tombol)
  // ============================================
  const fillDemoAccount = (role) => {
    const accounts = {
      admin: { email: 'admin@desamart.com', password: 'admin123' },
      seller: { email: 'seller@desamart.com', password: 'seller123' },
      buyer: { email: 'buyer@desamart.com', password: 'buyer123' }
    };
    setForm(accounts[role] || accounts.buyer);
    setError('');
  };

  // ============================================
  // RENDER
  // ============================================
  const isDisabled = isSubmitting || loading;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary">Login</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {action === 'register-umkm' 
              ? 'Login untuk mendaftarkan UMKM Anda'
              : 'Selamat datang kembali di DesaMart'}
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                disabled={isDisabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Lupa password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="btn-primary w-full py-3 text-lg rounded-lg flex items-center justify-center gap-2"
          >
            {isDisabled ? (
              <>
                <span className="animate-spin">⟳</span>
                Memproses...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Daftar
          </Link>
        </p>

        {/* Demo Account */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 font-medium mb-2">💡 Akun Demo</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span>👑 Admin</span>
              <button
                onClick={() => fillDemoAccount('admin')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Isi Otomatis
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>🏪 Seller</span>
              <button
                onClick={() => fillDemoAccount('seller')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Isi Otomatis
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>🛒 Buyer</span>
              <button
                onClick={() => fillDemoAccount('buyer')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Isi Otomatis
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <p>Email: buyer@desamart.com / Password: buyer123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;