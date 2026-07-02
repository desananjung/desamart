import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute'; // ← TAMBAHKAN INI

// Pages
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Payment from './pages/Payment';
import UMKM from './pages/UMKM';
import Koperasi from './pages/Koperasi';
import LayananDesa from './pages/LayananDesa';
import Enterprise from './pages/Enterprise';
import Pertanian from './pages/Pertanian';
import UMKMRegister from './pages/UMKMRegister';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import VillageMap from './pages/VillageMap';
import VillageGovernmentDashboard from './pages/VillageGovernmentDashboard';
import UMKMPrograms from './pages/UMKMPrograms';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import SellerOrders from './pages/SellerOrders'; // ← TAMBAHKAN INI
//import Wishlist from './pages/Wishlist'; //

// Feature data
const features = [
  { id: 'marketplace', icon: '🛒', title: 'Marketplace Core', desc: 'Jual beli produk dengan mudah dan aman', color: 'from-blue-500 to-blue-600', path: '/marketplace' },
  { id: 'payment', icon: '💳', title: 'Payment & Shipping', desc: 'Pembayaran digital & pengiriman terintegrasi', color: 'from-green-500 to-green-600', path: '/payment' },
  { id: 'umkm', icon: '🏪', title: 'UMKM Digital', desc: 'Platform khusus untuk usaha mikro & kecil', color: 'from-orange-500 to-orange-600', path: '/umkm' },
  { id: 'koperasi', icon: '🏛️', title: 'Koperasi Digital', desc: 'Simpan pinjam & manajemen koperasi', color: 'from-purple-500 to-purple-600', path: '/koperasi' },
  { id: 'layanan', icon: '🏘️', title: 'Layanan Desa', desc: 'Pengaduan, informasi, & donasi desa', color: 'from-pink-500 to-pink-600', path: '/layanan-desa' },
  { id: 'enterprise', icon: '🏢', title: 'Dashboard Enterprise', desc: 'Manajemen bisnis terintegrasi', color: 'from-indigo-500 to-indigo-600', path: '/enterprise' },
  { id: 'pertanian', icon: '🌾', title: 'Pasar Tani Digital', desc: 'Jual beli hasil pertanian & perkebunan', color: 'from-emerald-500 to-emerald-600', path: '/pertanian' }
];

// Landing Page Component
const LandingPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Buka modal login jika di halaman /login
  useEffect(() => {
    if (location.pathname === '/login') {
      const modal = document.getElementById('auth-modal');
      if (modal) {
        setTimeout(() => {
          modal.showModal();
        }, 100);
      }
    }
  }, [location.pathname]);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-red-500 to-orange-500 py-20 md:py-32">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <span className="text-white text-sm font-medium">🚀 Super App Desa Digital</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              DesaMart
              <span className="block text-yellow-300">Solusi Digital untuk Desa</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mt-4 max-w-2xl">
              Satu platform untuk semua kebutuhan desa: marketplace, UMKM, koperasi, 
              layanan desa, enterprise, dan pertanian.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              {user ? (
                <Link to="/dashboard" className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition">
                  🚀 Buka Dashboard
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => document.getElementById('auth-modal')?.showModal()}
                    className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    🚀 Mulai Sekarang
                  </button>
                  <Link 
                    to="/login" 
                    className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 mt-8 text-white/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <span>10.000+ Pengguna</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏪</span>
                <span>500+ UMKM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span>4.8 Rating</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="none">
            <path fill="#f3f4f6" d="M0,64L80,74.7C160,85,320,107,480,112C640,117,800,107,960,90.7C1120,75,1280,53,1360,42.7L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"/>
          </svg>
        </div>
      </div>

      {/* Feature Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">🚀 Semua Fitur DesaMart</h2>
            <p className="text-gray-500 mt-2">Pilih fitur yang Anda butuhkan, semuanya dalam satu platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.id}
                to={user ? feature.path : '/login'}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition">
                  {feature.title}
                </h3>
                <p className="text-gray-500 mt-2 text-sm">{feature.desc}</p>
                <div className="mt-4 text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  {user ? 'Buka Sekarang →' : 'Login untuk Akses →'}
                </div>
              </Link>
            ))}
          </div>

          {!user && (
            <div className="mt-12 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                <span className="text-4xl block mb-4">🔐</span>
                <h3 className="text-xl font-bold text-gray-800">Daftar Sekarang Gratis!</h3>
                <p className="text-gray-500 mt-2">
                  Akses semua fitur DesaMart dengan mendaftar satu akun.
                  Mulai dari marketplace, UMKM, koperasi, hingga layanan desa.
                </p>
                <button 
                  onClick={() => document.getElementById('auth-modal')?.showModal()}
                  className="btn-primary mt-6 inline-block"
                >
                  🚀 Daftar Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/register" element={<LandingPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } />
            <Route path="/umkm" element={
              <ProtectedRoute>
                <UMKM />
              </ProtectedRoute>
            } />
            <Route path="/koperasi" element={
              <ProtectedRoute>
                <Koperasi />
              </ProtectedRoute>
            } />
            <Route path="/layanan-desa" element={
              <ProtectedRoute>
                <LayananDesa />
              </ProtectedRoute>
            } />
            <Route path="/enterprise" element={
              <ProtectedRoute>
                <Enterprise />
              </ProtectedRoute>
            } />
            <Route path="/pertanian" element={
              <ProtectedRoute>
                <Pertanian />
              </ProtectedRoute>
            } />
            <Route path="/umkm/register" element={
              <ProtectedRoute>
                <UMKMRegister />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            
            {/* /products/new - harus terdaftar dan bisa diakses SELLER */}
            <Route path="/products/new" element={
              <RoleProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <ProductForm />
              </RoleProtectedRoute>
            } />
            
            <Route path="/products/edit/:id" element={
              <RoleProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
                <ProductForm />
              </RoleProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/product/:id" element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } />
            <Route path="/village/map" element={
              <ProtectedRoute>
                <VillageMap />
              </ProtectedRoute>
            } />
            <Route path="/village/government" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <VillageGovernmentDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/umkm/programs" element={
              <ProtectedRoute>
                <UMKMPrograms />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
  <ProtectedRoute>
    <OrderDetail />
  </ProtectedRoute>
} />
<Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
 <Route path="/seller/orders" element={
  <RoleProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
    <SellerOrders />
  </RoleProtectedRoute>
} />           
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        <AuthModal />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;