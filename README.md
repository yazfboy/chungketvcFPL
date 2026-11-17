# Ứng dụng (tên chốt theo đề)

Web app tiếng Việt cho Chung kết VIBE-CODING 2026 — bảng Kỹ thuật. Mô tả 1 câu sẽ cập nhật khi có đề.

- **Demo:** https://yazfboy.github.io/chungketvcFPL/

## Tính năng chính
- Khung app mobile-first (tối ưu 360–390 px), tab bar cố định dưới đáy.
- Intro ngắn ≤ 1.2 giây, chạm để bỏ qua, tự tắt khi bật giảm chuyển động.
- Lưu trạng thái trên máy bằng `localStorage`; nút **Khôi phục dữ liệu mẫu** trong Cài đặt.

## Công nghệ
Vite · React · TypeScript (strict) · Tailwind CSS v4 · react-router-dom (HashRouter) · motion · lucide-react · Be Vietnam Pro (tự host qua `@fontsource/be-vietnam-pro`) · xlsx (chỉ dùng trong script chuyển dữ liệu).

## Cách chạy
```bash
npm install
npm run dev      # chạy local
npm run build    # build ra dist/
```
Deploy tự động lên GitHub Pages bằng GitHub Actions (`.github/workflows/deploy.yml`) mỗi lần push lên `main`.

## Nguồn dữ liệu
- File Excel mẫu của BTC → chuyển 1 lần sang JSON:
  ```bash
  npm run data -- duong-dan/file.xlsx
  ```
  Mỗi sheet thành một file trong `src/data/`. App import JSON tĩnh, không đọc Excel lúc chạy.
- Phần dữ liệu không có trong file mẫu là **mô phỏng** và được gắn nhãn "Dữ liệu mẫu"/"Mô phỏng" trên giao diện.

## Tài khoản demo
Không cần đăng nhập.

## Cấu trúc thư mục
```
src/
  main.tsx, App.tsx     # HashRouter + layout + tab bar
  routes/               # mỗi màn hình 1 file
  components/ui/        # Button, PageHeader, Empty, SampleTag...
  components/           # TabBar, Intro, component nghiệp vụ
  lib/                  # logic thuần (tính toán, lọc, format)
  data/                 # JSON từ file mẫu + seed
  store/                # localStorage an toàn (try/catch)
scripts/xlsx-to-json.mjs
```
