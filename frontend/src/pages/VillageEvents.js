import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const VillageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/village/events');
        setEvents(res.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📅 Kegiatan Desa</h1>
          <p className="text-gray-500">Jadwal kegiatan warga</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada kegiatan</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">{event.category}</span>
                    {event.isFeatured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">Featured</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    <p>📅 {new Date(event.startDate).toLocaleDateString('id-ID')} - {new Date(event.endDate).toLocaleDateString('id-ID')}</p>
                    <p>📍 {event.location}</p>
                    <p>👤 Organizer: {event.organizer}</p>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{event.participants?.length || 0} peserta</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VillageEvents;