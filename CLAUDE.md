# CLAUDE.md — Quy tắc dự án (Chung kết VIBE-CODING 2026, bảng Kỹ thuật)

Bạn là kỹ sư frontend chính của đội. Đội có 60 phút. Mỗi phase phải kết thúc ở trạng thái build được, deploy được, demo được. Ưu tiên: chạy ổn định > đúng phần lõi của đề > mobile > đẹp > thêm tính năng.

## 1. Bối cảnh cố định
- Sản phẩm: web app, **toàn bộ giao diện tiếng Việt** (kể cả thông báo lỗi, placeholder, nhãn nút, trạng thái rỗng).
- Deploy: GitHub Pages, repo `yazfboy/chungketvcFPL` → URL `https://yazfboy.github.io/chungketvcFPL/`.
- Hosting tĩnh: KHÔNG có backend, KHÔNG có API key, KHÔNG yêu cầu đăng nhập thật. Trạng thái lưu bằng `localStorage` (bọc try/catch, có dữ liệu khởi tạo mặc định).
- Giám khảo chấm trên điện thoại khung **360–390 px**.

## 2. Stack (không đổi)
- Vite + React + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`).
- Router: `HashRouter` (react-router-dom) — bắt buộc để không 404 khi F5 trên GitHub Pages.
- `vite.config.ts`: `base: '/chungketvcFPL/'`.
- Icon: `lucide-react` (stroke 1.75, size 20). KHÔNG dùng emoji làm icon.
- Motion: `motion` (import từ `motion/react`).
- Font: `@fontsource-variable/be-vietnam-pro` (tự host, không phụ thuộc mạng ngoài). Số liệu dùng `font-variant-numeric: tabular-nums`.
- Dữ liệu đề: file Excel BTC phát → chuyển 1 lần sang JSON bằng script `scripts/xlsx-to-json.mjs` (thư viện `xlsx`), lưu vào `src/data/*.json`, app import JSON tĩnh. Không parse Excel lúc runtime.
- Biểu đồ (chỉ khi đề cần): `recharts`.

## 3. Cấu trúc thư mục
```
src/
  main.tsx, App.tsx          # HashRouter + layout + tab bar
  routes/                    # mỗi màn hình 1 file
  components/ui/             # Button, Input, Card, Sheet, Tabs, Empty, Toast...
  components/                # component theo nghiệp vụ
  lib/                       # logic thuần (tính toán, lọc, format) — KHÔNG dính UI
  data/                      # JSON từ file mẫu + seed
  store/                     # state + localStorage
scripts/xlsx-to-json.mjs
```
Logic nghiệp vụ (tính toán, quy tắc) nằm trong `src/lib/`, viết hàm thuần để dễ kiểm tra và dễ giải thích khi phản biện.

## 4. Mobile — luật cứng (10 điểm, chấm ở 360 px)
- Thiết kế mobile-first. Mọi màn hình phải đẹp ở 360 px trước, desktop chỉ là giãn ra (max-width ~ 480px cho khung app, căn giữa trên desktop).
- Không bao giờ có cuộn ngang: `html, body { overflow-x: hidden }`, mọi bảng dữ liệu trên mobile chuyển thành danh sách card hoặc bọc trong vùng cuộn riêng có gợi ý.
- Vùng chạm tối thiểu 44×44 px; khoảng cách giữa các nút ≥ 8 px.
- Cỡ chữ: body 16px, phụ 14px, không chữ nào < 12px. `input` luôn ≥ 16px (tránh iOS tự zoom).
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Điều hướng: **tab bar cố định dưới đáy** (3–5 tab, icon + nhãn, tab đang chọn có trạng thái rõ: màu nhấn + chữ đậm), chừa `padding-bottom: env(safe-area-inset-bottom)`. Mỗi màn hình có tiêu đề trang ở trên cùng.
- Nút hành động chính đặt trong tầm ngón cái (nửa dưới màn hình).
- Form: label luôn hiển thị (không chỉ placeholder), báo lỗi ngay dưới ô, bàn phím đúng loại (`inputMode="numeric"`, `type="tel"`...).

## 5. Thiết kế — chống "AI slop"
Mục tiêu: trông như sản phẩm của một công ty thật, gọn, tự tin, ít chi tiết.

CẤM:
- Gradient tím/xanh, nền gradient lòe loẹt, chữ gradient.
- Glassmorphism, blur nền, bóng đổ dày, glow.
- Emoji trong UI. Icon trong vòng tròn màu pastel lặp lại khắp nơi.
- Bố cục "hero + 3 card tính năng" kiểu landing page mẫu. Câu chữ kiểu "Trải nghiệm tuyệt vời", "Giải pháp toàn diện", "Mạnh mẽ".
- Bo góc quá lớn trên mọi thứ (>16px), mọi thứ đều là card có viền + bóng.
- Quá 1 màu nhấn. Màu ngẫu nhiên cho từng mục.
- Lorem ipsum, số liệu bịa không gắn nhãn.

NÊN:
- Bảng màu: nền `#FAFAF7` (giấy ấm), bề mặt `#FFFFFF`, chữ chính `#111111`, chữ phụ `#5C5C5C`, viền `#E6E4DF`. **Một màu nhấn duy nhất** (chốt theo đề trong `src/index.css` dưới dạng biến `--accent`). Màu trạng thái (thành công/cảnh báo/lỗi) chỉ dùng cho trạng thái.
- Typography làm chủ thị giác: tiêu đề lớn, đậm, letter-spacing âm nhẹ (-0.02em); con số quan trọng to, tabular.
- Phân cấp bằng khoảng trắng và cỡ chữ, không bằng viền/bóng. Thang khoảng cách 4/8/12/16/24/32.
- Bo góc thống nhất: 10px (nút, input), 14px (card).
- Viền mảnh 1px thay cho bóng. Nếu cần bóng: `0 1px 2px rgba(0,0,0,.04)`.
- Câu chữ cụ thể, ngắn, nói về việc người dùng làm ("Thêm đơn", "Xem 12 đơn chờ duyệt"), không quảng cáo.
- Trạng thái rỗng, đang tải, lỗi đều được thiết kế (có câu hướng dẫn + nút hành động).
- Dữ liệu mô phỏng: gắn nhãn nhỏ "Dữ liệu mẫu" hoặc "Mô phỏng" ngay cạnh số liệu/khối dữ liệu đó.

## 6. Motion
- **Intro mở đầu**: ≤ 1.2 giây, chạy 1 lần mỗi phiên (lưu `sessionStorage`), chạm để bỏ qua, KHÔNG chặn thao tác quá 1.2s. Phong cách: tên sản phẩm/wordmark hiện ra (mask reveal hoặc chữ trượt lên từng phần), một đường kẻ hoặc khối màu nhấn quét ngang, rồi thu về header. Không xoay, không nảy, không particle.
- Chuyển trang: fade + dịch 8px, 180–220ms, easing `[0.2, 0.8, 0.2, 1]`.
- Danh sách: stagger 30–40ms, tối đa 8 phần tử đầu.
- Phản hồi chạm: `whileTap={{ scale: 0.98 }}` trên nút.
- Tôn trọng `prefers-reduced-motion`: tắt intro và chuyển động lớn.

## 7. Chất lượng & ổn định (18 điểm)
- TypeScript strict, không `any` bừa bãi. Không để lỗi/warning đỏ trong console.
- Mọi input được validate; không crash khi dữ liệu rỗng hoặc sai định dạng.
- Có nút "Khôi phục dữ liệu mẫu" (reset localStorage) trong màn hình Cài đặt/Hồ sơ.
- Sau MỖI phase: chạy `npm run build` → sửa hết lỗi → `git add -A && git commit -m "phase X: ..." && git push`. Không kết thúc phase khi build đỏ.
- Không thêm tính năng ngoài phạm vi prompt của phase. Nếu thấy thiếu, liệt kê ở cuối câu trả lời thay vì tự làm.

## 8. Hồ sơ nộp bài (9 điểm)
- `README.md` (tiếng Việt) luôn cập nhật: tên + mô tả 1 câu, link demo, tính năng chính, công nghệ, cách chạy (`npm install`, `npm run dev`, `npm run build`), nguồn dữ liệu (file mẫu BTC + phần mô phỏng), tài khoản demo (nếu có), cấu trúc thư mục.
- Không đưa thông tin đăng nhập cá nhân hay khóa bí mật vào repo.

## 9. Cuối mỗi câu trả lời
Báo ngắn: đã làm gì, file nào thay đổi, build/push đã xanh chưa, còn gì chưa làm.
