import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  HeartIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  CreditCardIcon,
  TruckIcon,
  BriefcaseIcon,
  VideoCameraIcon,
  ClipboardDocumentIcon,  // ← Gunakan ClipboardDocumentIcon
  HomeIcon
} from '@heroicons/react/24/outline';

const LayananDesa = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ebooks: 0,
    ppob: 0,
    couriers: 0,
    jobs: 0,
    live: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ebooks, jobs, couriers] = await Promise.all([
          api.get('/village-services/ebooks?limit=1'),
          api.get('/village-services/jobs?limit=1'),
          api.get('/village-services/couriers?limit=1')
        ]);
        setStats({
          ebooks: ebooks.data.data?.length || 0,
          jobs: jobs.data.data?.length || 0,
          couriers: couriers.data.data?.length || 0,
          ppob: 0,
          live: 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const services = [
    { 
      icon: NewspaperIcon, 
      label: 'Informasi Desa', 
      path: '/village/info', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      desc: 'Berita & pengumuman'
    },
    { 
      icon: ChatBubbleLeftRightIcon, 
      label: 'Pengaduan', 
      path: '/village/complaints', 
      color: 'text-red-500', 
      bg: 'bg-red-50',
      desc: 'Laporan warga'
    },
    { 
      icon: CalendarIcon, 
      label: 'Kegiatan', 
      path: '/village/events', 
      color: 'text-green-500', 
      bg: 'bg-green-50',
      desc: 'Jadwal kegiatan'
    },
    { 
      icon: HeartIcon, 
      label: 'Donasi', 
      path: '/village/donations', 
      color: 'text-pink-500', 
      bg: 'bg-pink-50',
      desc: 'Bantuan sosial'
    },
    { 
      icon: DocumentIcon, 
      label: 'Administrasi', 
      path: '/village/documents', 
      color: 'text-purple-500', 
      bg: 'bg-purple-50',
      desc: 'Surat & dokumen'
    },
    { 
      icon: ExclamationTriangleIcon, 
      label: 'Info Bencana', 
      path: '/village/disasters', 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
      desc: 'Peringatan bencana'
    },
    // ========== LAYANAN BARU ==========
    { 
      icon: BookOpenIcon, 
      label: 'Ebook Desa', 
      path: '/village/ebooks', 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      desc: 'Panduan & resep',
      count: stats.ebooks
    },
    { 
      icon: CreditCardIcon, 
      label: 'PPOB', 
      path: '/village/ppob', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      desc: 'Bayar tagihan',
      count: stats.ppob
    },
    { 
      icon: TruckIcon, 
      label: 'Kurir Desa', 
      path: '/village/couriers', 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      desc: 'Antar-jemput',
      count: stats.couriers
    },
    { 
      icon: BriefcaseIcon, 
      label: 'Lowongan Kerja', 
      path: '/village/jobs', 
      color: 'text-cyan-500', 
      bg: 'bg-cyan-50',
      desc: 'Info kerja',
      count: stats.jobs
    },
    { 
      icon: VideoCameraIcon, 
      label: 'Live Shopping', 
      path: '/village/live', 
      color: 'text-rose-500', 
      bg: 'bg-rose-50',
      desc: 'Belanja live',
      count: stats.live
    },
    // ========== ADMINISTRASI DESA (BARU) ==========
    { 
      icon: ClipboardDocumentIcon, 
      label: 'Administrasi Desa', 
      path: '/village/admin-products', 
      color: 'text-purple-500', 
      bg: 'bg-purple-50',
      desc: 'Template & jasa'
    },
    { 
      icon: HomeIcon, 
      label: 'E-Government', 
      path: '/village/egov', 
      color: 'text-teal-500', 
      bg: 'bg-teal-50',
      desc: 'Layanan pemerintah'
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🏘️ Layanan Desa</h1>
        <p className="text-gray-500 mt-1">Lengkap! Semua layanan untuk masyarakat desa</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {services.map((service) => (
          <Link
            key={service.label}
            to={service.path}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition group hover:-translate-y-1"
          >
            <div className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition`}>
              <service.icon className={`w-6 h-6 ${service.color}`} />
            </div>
            <p className="text-sm font-semibold text-gray-800 mt-2">{service.label}</p>
            <p className="text-xs text-gray-400">{service.desc}</p>
            {service.count !== undefined && (
              <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {service.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="mt-8 bg-gradient-to-r from-primary to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">🎉 Layanan Lengkap!</h3>
            <p className="text-white/80 text-sm mt-1">
              Ebook, PPOB, Kurir, Lowongan, Live Shopping, & Administrasi Desa
            </p>
          </div>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
            ✨ 13 Layanan
          </span>
        </div>
      </div>
    </div>
  );
};

export default LayananDesa;