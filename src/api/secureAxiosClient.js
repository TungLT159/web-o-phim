/**
 * Secure Axios Client
 * Tự động mã hóa request/response để bảo vệ dữ liệu trên network
 */

import axios from "axios";
import queryString from 'query-string';
import apiConfig from "./apiConfig";
import { encryptData, decryptData, getSecureHeaders, isEncrypted } from "../utils/encryptionManager";

// Enable/disable encryption (set to true in production)
const ENABLE_ENCRYPTION = process.env.REACT_APP_ENABLE_ENCRYPTION === 'true' || false;

// Get HTTP request to REST API 
const secureAxiosClient = axios.create({
    baseURL: apiConfig.baseUrl,
    headers: {
        'Content-Type': 'application/json',
        ...getSecureHeaders(),
    },
    paramsSerializer: params => queryString.stringify({...params})
});

/**
 * Request Interceptor - Mã hóa dữ liệu gửi đi
 */
secureAxiosClient.interceptors.request.use(async (config) => {
    if (ENABLE_ENCRYPTION && config.data) {
        try {
            // Mã hóa request body
            const encrypted = encryptData(config.data);
            config.data = JSON.stringify({ 
                __encrypted: true,
                __payload: encrypted 
            });
            config.headers['X-Encrypted'] = 'true';
        } catch (error) {
            console.warn('Failed to encrypt request:', error);
        }
    }
    
    return config;
});

/**
 * Response Interceptor - Giải mã dữ liệu nhận được
 */
secureAxiosClient.interceptors.response.use((response) => {
    let data = response.data;
    
    // Check if response is encrypted
    if (ENABLE_ENCRYPTION && data && data.__encrypted) {
        try {
            const decrypted = decryptData(data.__payload);
            data = decrypted;
        } catch (error) {
            console.warn('Failed to decrypt response:', error);
            // Return encrypted data nếu giải mã thất bại
            return data;
        }
    }
    
    // Return processed data
    if (response && data) {
        return data;
    }
    
    return response;
}, (error) => {
    throw error;
});

export default secureAxiosClient;
export { ENABLE_ENCRYPTION };
