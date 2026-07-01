const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const natural = require('natural');

class ChatbotService {
  constructor() {
    // Intent patterns
    this.intents = {
      GREETING: ['halo', 'hai', 'selamat', 'pagi', 'siang', 'malam', 'hello', 'hi'],
      HELP: ['bantu', 'tolong', 'help', 'assist', 'butuh bantuan'],
      PRODUCT: ['produk', 'barang', 'cari', 'beli', 'mencari', 'mau beli'],
      PRICE: ['harga', 'berapa', 'cost', 'price', 'mahal', 'murah'],
      ORDER: ['pesanan', 'order', 'beli', 'checkout', 'pesan', 'pembelian'],
      PAYMENT: ['bayar', 'pembayaran', 'payment', 'transfer', 'qris'],
      SHIPPING: ['kirim', 'ongkir', 'shipping', 'pengiriman', 'dikirim', 'resi'],
      RETURN: ['return', 'kembali', 'retur', 'ganti', 'komplain', 'rusak'],
      STOCK: ['stok', 'tersedia', 'habis', 'ketersediaan', 'stock'],
      COMPLAINT: ['komplain', 'keluhan', 'masalah', 'error', 'tidak puas'],
      THANK: ['terima kasih', 'thanks', 'makasih', 'thank you'],
      BYE: ['bye', 'dadah', 'sampai jumpa', 'goodbye', 'met malam']
    };

    // Response templates
    this.responses = {
      GREETING: [
        'Halo! 👋 Ada yang bisa saya bantu?',
        'Selamat datang di DesaMart! 😊 Ada yang bisa saya bantu?',
        'Hai! Senang bisa membantu Anda! 🛒'
      ],
      HELP: [
        'Saya siap membantu! Silakan tanyakan tentang produk, pesanan, pembayaran, atau pengiriman.',
        'Ada yang bisa saya bantu? Saya bisa bantu cari produk, cek pesanan, atau info lainnya.'
      ],
      PRODUCT: [
        'Untuk mencari produk, Anda bisa menggunakan fitur pencarian di atas. Atau beri tahu saya produk apa yang Anda cari?',
        'Kami memiliki banyak produk menarik! Apa yang ingin Anda cari?'
      ],
      PRICE: [
        'Untuk melihat harga produk, silakan klik produk yang Anda minati.',
        'Harga produk bervariasi. Anda bisa filter berdasarkan harga di halaman produk.'
      ],
      ORDER: [
        'Untuk melihat pesanan Anda, silakan buka menu "Pesanan Saya" di dashboard.',
        'Anda bisa cek status pesanan di halaman "Pesanan Saya".'
      ],
      PAYMENT: [
        'Kami menerima pembayaran via Bank Transfer, QRIS, dan COD (Cash On Delivery).',
        'Untuk pembayaran, silakan ikuti instruksi di halaman checkout.'
      ],
      SHIPPING: [
        'Kami bekerja sama dengan JNE, POS Indonesia, GoSend, dan GrabExpress.',
        'Ongkir dihitung berdasarkan berat dan lokasi. Silakan cek di halaman checkout.'
      ],
      RETURN: [
        'Kami menerima retur dalam 14 hari dengan kondisi produk masih bagus.',
        'Untuk retur, silakan hubungi customer service kami.'
      ],
      STOCK: [
        'Stok produk tertera di halaman detail produk.',
        'Jika stok habis, Anda bisa memantau produk tersebut untuk stok berikutnya.'
      ],
      COMPLAINT: [
        'Maaf atas ketidaknyamanannya. Kami akan segera bantu selesaikan masalah Anda.',
        'Mohon berikan detail keluhan Anda, kami akan segera tindak lanjuti.'
      ],
      THANK: [
        'Sama-sama! Senang bisa membantu! 😊',
        'Terima kasih sudah menggunakan DesaMart!',
        'Dengan senang hati! Ada yang lain yang bisa saya bantu?'
      ],
      BYE: [
        'Terima kasih sudah berkunjung! Sampai jumpa lagi! 👋',
        'Senang bisa membantu! Happy shopping! 🛒',
        'Bye! Semoga hari Anda menyenangkan! 😊'
      ],
      DEFAULT: [
        'Maaf, saya kurang paham. Bisa jelaskan lebih detail?',
        'Saya masih belajar. Bisa tanyakan hal lain?',
        'Mohon maaf, saya belum bisa menjawab pertanyaan itu.'
      ]
    };

    this.tokenizer = new natural.WordTokenizer();
  }

  // Proses pesan user
  async processMessage(userId, message) {
    try {
      // Normalisasi pesan
      const normalized = message.toLowerCase().trim();
      
      // Deteksi intent
      const intent = this.detectIntent(normalized);
      
      // Generate response
      let response = this.getResponse(intent);
      
      // Tambahkan context jika perlu
      response = await this.addContext(response, userId, normalized);

      // Tambahan untuk produk spesifik
      if (intent === 'PRODUCT' || intent === 'PRICE') {
        const productSuggestion = await this.findProductSuggestion(normalized);
        if (productSuggestion) {
          response += `\n\n🔍 Produk yang mungkin Anda cari: ${productSuggestion}`;
        }
      }

      // Simpan chat history (opsional)
      await this.saveChatHistory(userId, message, response);

      return {
        message: response,
        intent: intent,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        intent: 'ERROR',
        timestamp: new Date()
      };
    }
  }

  // Deteksi intent dari pesan
  detectIntent(message) {
    const words = this.tokenizer.tokenize(message) || [];
    
    let scores = {};
    for (const [intent, patterns] of Object.entries(this.intents)) {
      scores[intent] = 0;
      patterns.forEach(pattern => {
        if (message.includes(pattern)) {
          scores[intent] += 1;
        }
        words.forEach(word => {
          if (pattern.includes(word) || word.includes(pattern)) {
            scores[intent] += 0.5;
          }
        });
      });
    }

    // Pilih intent dengan skor tertinggi
    const sortedIntents = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    // Jika skor > 0, return intent dengan skor tertinggi
    if (sortedIntents.length > 0 && sortedIntents[0][1] > 0) {
      return sortedIntents[0][0];
    }
    
    return 'DEFAULT';
  }

  // Get random response untuk intent
  getResponse(intent) {
    const responses = this.responses[intent] || this.responses.DEFAULT;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Tambahkan context ke response
  async addContext(response, userId, message) {
    // Cek apakah user sedang ada order
    if (message.includes('pesanan') || message.includes('order')) {
      const recentOrder = await prisma.order.findFirst({
        where: { userId, status: { not: 'DELIVERED' } },
        orderBy: { createdAt: 'desc' }
      });
      if (recentOrder) {
        response += `\n\n📦 Anda memiliki pesanan #${recentOrder.id} dengan status ${recentOrder.status}`;
      }
    }
    return response;
  }

  // Cari produk berdasarkan pesan
  async findProductSuggestion(query) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          name: true,
          slug: true
        }
      });
      return product ? product.name : null;
    } catch (error) {
      console.error('Error finding product:', error);
      return null;
    }
  }

  // Simpan chat history
  async saveChatHistory(userId, message, response) {
    try {
      // Bisa disimpan ke database jika diperlukan
      // await prisma.chatHistory.create({
      //   data: { userId, message, response }
      // });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
}

module.exports = new ChatbotService();