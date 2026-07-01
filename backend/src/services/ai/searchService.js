const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const natural = require('natural');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 1800 }); // Cache 30 menit

class SearchService {
  constructor() {
    // Inisialisasi tokenizer
    this.tokenizer = new natural.WordTokenizer();
    
    // Data sinonim
    this.synonyms = {
      'hp': ['handphone', 'smartphone', 'telepon', 'ponsel'],
      'laptop': ['notebook', 'komputer', 'pc'],
      'sepatu': ['sandal', 'alas kaki', 'footwear'],
      'baju': ['pakaian', 'kaos', 'kemeja', 'daster'],
      'tas': ['ransel', 'sling bag', 'dompet'],
      'makanan': ['snack', 'cemilan', 'makanan ringan'],
      'minuman': ['air mineral', 'soda', 'jus', 'kopi'],
      'elektronik': ['electronic', 'gadget', 'perangkat'],
      'fashion': ['pakaian', 'busana', 'apparel'],
      'kesehatan': ['vitamin', 'obat', 'suplemen'],
      'kecantikan': ['makeup', 'skincare', 'beauty'],
      'rumah tangga': ['peralatan rumah', 'home', 'kitchen'],
      'otomotif': ['mobil', 'motor', 'kendaraan'],
      'aksesoris': ['aksesori', 'perhiasan', 'jewelry']
    };

    // Koreksi typo umum
    this.typoCorrections = {
      'hp': 'hp',
      'handphone': 'hp',
      'handfon': 'hp',
      'smartphon': 'smartphone',
      'notebok': 'laptop',
      'kompuer': 'komputer',
      'sepatu': 'sepatu',
      'sepatu': 'sepatu',
      'baju': 'baju',
      'makanan': 'makanan',
      'minuman': 'minuman'
    };
  }

  // 1. Smart Search dengan NLP
  async smartSearch(query, filters = {}, limit = 20) {
    try {
      const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      // Normalisasi query
      const normalizedQuery = this.normalizeQuery(query);
      const expandedTerms = this.expandQuery(normalizedQuery);
      const correctedQuery = this.correctTypo(normalizedQuery);

      // Build search conditions
      const where = {
        AND: [
          { stock: { gt: 0 } },
          ...this.buildSearchConditions(expandedTerms, correctedQuery)
        ]
      };

      // Apply filters
      if (filters.categoryId) {
        where.AND.push({ categoryId: parseInt(filters.categoryId) });
      }
      if (filters.minPrice) {
        where.AND.push({ price: { gte: parseFloat(filters.minPrice) } });
      }
      if (filters.maxPrice) {
        where.AND.push({ price: { lte: parseFloat(filters.maxPrice) } });
      }
      if (filters.sellerId) {
        where.AND.push({ sellerId: parseInt(filters.sellerId) });
      }
      if (filters.rating) {
        // Filter produk dengan rating minimal
        // (Implementasi rating filtering)
      }

      // Execute search
      let results = await prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: { include: { store: true } }
        },
        orderBy: [
          // Prioritaskan produk dengan nama yang cocok
          {
            // Custom sorting berdasarkan relevansi
            // (Menggunakan order by di aplikasi)
          }
        ],
        take: limit
      });

      // Sort by relevance (manual sorting)
      results = this.sortByRelevance(results, expandedTerms, correctedQuery);

      // Simpan ke cache
      cache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error('Error in smart search:', error);
      return [];
    }
  }

  // 2. Auto Complete / Suggestion
  async getSuggestions(query, limit = 10) {
    try {
      const suggestions = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          name: true,
          slug: true
        },
        distinct: ['name'],
        take: limit
      });

      // Tambahkan suggestions dari sinonim
      const synonymSuggestions = [];
      for (const [key, values] of Object.entries(this.synonyms)) {
        if (query.toLowerCase().includes(key)) {
          synonymSuggestions.push(...values);
        }
      }

      // Gabungkan dan unique
      const allSuggestions = [...new Set([
        ...suggestions.map(s => s.name),
        ...synonymSuggestions
      ])];

      return allSuggestions.slice(0, limit);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  // Helper Methods
  normalizeQuery(query) {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  expandQuery(query) {
    const words = this.tokenizer.tokenize(query) || [];
    const expanded = new Set(words);

    // Tambahkan sinonim
    words.forEach(word => {
      for (const [key, values] of Object.entries(this.synonyms)) {
        if (word.includes(key) || key.includes(word)) {
          values.forEach(val => expanded.add(val));
        }
        // Cek apakah word ada di values
        if (values.includes(word)) {
          expanded.add(key);
        }
      }
    });

    return Array.from(expanded);
  }

  correctTypo(query) {
    const words = query.split(' ');
    const corrected = words.map(word => {
      return this.typoCorrections[word] || word;
    });
    return corrected.join(' ');
  }

  buildSearchConditions(expandedTerms, correctedQuery) {
    const conditions = [];

    // Search di nama dan deskripsi
    const searchTerms = [...expandedTerms, correctedQuery];
    const uniqueTerms = [...new Set(searchTerms)].filter(t => t.length > 2);

    if (uniqueTerms.length > 0) {
      conditions.push({
        OR: [
          ...uniqueTerms.map(term => ({
            name: { contains: term, mode: 'insensitive' }
          })),
          ...uniqueTerms.map(term => ({
            description: { contains: term, mode: 'insensitive' }
          }))
        ]
      });
    }

    return conditions;
  }

  sortByRelevance(results, expandedTerms, correctedQuery) {
    return results.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prioritas produk dengan nama yang sama persis
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Produk dengan nama yang cocok dengan query asli
      if (aName === correctedQuery) scoreA += 10;
      if (bName === correctedQuery) scoreB += 10;

      // Produk dengan nama yang mengandung query
      if (aName.includes(correctedQuery)) scoreA += 5;
      if (bName.includes(correctedQuery)) scoreB += 5;

      // Produk dengan nama yang mengandung expanded terms
      expandedTerms.forEach(term => {
        if (aName.includes(term)) scoreA += 2;
        if (bName.includes(term)) scoreB += 2;
      });

      // Prioritas produk dengan rating tinggi
      if (a.rating) scoreA += a.rating / 5;
      if (b.rating) scoreB += b.rating / 5;

      // Prioritas produk yang lebih baru
      if (a.createdAt > b.createdAt) scoreA += 1;
      if (b.createdAt > a.createdAt) scoreB += 1;

      return scoreB - scoreA;
    });
  }

  // Clear cache
  clearCache() {
    cache.flushAll();
  }
}

module.exports = new SearchService();