import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  DocumentIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const VillageDashboard = () => {
  const [stats, setStats] = useState({
    infoCount: 0,
    complaintCount: 0,
    eventCount: 0,
    donationCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [infoRes, complaintRes, eventRes, donationRes] = await Promise.all([
          api.get('/village/info?limit=1'),
          api.get('/village/complaints?limit=1'),
          api.get('/village/events?limit=1'),
          api.get('/village/donations?limit=1')
        ]);
        setStats({
          infoCount: infoRes.data.data?.length || 0,
          complaintCount: complaintRes.data.data?.length || 0,
          eventCount: eventRes.data.data?.length || 0,
          donationCount: donationRes.data.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: NewspaperIcon, label: 'Informasi Desa', value: stats.infoCount, link: '/village/info', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: ChatBubbleLeftRightIcon, label: 'Pengaduan', value: stats.complaintCount, link: '/village/complaints', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: CalendarIcon, label: 'Kegiatan', value: stats.eventCount, link: '/village/events', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: HeartIcon, label: 'Donasi', value: stats.donationCount, link: '/village/donations', color: 'text-pink-500', bg: 'bg-pink-50' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🏘️ Layanan Desa</h1>
        <p className="text-gray-500 mt-1">Informasi dan layanan untuk masyarakat desa</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition text-center">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mx-auto`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/village/info" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 hover:shadow-lg transition">
          <NewspaperIcon className="w-10 h-10 mb-3" />
          <h3 className="text-xl font-bold">📰 Informasi Desa</h3>
          <p className="text-blue-100">Berita & pengumuman terbaru</p>
        </Link>
        
        <Link to="/village/complaints" className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 hover:shadow-lg transition">
          <ChatBubbleLeftRightIcon className="w-10 h-10 mb-3" />
          <h3 className="text-xl font-bold">📢 Pengaduan Masyarakat</h3>
          <p className="text-red-100">Laporkan masalah di desa</p>
        </Link>

        <Link to="/village/events" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 hover:shadow-lg transition">
          <CalendarIcon className="w-10 h-10 mb-3" />
          <h3 className="text-xl font-bold">📅 Kegiatan Desa</h3>
          <p className="text-green-100">Jadwal kegiatan warga</p>
        </Link>

        <Link to="/village/donations" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl p-6 hover:shadow-lg transition">
          <HeartIcon className="w-10 h-10 mb-3" />
          <h3 className="text-xl font-bold">❤️ Donasi & Bantuan</h3>
          <p className="text-pink-100">Bantu sesama warga</p>
        </Link>
      </div>
    </div>
  );
};

export default VillageDashboard;