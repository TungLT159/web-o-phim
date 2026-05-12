/**
 * Secure Film Data Manager
 * Mã hóa dữ liệu phim trước khi lưu/hiển thị trên client
 */

import { encryptData, decryptData, isEncrypted } from "./encryptionManager";

const ENCRYPTED_FILM_CACHE_KEY = 'ophim_encrypted_films';
const MAX_CACHE_SIZE = 50; // Lưu tối đa 50 phim trong cache

/**
 * Mã hóa dữ liệu phim
 * @param {object} filmData - Dữ liệu phim gốc
 * @returns {object} Dữ liệu phim đã mã hóa
 */
export function encryptFilmData(filmData) {
  try {
    // Chỉ mã hóa các field nhạy cảm
    const encrypted = {
      ...filmData,
      __encrypted: true,
      __payload: encryptData({
        episodes: filmData.episodes,
        tmdb: filmData.tmdb,
        content: filmData.content,
        title: filmData.title,
        name: filmData.name,
      }),
    };
    
    // Loại bỏ các field gốc để tránh lộ
    delete encrypted.episodes;
    
    return encrypted;
  } catch (error) {
    console.error('Error encrypting film data:', error);
    return filmData;
  }
}

/**
 * Giải mã dữ liệu phim
 * @param {object} encryptedFilmData - Dữ liệu phim đã mã hóa
 * @returns {object} Dữ liệu phim gốc
 */
export function decryptFilmData(encryptedFilmData) {
  try {
    if (!encryptedFilmData.__encrypted) {
      return encryptedFilmData;
    }
    
    const decrypted = decryptData(encryptedFilmData.__payload);
    
    return {
      ...encryptedFilmData,
      ...decrypted,
      __encrypted: false,
    };
  } catch (error) {
    console.error('Error decrypting film data:', error);
    return encryptedFilmData;
  }
}

/**
 * Lưu dữ liệu phim đã mã hóa vào cache
 * @param {string} filmId - ID của phim
 * @param {object} filmData - Dữ liệu phim
 */
export function cacheEncryptedFilm(filmId, filmData) {
  try {
    let cache = JSON.parse(localStorage.getItem(ENCRYPTED_FILM_CACHE_KEY) || '[]');
    
    // Xóa film cũ nếu đã tồn tại
    cache = cache.filter(item => item.id !== filmId);
    
    // Thêm film mới lên đầu
    cache.unshift({
      id: filmId,
      data: filmData,
      timestamp: new Date().getTime(),
    });
    
    // Giới hạn cache size
    if (cache.length > MAX_CACHE_SIZE) {
      cache.pop();
    }
    
    localStorage.setItem(ENCRYPTED_FILM_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error caching encrypted film:', error);
  }
}

/**
 * Lấy dữ liệu phim đã mã hóa từ cache
 * @param {string} filmId - ID của phim
 * @returns {object|null} Dữ liệu phim hoặc null
 */
export function getCachedEncryptedFilm(filmId) {
  try {
    const cache = JSON.parse(localStorage.getItem(ENCRYPTED_FILM_CACHE_KEY) || '[]');
    const cached = cache.find(item => item.id === filmId);
    
    if (cached) {
      // Check if cache expired (1 hour)
      const now = new Date().getTime();
      if (now - cached.timestamp < 3600000) {
        return cached.data;
      } else {
        // Remove expired cache
        const filtered = cache.filter(item => item.id !== filmId);
        localStorage.setItem(ENCRYPTED_FILM_CACHE_KEY, JSON.stringify(filtered));
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error retrieving cached film:', error);
    return null;
  }
}

/**
 * Xóa cache phim
 */
export function clearFilmCache() {
  try {
    localStorage.removeItem(ENCRYPTED_FILM_CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing film cache:', error);
  }
}

/**
 * Mã hóa URL để ẩn film ID từ address bar
 * @param {string} filmId - ID của phim
 * @param {string} category - Thể loại phim
 * @returns {string} Encrypted URL slug
 */
export function encryptFilmUrl(filmId, category) {
  try {
    const urlData = { filmId, category, timestamp: new Date().getTime() };
    const encrypted = encryptData(urlData);
    
    // Replace characters không hợp lệ trong URL
    return encrypted
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '.');
  } catch (error) {
    console.error('Error encrypting film URL:', error);
    return `${filmId}`;
  }
}

/**
 * Giải mã URL để lấy film ID
 * @param {string} encryptedUrl - Encrypted URL slug
 * @returns {object} {filmId, category} hoặc null
 */
export function decryptFilmUrl(encryptedUrl) {
  try {
    // Restore characters
    const restored = encryptedUrl
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/\./g, '=');
    
    const decrypted = decryptData(restored);
    
    // Check if URL không expired (5 minutes)
    const now = new Date().getTime();
    if (decrypted && (now - decrypted.timestamp) < 300000) {
      return { filmId: decrypted.filmId, category: decrypted.category };
    }
    
    return null;
  } catch (error) {
    console.error('Error decrypting film URL:', error);
    return null;
  }
}

export default {
  encryptFilmData,
  decryptFilmData,
  cacheEncryptedFilm,
  getCachedEncryptedFilm,
  clearFilmCache,
  encryptFilmUrl,
  decryptFilmUrl,
};
