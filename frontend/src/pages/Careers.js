import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Careers = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/village-services/jobs');
        setJobs(res.data.data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Data dummy jika API belum siap
        setJobs([
          {
            id: 1,
            title: 'Software Engineer',
            description: 'Mengembangkan platform DesaMart',
            company: 'DesaMart',
            location: 'Remote / Desa Nanjung',
            type: 'FULLTIME',
            salary: 'Rp 8.000.000 - Rp 15.000.000',
            requirements: 'React, Node.js, PostgreSQL, 2+ tahun pengalaman',
            contact: 'hr@desamart.com',
            isActive: true,
            deadline: '2026-12-31',
            poster: { name: 'DesaMart HR' }
          },
          {
            id: 2,
            title: 'UI/UX Designer',
            description: 'Mendesain pengalaman pengguna DesaMart',
            company: 'DesaMart',
            location: 'Remote / Desa Nanjung',
            type: 'FULLTIME',
            salary: 'Rp 6.000.000 - Rp 10.000.000',
            requirements: 'Figma, User Research, 2+ tahun pengalaman',
            contact: 'hr@desamart.com',
            isActive: true,
            deadline: '2026-12-31',
            poster: { name: 'DesaMart HR' }
          },
          {
            id: 3,
            title: 'Community Manager',
            description: 'Mengelola komunitas UMKM desa',
            company: 'DesaMart',
            location: 'Desa Nanjung',
            type: 'FULLTIME',
            salary: 'Rp 4.000.000 - Rp 7.000.000',
            requirements: 'Komunikasi, Organisasi, Pengalaman dengan UMKM',
            contact: 'hr@desamart.com',
            isActive: true,
            deadline: '2026-12-31',
            poster: { name: 'DesaMart HR' }
          },
          {
            id: 4,
            title: 'Marketing Digital',
            description: 'Mempromosikan produk UMKM desa',
            company: 'DesaMart',
            location: 'Remote / Desa Nanjung',
            type: 'PARTTIME',
            salary: 'Rp 3.000.000 - Rp 5.000.000',
            requirements: 'Social Media, Content Creation, SEO',
            contact: 'hr@desamart.com',
            isActive: true,
            deadline: '2026-12-31',
            poster: { name: 'DesaMart HR' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const getTypeBadge = (type) => {
    const styles = {
      FULLTIME: 'bg-blue-100 text-blue-700',
      PARTTIME: 'bg-green-100 text-green-700',
      FREELANCE: 'bg-purple-100 text-purple-700',
      MAGANG: 'bg-orange-100 text-orange-700'
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type) => {
    const labels = {
      FULLTIME: 'Full Time',
      PARTTIME: 'Part Time',
      FREELANCE: 'Freelance',
      MAGANG: 'Magang'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">💼 Karir di DesaMart</h1>
          <p className="text-lg md:text-xl text-white/90">
            Bergabung dengan tim kami untuk membangun ekosistem digital desa
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              👥 10+ Posisi Tersedia
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🌍 Remote & On-site
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🚀 Startup Desa
            </span>
          </div>
        </div>
      </div>

      {/* Mengapa Bergabung */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">✨ Mengapa Bergabung dengan Kami?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <SparklesIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Dampak Sosial</h4>
            <p className="text-xs text-gray-500">Membangun desa digital</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <UserGroupIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Tim Hebat</h4>
            <p className="text-xs text-gray-500">Bekerja dengan tim terbaik</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <AcademicCapIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Pengembangan</h4>
            <p className="text-xs text-gray-500">Belajar dan berkembang</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <BuildingOfficeIcon className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-sm">Budaya Kerja</h4>
            <p className="text-xs text-gray-500">Lingkungan positif</p>
          </div>
        </div>
      </div>

      {/* Lowongan */}
      <h2 className="text-2xl font-bold mb-6">📋 Lowongan Tersedia</h2>
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BriefcaseIcon className="w-20 h-20 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold mt-4">Belum Ada Lowongan</h3>
          <p className="text-gray-500 mt-2">Pantau terus halaman ini untuk update terbaru</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(job.type)}`}>
                      {getTypeLabel(job.type)}
                    </span>
                    <span className="text-xs text-gray-400">{job.company}</span>
                  </div>
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  <p className="text-gray-600 mt-2">{job.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('id-ID') : 'Segera'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>Posted: {job.poster?.name}</span>
                    </div>
                  </div>

                  {job.requirements && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">📋 Persyaratan:</p>
                      <p className="text-sm text-gray-600">{job.requirements}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button className="btn-primary text-sm py-2 px-6">
                      Lamar Sekarang
                    </button>
                    <button className="btn-secondary text-sm py-2 px-6">
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Careers;