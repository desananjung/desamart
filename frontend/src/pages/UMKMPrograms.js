import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const UMKMPrograms = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/umkm/programs');
        setPrograms(res.data.data || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📚 Program Pendampingan UMKM</h1>
        <p className="text-gray-500">Tingkatkan usaha Anda dengan pelatihan & mentoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(program => (
          <div key={program.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{program.icon}</span>
              <div>
                <h3 className="font-bold">{program.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{program.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    📅 {program.duration}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✅ {program.status}
                  </span>
                </div>
                <Link
                  to={`/umkm/programs/${program.id}`}
                  className="btn-primary text-sm mt-3 inline-block"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UMKMPrograms;