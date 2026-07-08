// frontend/src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BellIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications?limit=100');
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unread || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getIcon = (type) => {
    const icons = {
      'ORDER': '📦',
      'PAYMENT': '💳',
      'SHIPPING': '🚚',
      'SELLER': '🏪',
      'SYSTEM': '⚙️',
      'PROMO': '🎯'
    };
    return icons[type] || '📌';
  };

  const getColor = (type) => {
    const colors = {
      'ORDER': 'bg-blue-100 text-blue-700',
      'PAYMENT': 'bg-green-100 text-green-700',
      'SHIPPING': 'bg-purple-100 text-purple-700',
      'SELLER': 'bg-orange-100 text-orange-700',
      'SYSTEM': 'bg-gray-100 text-gray-700',
      'PROMO': 'bg-yellow-100 text-yellow-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Silakan Login</h2>
          <Link to="/login" className="btn-primary inline-block mt-4">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        {/* Tombol Kembali */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BellIcon className="w-6 h-6" />
              Notifikasi
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline font-medium"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* List Notifikasi */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <span className="text-6xl block mb-4">🔕</span>
            <h2 className="text-xl font-bold text-gray-800">Tidak Ada Notifikasi</h2>
            <p className="text-gray-500 mt-2">Belum ada notifikasi untuk Anda</p>
            <Link to="/" className="btn-primary inline-block mt-4">
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl shadow-sm border transition hover:shadow-md ${
                  !notif.isRead ? 'border-l-4 border-l-primary bg-blue-50/30' : 'border-gray-100'
                }`}
              >
                <div className="p-4 flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColor(notif.type)}`}>
                    <span className="text-2xl">{getIcon(notif.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                          {notif.type && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                              {notif.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1 text-primary hover:text-primary-dark text-xs hover:underline"
                            title="Tandai sudah dibaca"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition"
                          title="Hapus notifikasi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol Kembali ke Bawah */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Notifications;