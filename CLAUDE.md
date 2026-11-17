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
- Font: `@fontsource/be-vietnam-pro` (tự host, không phụ thuộc mạng ngoài). Số liệu dùng `font-variant-numeric: tabular-nums`.
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

## 10. BỔ SUNG THEO ĐỀ (ưu tiên cao hơn các mục trên nếu mâu thuẫn)
- Đề: Hệ thống thẻ thành viên 2 đầu (Thành viên & Quầy). Tên app "XSon". --accent #1E5B45.
- NGOẠI LỆ MÀU: thẻ thành viên BẮT BUỘC đổi màu theo hạng — Đồng #8A5A3B, Bạc #6F7A86, Vàng #A9802A (nền đặc, chữ trắng). Màu hạng được dùng cho thẻ, chip hạng, thanh phân bố hạng. Mọi bước rà soát "anti-slop" KHÔNG được xóa/làm nhạt màu hạng. Phần UI còn lại vẫn 1 màu nhấn.
- Nút đúng tên "Nạp dữ liệu mẫu" (không phải "Khôi phục"). Khi chưa có dữ liệu, màn đầu tiên của CẢ HAI vai hiện nút này nổi bật + dòng "Mã thử thống nhất: KT-004". Ngoài ra có ở trang Dữ liệu (vai Quầy).
- QR: chỉ dùng qrcode.react (tạo) và html5-qrcode (quét, dùng class Html5Qrcode, UI tự làm). Sheet quét có 2 cách: camera + "Tải ảnh QR lên" (Html5Qrcode.scanFile) để giám khảo dùng ảnh QR từ sheet KT_MaQR. Không cài thư viện QR nào khác.
- Ngoại vi: (1) ô mã thành viên/voucher tương thích máy quét mã vạch USB/Bluetooth (autoFocus, Enter để gửi/nhảy ô); (2) tiếng bíp ngắn bằng Web Audio API (OscillatorNode ~880Hz, 120ms) khi quét thành công và khi cộng điểm thành công; (3) navigator.vibrate?.(80) cùng lúc (iOS không hỗ trợ thì bỏ qua êm). Gom vào src/lib/feedback.ts, có công tắc bật/tắt âm thanh.
- Motion ưu tiên: hiệu ứng cộng điểm (+N nổi lên, số đếm tăng) và màn chúc mừng lên hạng quan trọng hơn intro. Intro giữ đơn giản, ≤1.1s, không được tốn quá 5 phút làm.

## 11. PHẠM VI ĐẦY ĐỦ — PHẢI HOÀN THÀNH HẾT (lõi + mở rộng + điểm thưởng)
Mỗi phase chỉ làm phần được giao, nhưng thiết kế code từ đầu để chứa đủ danh sách này. Không được tự ý bỏ mục nào.
LÕI (P1–P2):
[ ] Đăng ký tên + SĐT, sinh mã KT-xxx duy nhất, hiện trên thẻ
[ ] Điểm + 3 hạng Đồng/Bạc/Vàng tự đổi theo mốc, thẻ đổi màu theo hạng, mốc công bố ở Thể lệ
[ ] Chế độ Quầy chuyển vai trong app: mã TV + số tiền → cộng điểm theo tỉ lệ, cập nhật ngay
[ ] Chống cộng trùng mã giao dịch (báo lỗi, không cộng)
[ ] Đổi điểm ≥2 mức, trừ đúng điểm, ví ưu đãi
[ ] Lịch sử biến động: loại, số điểm, thời gian
[ ] Nút "Nạp dữ liệu mẫu" từ file BTC, mã thử KT-004, pass 5 ca KT_CaKiemTra
[ ] localStorage, chạy được khi mất mạng
MỞ RỘNG + ĐIỂM THƯỞNG (P3):
[ ] QR trên thẻ (payload = mã TV) — điểm thưởng
[ ] Quét QR bằng camera ở Quầy + tải ảnh QR lên để quét — điểm thưởng
[ ] Hiệu ứng cộng điểm (+N, số đếm tăng) và màn chúc mừng lên hạng / cảnh báo tụt hạng
[ ] Thiết bị ngoại vi: camera, máy quét mã vạch USB/Bluetooth (Enter), tiếng bíp Web Audio, rung
[ ] Thống kê mini: tổng thành viên, tổng điểm đã phát (+ điểm đã đổi, phân bố hạng, giao dịch gần đây)
[ ] Quầy dùng voucher theo mã (đóng vòng đổi quà → dùng quà)
[ ] Intro mở đầu ≤1.1s
HOÀN THIỆN (P4):
[ ] PWA offline (tải lại trang khi mất mạng vẫn chạy)
[ ] Rà 360px toàn bộ, README đầy đủ, bảng đối chiếu yêu cầu ↔ màn hình
Cuối mỗi phase: in lại checklist này, đánh dấu [x] mục đã xong, liệt kê mục còn thiếu.