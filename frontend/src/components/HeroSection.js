import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-red-500 to-orange-500">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container-custom relative z-10 py-20 md:py-32">
        <div className="max-4xl">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <span className="text-white text-sm font-medium">🚀 Super App Desa Digital</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            DesaMart
            <span className="block text-yellow-300">Solusi Digital untuk Desa</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mt-4 max-2xl">
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
                  onClick={() => document.getElementById('auth-modal').showModal()}
                  className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  🚀 Mulai Sekarang
                </button>
                <Link to="/login" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition">
                  Login
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-8 mt-8 text-white/80">
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
  );
};

export default HeroSection;