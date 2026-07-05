import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AgricultureSeasons = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await api.get('/agriculture/seasons');
        setSeasons(res.data.data || []);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
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
      <h1 className="text-2xl font-bold mb-6">🌤️ Informasi Musim</h1>

      {seasons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">🌤️</span>
          <h3 className="text-xl font-semibold">Belum Ada Informasi Musim</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasons.map((season) => (
            <div key={season.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {season.season === 'HUJAN' ? '🌧️' : season.season === 'KEMARAU' ? '☀️' : '🌤️'}
                </span>
                <h3 className="text-xl font-bold">{season.season}</h3>
                <span className="text-sm text-gray-500">{season.year}</span>
              </div>
              <p className="text-gray-700">{season.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(season.startDate).toLocaleDateString('id-ID')} - {new Date(season.endDate).toLocaleDateString('id-ID')}
              </p>
              {season.recommendedCommodity && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    🌾 Rekomendasi: {season.recommendedCommodity}
                  </p>
                </div>
              )}
              {season.tips && (
                <p className="text-sm text-gray-500 mt-2">💡 {season.tips}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgricultureSeasons;