# Network Data Protection

Ứng dụng không gọi trực tiếp endpoint detail của `ophim1.com` từ browser nữa. Browser gọi backend/proxy nội bộ, proxy mới gọi upstream và chỉ trả dữ liệu đã lọc.

## Luồng Mới

1. Client gọi `GET /api/phim/:id`.
2. `server.js` gọi `https://ophim1.com/v1/api/phim/:id` từ server.
3. Server loại bỏ `link_m3u8` và `link_embed` khỏi `episodes` trước khi trả về client.
4. Khi người dùng chọn tập, client gọi `GET /api/phim/:id/episode?name=:episode`.
5. Server trả về `playlistUrl` dạng token như `/api/stream?t=...`, không trả URL gốc.
6. Playlist HLS được proxy qua `/api/stream`, các URL segment cũng được rewrite thành token proxy.

## Cách Chạy

```bash
npm run build
npm run serve
```

Mở `http://localhost:3000`.

## Kỳ Vọng Trên Network

`/api/phim/:id` không chứa:

```text
link_m3u8
link_embed
```

`/api/phim/:id/episode?name=...` chỉ trả:

```json
{
  "name": "1",
  "slug": "1",
  "playlistUrl": "/api/stream?t=<token>"
}
```

Playlist HLS chỉ chứa URL proxy:

```text
/api/stream?t=<token>
```

## Lưu Ý

Không thể “ẩn tuyệt đối” dữ liệu mà client cần để phát video. Cách này ẩn dữ liệu phim và URL upstream khỏi Network của browser bằng proxy token. Người dùng vẫn có thể thấy các request tới server của bạn, vì browser bắt buộc phải tải video để phát.
