# Tem — thẻ thành viên 2 đầu

Thẻ thành viên tích điểm cho cửa hàng: khách xem thẻ/hạng/ưu đãi, quầy cộng điểm theo hoá đơn — chạy hoàn toàn trên trình duyệt, không cần máy chủ.

- **Demo:** https://yazfboy.github.io/chungketvcFPL/
- **Mã thử thống nhất:** `KT-004` (Dũng Phạm, hạng Bạc). Lần đầu mở: bấm **Nạp dữ liệu mẫu**.

## Tính năng (đến Phase 1)
- **2 vai trong 1 app**: chuyển “Thành viên | Quầy” ở góc phải header; tab bar đổi theo vai.
- **Quầy · Cộng điểm**: nhập/quét mã thành viên (tương thích máy quét USB — Enter để nhảy ô), số tiền tự định dạng, mã giao dịch (có nút Tự sinh), xem trước số điểm và lên hạng. Tiếng bíp + rung khi thành công (tắt được trong trang Dữ liệu).
- **Chống cộng trùng mã giao dịch** toàn hệ thống (kể cả mã mẫu TX-KT-*), không phân biệt hoa/thường/khoảng trắng.
- **Quầy · Thành viên**: tìm theo tên (không dấu), SĐT, mã; chi tiết có thẻ màu theo hạng + lịch sử biến động điểm.
- **Quầy · Dữ liệu** (nút ⋯): Nạp dữ liệu mẫu, Xóa toàn bộ dữ liệu, 5 ca kiểm tra của BTC với nút “Thử ca này”.
- Lưu trên máy bằng `localStorage` (khoá `tem:v1`), dữ liệu hỏng → tự khởi tạo lại.

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
  routes/tv/              # Thẻ, Ưu đãi, Lịch sử, Thể lệ (phase 2)
  components/             # TierChip, MemberMiniCard, TxnList, SampleLoadBlock...
  components/ui/          # Button, Field, Toast, Empty, PageHeader...
  lib/                    # rules.ts (quy tắc), seed.ts, format.ts, feedback.ts, search.ts — hàm thuần
  store/                  # AppStore (context + useReducer) + localStorage
  data/                   # JSON sinh từ file mẫu
```
