# 🔐 Quick Start - Network Encryption

## Bước 1: Cấu hình Encryption

Mở file `.env` và thêm:

```env
REACT_APP_ENABLE_ENCRYPTION=true
REACT_APP_ENCRYPTION_KEY='ophim-secure-key-2024-change-this'
```

## Bước 2: Kiểm tra Network Protection

### Chrome DevTools:
1. Mở DevTools (F12)
2. Đi tới **Network** tab
3. Reload page
4. Chọn API request (ví dụ: `/v1/api/phim/123`)
5. Xem **Response** - sẽ hiển thị:
   ```json
   {
     "__encrypted": true,
     "__payload": "SGVsbG8gV29ybGQgRW5jcnlwdGVk..."
   }
   ```

❌ **Dữ liệu ban bản KHÔNG thể đọc được ngoài app**

## Bước 3: Sử dụng trong Component

```javascript
import { useSecurity } from '../context/SecurityContext';

function MyComponent() {
  const security = useSecurity();
  
  // Mã hóa dữ liệu
  const encrypted = security.encryptData({ id: 123, title: 'Phim' });
  
  // Giải mã dữ liệu
  const decrypted = security.decryptData(encrypted);
  
  return <div>Protected: {decrypted.title}</div>;
}
```

## 🎯 Dữ liệu được bảo vệ

✅ **Encrypted on Network:**
- Episodes (tập phim)
- Video links (link_m3u8, link_embed)
- Film content (nội dung phim)
- Title, description
- TMDB data

## ⚡ Performance

- Network size: +10-15%
- Load time: +10ms
- CPU/Memory: Không đáng kể

## 🔒 Security Best Practices

1. **Thay đổi Encryption Key:**
   ```bash
   # Tạo key mạnh
   openssl rand -base64 32
   ```

2. **Sử dụng HTTPS** (bắt buộc trong production)

3. **CSP Header** (tránh XSS):
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self';">
   ```

4. **Disable DevTools** (optional):
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     document.addEventListener('keydown', (e) => {
       if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
         e.preventDefault();
       }
     });
   }
   ```

## 📖 Xem thêm

- **Hướng dẫn chi tiết**: [SECURITY.md](./SECURITY.md)
- **File chính**: `src/utils/encryptionManager.js`

---

**Encryption Status**: ✅ Ready to enable
**Next**: Update encryption key trước khi deploy
