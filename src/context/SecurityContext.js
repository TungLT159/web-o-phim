/**
 * Network Security Provider
 * Cung cấp các hàm để ẩn/mã hóa dữ liệu trên network
 */

import React, { createContext, useContext } from 'react';
import {
  encryptData,
  decryptData,
  encryptParams,
  decryptParams,
  isEncrypted,
} from './encryptionManager';

const SecurityContext = createContext(null);

/**
 * Security Provider Component
 */
export const SecurityProvider = ({ children, enableEncryption = true }) => {
  const value = {
    enableEncryption,
    encryptData,
    decryptData,
    encryptParams,
    decryptParams,
    isEncrypted,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

/**
 * Hook để sử dụng security context
 */
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

export default SecurityContext;
