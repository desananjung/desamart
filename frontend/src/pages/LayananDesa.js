import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { NewspaperIcon, ChatBubbleLeftRightIcon, CalendarIcon, HeartIcon } from '@heroicons/react/24/outline';

const LayananDesa = () => {
  const [infos, setInfos] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, complaintRes] = await Promise.all([
          api.get('/village/info?limit=3'),
          api.get('/village/complaints?limit=3')
        ]);
        setInfos(infoRes.data.data || []);
        setComplaints(complaintRes.data.data || []);
      } catch (error) {
        console.error('Error fetching village data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { icon: NewspaperIcon, label: 'Informasi Desa', count: infos.length, path: '/village/info', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: ChatBubbleLeftRightIcon, label: 'Pengaduan', count: complaints.length, path: '/village/complaints', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: CalendarIcon, label: 'Kegiatan', count: 0, path: '/village/events', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: HeartIcon, label: 'Donasi', count: 0, path: '/village/donations', color: 'text-pink-500', bg: 'bg-pink-50' }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🏘️ Layanan Desa</h1>
        <p className="text-gray-500">Informasi dan layanan untuk masyarakat desa</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <Link key={card.label} to={card.path} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition text-center">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mx-auto`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{card.count}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold">📰 Informasi Terbaru</div>
          <div className="divide-y divide-gray-100">
            {infos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada informasi</div>
            ) : (
              infos.map(info => (
                <div key={info.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <p className="font-medium">{info.title}</p>
                  <p className="text-sm text-gray-500">{new Date(info.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold">📢 Pengaduan Terbaru</div>
          <div className="divide-y divide-gray-100">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada pengaduan</div>
            ) : (
              complaints.map(complaint => (
                <div key={complaint.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <p className="font-medium">{complaint.title}</p>
                  <p className="text-sm text-gray-500">Status: {complaint.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayananDesa;