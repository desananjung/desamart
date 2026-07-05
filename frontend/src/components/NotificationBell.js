import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cek apakah user login
  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  useEffect(() => {
    // Hanya fetch jika user login
    if (!isLoggedIn()) {
      console.log('🔔 User not logged in, skipping notifications');
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data || []);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('🔔 Notifikasi tidak tersedia (belum login)');
        } else {
          console.error('Error fetching notifications:', error);
        }
        setNotifications([]);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.data?.count || 0);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('🔔 Unread count tidak tersedia (belum login)');
        } else {
          console.error('Error fetching unread count:', error);
        }
        setUnreadCount(0);
      }
    };

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      if (isLoggedIn()) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ... rest of component
};

export default NotificationBell;