# XSon — Thẻ thành viên 2 đầu

Thẻ thành viên tích điểm cho cửa hàng: khách xem thẻ/hạng/ưu đãi, quầy cộng điểm theo hoá đơn — chạy hoàn toàn trên trình duyệt, không cần máy chủ.

- **Demo:** https://yazfboy.github.io/chungketvcFPL/
- **Mã thử thống nhất:** `KT-004` (Dũng Phạm, hạng Bạc). Lần đầu mở: bấm **Nạp dữ liệu mẫu**.

## Tính năng (đến Phase 2)
- **2 vai trong 1 app**: chuyển “Thành viên | Quầy” ở góc phải header; tab bar đổi theo vai.
- **Thành viên · Vào thẻ**: mở bằng SĐT hoặc mã; đăng ký (họ tên + SĐT, chặn trùng SĐT) → nhận mã KT-xxx ngay; danh sách “Dùng thử nhanh” (KT-004 đầu tiên).
- **Thành viên · Thẻ**: thẻ tỉ lệ thẻ ngân hàng, đổi màu theo hạng (Đồng/Bạc/Vàng), mã QR (payload = mã thành viên, tải được ảnh PNG), tiến độ lên hạng, ưu đãi gần nhất, 3 biến động gần nhất.
- **Thành viên · Ưu đãi**: đổi điểm (xem trước số dư, cảnh báo nếu tụt hạng), ví voucher XS-XXXX-XXXX (sao chép mã, trạng thái đã dùng).
- **Thành viên · Lịch sử** (lọc Tất cả/Cộng/Đổi, nhóm theo ngày) và **Thể lệ** (đọc trực tiếp từ `rules.ts`).
- **Quầy · Cộng điểm**: nhập/quét mã thành viên (tương thích máy quét USB — Enter để nhảy ô), số tiền tự định dạng, mã giao dịch (có nút Tự sinh), xem trước số điểm và lên hạng. Tiếng bíp + rung khi thành công (tắt được trong trang Dữ liệu).
- **Chống cộng trùng mã giao dịch** toàn hệ thống (kể cả mã mẫu TX-KT-*), không phân biệt hoa/thường/khoảng trắng.
- **Quầy · Thành viên**: tìm theo tên (không dấu), SĐT, mã; chi tiết có thẻ màu theo hạng + lịch sử biến động điểm.
- **Quầy · Dữ liệu** (nút ⋯): Nạp dữ liệu mẫu, Xóa toàn bộ dữ liệu, 5 ca kiểm tra của BTC với nút “Thử ca này”.
- Lưu trên máy bằng `localStorage` (khoá `tem:v1`), dữ liệu hỏng → tự khởi tạo lại.

### Phase 3 — mở rộng & điểm thưởng
- **Màn mở đầu** (~1,5s, chạm để bỏ qua, 1 lần mỗi phiên, tắt khi bật giảm chuyển động). Xem lại: menu ⋯ của Quầy → “Xem lại màn mở đầu”, hoặc thêm `?intro=1` vào URL.
- **Quét QR ở Quầy** (icon camera trong ô mã thành viên): camera sau + **Tải ảnh QR lên** (dùng ảnh QR tải từ tab Thẻ hoặc sheet KT_MaQR). Lỗi quyền camera / không HTTPS / ảnh không có QR đều có thông báo và nút “Nhập tay”.
- **Quầy · Voucher**: nhập/quét mã voucher → xem ưu đãi, chủ voucher, trạng thái → “Xác nhận sử dụng” (ghi lịch sử “Dùng voucher”). Voucher đã dùng báo thời điểm dùng. Ví phía Thành viên có nút “Hiện QR” cho voucher chưa dùng.
- **Quầy · Thống kê** (`src/lib/stats.ts`): tổng thành viên, điểm đã phát, điểm đã đổi, voucher đã dùng/đã phát; phân bố hạng (thanh màu hạng + %); top 5 theo điểm; 8 giao dịch gần nhất.
- **Hiệu ứng**: cộng điểm → “+N” nổi lên, số dư đếm tăng 400ms; lên hạng → màn chúc mừng ~1,6s (thẻ chuyển màu hạng cũ → mới, chạm để đóng) ở Quầy và ở vai Thành viên khi thấy hạng mới lần đầu. Tôn trọng `prefers-reduced-motion`.
- **Đồng bộ 2 đầu thời gian thực**: mở vai Thành viên ở tab A, Quầy ở tab B (cùng trình duyệt) → cộng điểm ở B, thẻ ở A tự cập nhật điểm, màu hạng và màn chúc mừng, không cần tải lại (sự kiện `storage` của localStorage).
- **Tự kiểm tra** (Quầy → ⋯ → Dữ liệu): nút “Chạy 5 ca kiểm tra BTC” chạy TC-KT-01..05 bằng `rules.ts` trên bản sao dữ liệu mẫu (không đụng dữ liệu thật), hiện kết quả mong đợi / thực tế / Đạt. Có công tắc âm thanh bíp.
- **Quầy thông minh** (`src/lib/counter.ts`): ô mã thành viên nhận cả SĐT đầy đủ hoặc 4 số cuối SĐT (khớp 1 → chọn luôn, khớp nhiều → danh sách chọn nhanh). Khi khách còn dưới 30% khoảng điểm để lên hạng: “Mua thêm 180.000đ để lên hạng …”.

## Thể lệ (nguồn duy nhất: `src/lib/rules.ts`)
- Tích điểm: **10.000đ = 1 điểm**, làm tròn xuống. Số tiền hợp lệ 10.000đ – 1.000.000.000đ.
- Hạng theo điểm hiện tại: **Đồng** < 1.000 · **Bạc** 1.000–4.999 · **Vàng** ≥ 5.000.
- Ưu đãi: Voucher 20.000đ (500 điểm) · Voucher 50.000đ (1.100 điểm) · Quà tặng đặc biệt (2.000 điểm) · Quà tri ân hạng Vàng (3.000 điểm, chỉ hạng Vàng).

## Công nghệ
Vite · React · TypeScript (strict) · Tailwind CSS v4 · react-router-dom (HashRouter) · motion · lucide-react · Be Vietnam Pro (tự host) · Vitest · xlsx (chỉ dùng trong script chuyển dữ liệu).

## Cách chạy
```bash
npm install
npm run dev      # chạy local
npm test         # unit test quy tắc + 5 ca KT_CaKiemTra
npm run build    # build ra dist/
```
Deploy tự động lên GitHub Pages bằng GitHub Actions mỗi lần push lên `main`.

## Nguồn dữ liệu
- File mẫu BTC: `data/mau.xlsx` → chuyển 1 lần sang JSON: `npm run data -- data/mau.xlsx` → `src/data/KT_*.json`.
- Mapping cột (chi tiết trong `src/lib/seed.ts`):
  - `KT_ThanhVien` → thành viên; **DiemHienTai** là điểm hiện tại (đã gồm giao dịch mẫu, không cộng lại).
  - `KT_GiaoDich` → lịch sử (7 giao dịch, gắn nhãn “Dữ liệu mẫu”), mã TX-KT-001..007 đã đăng ký chống trùng. `KT_LichSuDiem` trùng thông tin nên không dùng.
  - `KT_UuDai` → 3 ưu đãi (DiemCanDoi chuỗi → số). `KT_CaKiemTra` → trang Dữ liệu + unit test. `KT_MaQR`: payload = mã thành viên.
- Thành viên/giao dịch tạo mới trong app là dữ liệu mô phỏng lưu trên máy.

## Tài khoản demo
Không cần đăng nhập. Dùng mã `KT-004`.

## Cấu trúc thư mục
```
data/mau.xlsx             # file mẫu BTC (nguồn)
scripts/xlsx-to-json.mjs  # Excel → JSON
src/
  App.tsx, main.tsx       # HashRouter, header chuyển vai, tab bar
  routes/quay/            # Cộng điểm, Thành viên, Chi tiết, Dữ liệu
  routes/tv/              # TvLayout (chọn thẻ), Vào thẻ, Thẻ, Ưu đãi, Lịch sử, Thể lệ
  components/             # TierChip, MemberMiniCard, TxnList, SampleLoadBlock...
  components/ui/          # Button, Field, Toast, Empty, PageHeader...
  lib/                    # rules.ts (quy tắc), seed.ts, format.ts, feedback.ts, search.ts — hàm thuần
  store/                  # AppStore (context + useReducer) + localStorage
  data/                   # JSON sinh từ file mẫu
```
