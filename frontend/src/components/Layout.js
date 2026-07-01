import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  HeartIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import AIChatbot from './AIChatbot';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Oops! Terjadi Kesalahan</h2>
            <p className="text-gray-500 mt-2">Silakan refresh halaman atau coba lagi nanti</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary mt-4"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          const res = await api.get('/cart');
          const items = res.data.data?.items || [];
          const count = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        } catch (error) {
          if (error.response?.status === 403) {
            console.log('User tidak memiliki akses ke cart (role bukan BUYER/ADMIN)');
          } else {
            console.error('Error fetching cart:', error);
          }
          setCartCount(0);
        }
      };
      fetchCart();
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* AI Chatbot */}
        <AIChatbot />

        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
          <div className="container-custom">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>
                
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-white text-xl font-bold">D</span>
                  </div>
                  <span className="text-2xl font-bold text-primary hidden sm:block">DesaMart</span>
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full hidden sm:block">ID</span>
                </Link>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari produk, brand, atau kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-3 pr-14 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-full hover:bg-red-600 transition shadow-md hover:shadow-lg"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Right Menu */}
              <div className="flex items-center space-x-1 md:space-x-3">
                {/* Wishlist */}
                <Link to="/wishlist" className="hidden md:flex p-2.5 hover:bg-gray-100 rounded-full transition relative">
                  <HeartIcon className="w-6 h-6 text-gray-600 hover:text-primary transition" />
                </Link>

                {/* Notification */}
                <button className="hidden md:flex p-2.5 hover:bg-gray-100 rounded-full transition relative">
                  <BellIcon className="w-6 h-6 text-gray-600 hover:text-primary transition" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Cart */}
                <Link to="/cart" className="relative p-2.5 hover:bg-gray-100 rounded-full transition">
                  <ShoppingCartIcon className="w-6 h-6 text-gray-600 hover:text-primary transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                {user ? (
                  <div className="relative group">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-500 text-white rounded-full flex items-center justify-center font-medium text-sm shadow-md">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden lg:inline text-sm font-medium text-gray-700">{user.name}</span>
                      <ChevronDownIcon className="hidden lg:inline w-4 h-4 text-gray-500" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50 ${isDropdownOpen ? 'block' : 'hidden'} group-hover:block`}>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                          {user.role}
                        </span>
                      </div>

                      <Link to="/dashboard" className="block px-4 py-2.5 hover:bg-gray-50 transition flex items-center space-x-3">
                        <span className="text-gray-500">📊</span>
                        <span>Dashboard</span>
                      </Link>

                      {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                        <Link to="/umkm" className="block px-4 py-2.5 hover:bg-gray-50 transition flex items-center space-x-3">
                          <span className="text-gray-500">🏪</span>
                          <span>UMKM Dashboard</span>
                        </Link>
                      )}

                      <Link to="/seller" className="block px-4 py-2.5 hover:bg-gray-50 transition flex items-center space-x-3">
                        <span className="text-gray-500">📊</span>
                        <span>Dashboard Penjual</span>
                      </Link>

                      <Link to="/wishlist" className="block px-4 py-2.5 hover:bg-gray-50 transition flex items-center space-x-3">
                        <HeartIcon className="w-5 h-5 text-gray-500" />
                        <span>Wishlist</span>
                      </Link>

                      <Link to="/orders" className="block px-4 py-2.5 hover:bg-gray-50 transition flex items-center space-x-3">
                        <span className="text-gray-500">📦</span>
                        <span>Pesanan Saya</span>
                      </Link>

                      <hr className="my-1" />

                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition flex items-center space-x-3"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/login" className="btn-outline text-sm hidden sm:block">Login</Link>
                    <Link to="/register" className="btn-primary text-sm">Daftar</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden pb-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-red-600">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-100">
                <div className="space-y-2">
                  <Link to="/" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Beranda</Link>
                  <Link to="/products" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Produk</Link>
                  <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">❤️ Wishlist</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Pesanan</Link>
                  <Link to="/cart" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">Keranjang</Link>
                  {user ? (
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                      🚪 Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-primary font-medium">Login</Link>
                      <Link to="/register" className="block px-4 py-2 bg-primary text-white rounded-lg text-center">Daftar</Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container-custom py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="container-custom py-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">D</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">DesaMart</span>
                </div>
                <p className="text-gray-600 text-sm max-w-sm">
                  Marketplace terpercaya untuk masyarakat desa. 
                  Belanja kebutuhan sehari-hari dengan mudah dan aman.
                </p>
                <div className="flex space-x-4 mt-4">
                  <button className="text-gray-400 hover:text-primary transition text-2xl">📱</button>
                  <button className="text-gray-400 hover:text-primary transition text-2xl">📘</button>
                  <button className="text-gray-400 hover:text-primary transition text-2xl">📸</button>
                  <button className="text-gray-400 hover:text-primary transition text-2xl">🐦</button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4">Tentang</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><Link to="/about" className="hover:text-primary transition">Tentang Kami</Link></li>
                  <li><Link to="/careers" className="hover:text-primary transition">Karir</Link></li>
                  <li><Link to="/press" className="hover:text-primary transition">Press</Link></li>
                  <li><Link to="/blog" className="hover:text-primary transition">Blog</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4">Bantuan</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><Link to="/help" className="hover:text-primary transition">Pusat Bantuan</Link></li>
                  <li><Link to="/faq" className="hover:text-primary transition">FAQ</Link></li>
                  <li><Link to="/contact" className="hover:text-primary transition">Hubungi Kami</Link></li>
                  <li><Link to="/returns" className="hover:text-primary transition">Pengembalian</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4">Lainnya</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li><Link to="/privacy" className="hover:text-primary transition">Kebijakan Privasi</Link></li>
                  <li><Link to="/terms" className="hover:text-primary transition">Syarat & Ketentuan</Link></li>
                  <li><Link to="/sitemap" className="hover:text-primary transition">Sitemap</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-500">
                © 2026 DesaMart. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-500">
                <span>🇮🇩 Indonesia</span>
                <span>|</span>
                <span>💰 IDR</span>
                <span>|</span>
                <span>🛡️ Secure Payment</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;