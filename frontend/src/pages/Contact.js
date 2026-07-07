import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulasi pengiriman
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">📬 Hubungi Kami</h1>
          <p className="text-lg md:text-xl text-white/90">
            Kami siap membantu Anda. Hubungi tim support DesaMart.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              ⏰ 24/7 Support
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              💬 Respon Cepat
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              ❤️ Siap Membantu
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Kontak */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg mb-4">📋 Informasi Kontak</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-500">support@desamart.com</p>
                  <p className="text-sm text-gray-500">info@desamart.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Telepon</p>
                  <p className="text-sm text-gray-500">(021) 1234-5678</p>
                  <p className="text-sm text-gray-500">(021) 8765-4321</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Alamat</p>
                  <p className="text-sm text-gray-500">
                    Desa Nanjung<br />
                    Kecamatan Nanjung<br />
                    Kabupaten Nanjung
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Jam Operasional</p>
                  <p className="text-sm text-gray-500">Senin - Jumat: 08:00 - 17:00</p>
                  <p className="text-sm text-gray-500">Sabtu - Minggu: 09:00 - 15:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg mb-4">🌐 Media Sosial</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <span className="text-2xl">📘</span>
                <span className="text-sm">Facebook</span>
              </button>
              <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <span className="text-2xl">📸</span>
                <span className="text-sm">Instagram</span>
              </button>
              <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <span className="text-2xl">🐦</span>
                <span className="text-sm">Twitter</span>
              </button>
              <button className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <span className="text-2xl">📱</span>
                <span className="text-sm">TikTok</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Kontak */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-2">📝 Kirim Pesan</h3>
            <p className="text-gray-500 mb-6">
              Isi form di bawah ini untuk menghubungi tim kami
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-green-700">✅ Pesan Terkirim!</h4>
                <p className="text-green-600 mt-2">
                  Terima kasih telah menghubungi kami. Tim kami akan segera merespon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Masukkan nama Anda"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subjek *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Subjek pesan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="input-field"
                    rows="5"
                    placeholder="Tulis pesan Anda di sini..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
        <h3 className="text-xl font-bold mb-2">💬 Butuh Bantuan Cepat?</h3>
        <p className="text-gray-600 mb-4">
          Chat dengan customer service kami secara langsung
        </p>
        <button className="btn-primary px-8 py-3 inline-flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          Mulai Live Chat
        </button>
      </div>
    </div>
  );
};

export default Contact;