// frontend/src/components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const dropdownRef = useRef(null);

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data?.count || 0);
      }
    } catch (error) {
      // Silent fail - jangan spam error
      if (error.response?.status !== 404 && error.response?.status !== 403) {
        console.error('Error fetching notification count:', error);
      }
    }
  };

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.get('/notifications?limit=10');
      if (response.data.success) {
        setNotifications(response.data.data || []);
        // Update unread count
        const unread = response.data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MARK AS READ
  // ============================================
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // ============================================
  // EFFECTS - DENGAN DEPENDENCY YANG BENAR
  // ============================================
  useEffect(() => {
    // Fetch initial count
    if (user) {
      fetchUnreadCount();
    }

    // ✅ SETUP POLLING - hanya jika user login
    if (user) {
      // Polling setiap 30 detik (BUKAN setiap detik!)
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // 30 detik
    }

    // ✅ CLEANUP - penting untuk mencegah memory leak
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]); // ✅ Hanya re-run jika user berubah

  // ============================================
  // CLOSE DROPDOWN ON CLICK OUTSIDE
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ============================================
  // TOGGLE DROPDOWN
  // ============================================
  const toggleDropdown = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  // ============================================
  // RENDER
  // ============================================
  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <h3 className="font-semibold">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <span className="text-4xl block mb-2">📭</span>
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${
                    !notif.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id);
                    if (notif.link) window.location.href = notif.link;
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{notif.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold' : ''}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 text-center">
            <Link
              to="/notifications"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setShowDropdown(false)}
            >
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;