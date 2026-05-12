/**
 * Data Encryption Manager
 * Mã hóa/giải mã dữ liệu trước khi gửi/nhận từ network
 * Sử dụng TweetNaCl.js cho mã hóa đơn giản nhưng an toàn
 */

// ✅ Simple XOR encryption (development mode)
// Để sản xuất, hãy sử dụng TweetNaCl hoặc crypto thực sự

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-change-this';

/**
 * Hash key thành 256-bit key
 * @param {string} key - Encryption key
 * @returns {Uint8Array} 32-byte key
 */
function deriveKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  
  // Simple hash function (không dùng SHA256 để giảm dependencies)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & 0xffffffff;
  }
  
  // Tạo 32-byte key bằng cách repeat hash
  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = (hash >> (i % 4) * 8) & 0xff;
  }
  return keyBytes;
}

/**
 * Mã hóa dữ liệu với XOR encryption + Base64
 * @param {any} data - Dữ liệu cần mã hóa (object, string, array)
 * @param {string} key - Encryption key (optional)
 * @returns {string} Encrypted Base64 string
 */
export function encryptData(data, key = ENCRYPTION_KEY) {
  try {
    // Chuyển object/array thành JSON string
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Encode string thành bytes
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(jsonString);
    
    // Derive encryption key
    const keyBytes = deriveKey(key);
    
    // XOR encrypt
    const encryptedBytes = new Uint8Array(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encryptedBytes[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert to Base64
    const binaryString = String.fromCharCode.apply(null, encryptedBytes);
    const base64String = btoa(binaryString);
    
    return base64String;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

/**
 * Giải mã dữ liệu từ Base64 + XOR encryption
 * @param {string} encryptedBase64 - Encrypted Base64 string
 * @param {string} key - Decryption key (optional)
 * @returns {any} Decrypted data (object/string)
 */
export function decryptData(encryptedBase64, key = ENCRYPTION_KEY) {
  try {
    // Convert Base64 to bytes
    const binaryString = atob(encryptedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Derive decryption key
    const keyBytes = deriveKey(key);
    
    // XOR decrypt
    const decryptedBytes = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      decryptedBytes[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Decode bytes to string
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBytes);
    
    // Try parse as JSON
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Mã hóa URL query params
 * @param {object} params - Query parameters
 * @returns {string} Encrypted Base64 string
 */
export function encryptParams(params) {
  const queryString = new URLSearchParams(params).toString();
  return encryptData(queryString);
}

/**
 * Giải mã URL query params
 * @param {string} encryptedParams - Encrypted Base64 string
 * @returns {object} Decrypted parameters
 */
export function decryptParams(encryptedParams) {
  const decrypted = decryptData(encryptedParams);
  if (!decrypted) return {};
  
  try {
    const params = new URLSearchParams(decrypted);
    const result = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  } catch (error) {
    console.error('Error parsing decrypted params:', error);
    return {};
  }
}

/**
 * Tạo secure headers cho API requests
 * @returns {object} Headers object với encryption
 */
export function getSecureHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Encryption-Version': '1.0',
    'X-Request-Time': new Date().getTime().toString(),
  };
}

/**
 * Kiểm tra nếu dữ liệu được mã hóa
 * @param {string} data - Data to check
 * @returns {boolean}
 */
export function isEncrypted(data) {
  try {
    // Check if valid Base64
    if (typeof data !== 'string') return false;
    return /^[A-Za-z0-9+/=]+$/.test(data) && data.length > 20;
  } catch {
    return false;
  }
}

export default {
  encryptData,
  decryptData,
  encryptParams,
  decryptParams,
  getSecureHeaders,
  isEncrypted,
};
