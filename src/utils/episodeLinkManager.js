/**
 * Episode Link Manager
 * Quản lý việc lấy link xem phim một cách an toàn
 * Không lộ tất cả link ngay từ đầu, chỉ lấy khi người dùng click play
 */

import tmdbApi from '../api/tmdbApi';

/**
 * Cache để lưu episode links đã lấy
 * Tránh fetch nhiều lần cùng một episode
 */
const linkCache = new Map();

/**
 * Lấy link xem của một episode cụ thể
 * @param {string} movieId - ID của phim
 * @param {string} episodeName - Tên tập phim
 * @returns {Promise<object>} Object chứa {link_m3u8, link_embed}
 */
export const getEpisodeLink = async (movieId, episodeName) => {
  try {
    const cacheKey = `${movieId}_${episodeName}`;
    
    // Kiểm tra cache
    if (linkCache.has(cacheKey)) {
      return linkCache.get(cacheKey);
    }
    
    const links = await tmdbApi.episode(movieId, episodeName);
    
    linkCache.set(cacheKey, links);
    return links;
    
  } catch (error) {
    console.error(`Error fetching episode link for ${movieId}/${episodeName}:`, error);
    return { playlistUrl: null };
  }
};

/**
 * Xóa cache của một episode
 * @param {string} movieId - ID của phim
 * @param {string} episodeName - Tên tập phim
 */
export const clearEpisodeLinkCache = (movieId, episodeName) => {
  const cacheKey = `${movieId}_${episodeName}`;
  linkCache.delete(cacheKey);
};

/**
 * Xóa toàn bộ cache
 */
export const clearAllEpisodeLinks = () => {
  linkCache.clear();
};

/**
 * Lấy kích thước cache (debug)
 */
export const getCacheSizeInfo = () => {
  return `Episode links cached: ${linkCache.size}`;
};
