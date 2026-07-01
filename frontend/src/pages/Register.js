import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'BUYER' // Default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validasi password minimal 6 karakter
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) {
      setSuccess('Registrasi berhasil! Silakan login.');
      // Kosongkan form
      setForm({ name: '', email: '', password: '', role: 'BUYER' });
      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ 
      maxWidth: 450, 
      margin: '50px auto', 
      padding: 30,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 30, color: '#333' }}>
        📝 Daftar DesaMart
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Nama Lengkap *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Masukkan nama lengkap"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            placeholder="Masukkan email aktif"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Password (min 6 karakter) *
          </label>
          <input
            type="password"
            name="password"
            placeholder="Masukkan password"
            value={form.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 25 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
            Daftar Sebagai *
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 16,
              backgroundColor: 'white'
            }}
          >
            <option value="BUYER">🛒 Pembeli (Buyer)</option>
            <option value="SELLER">🏪 Penjual (Seller)</option>
            <option value="ADMIN">👑 Admin</option>
          </select>
          <p style={{ 
            marginTop: 8, 
            fontSize: 12, 
            color: '#666',
            fontStyle: 'italic'
          }}>
            💡 Pilih role sesuai kebutuhan Anda. Admin memiliki akses penuh.
          </p>
        </div>

        {error && (
          <div style={{
            padding: 12,
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: 4,
            marginBottom: 15
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: 12,
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: 4,
            marginBottom: 15
          }}>
            ✅ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#999' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: 18,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.backgroundColor = '#45a049';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.target.style.backgroundColor = '#4CAF50';
          }}
        >
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
        Sudah punya akun? <Link to="/login" style={{ color: '#4CAF50', fontWeight: 'bold' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;