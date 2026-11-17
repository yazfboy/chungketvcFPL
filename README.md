# XSon — Thẻ thành viên 2 đầu

Số hóa thẻ thành viên giấy: khách tích điểm và đổi ưu đãi, nhân viên quầy cộng điểm theo hóa đơn — mô hình app thành viên kiểu Starbucks, chạy hoàn toàn trên trình duyệt.

- Demo: https://yazfboy.github.io/chungketvcFPL/
- Mã thử thống nhất: `KT-004` (Dũng Phạm)
- Tài khoản Quầy demo: `admin` / `XSon`

## Kiểm tra nhanh trong 2 phút

1. Mở link demo, bấm **Nạp dữ liệu mẫu**.
2. Chọn vai **Quầy** (góc phải header) → tab **Cộng điểm**.
3. Nhập `KT-008`, số tiền `1.000.000`, mã giao dịch `TX-NEW-001` → **Cộng điểm** → +100 điểm, số dư 0 → 100.
4. Nhập `KT-002`, mã giao dịch `TX-KT-002` → báo trùng, không cộng (vẫn 1.450 điểm).
5. Chuyển vai **Thành viên** → mở thẻ `KT-005` → tab **Ưu đãi** → đổi **Voucher 20.000đ** → số dư 5.300, voucher nằm trong **Ví ưu đãi**.
6. Tab **Lịch sử** → xem biến động vừa tạo; tab **Thể lệ** → tỉ lệ, mốc hạng, ưu đãi.
7. Quầy → Cộng điểm → icon quét trong ô mã thành viên → **Tải ảnh QR lên** (ảnh `QR-KT-004.png` tải từ tab Thẻ của KT-004, hoặc ảnh QR trong sheet KT_MaQR) → ra `KT-004`.
8. Quầy → menu ⋯ → **Dữ liệu & ca kiểm tra** → **Chạy 5 ca kiểm tra BTC** → 5/5 ca đạt.

Mỗi ca trong trang Dữ liệu còn có nút **Thử ca này** để mở đúng màn với dữ liệu điền sẵn.

## Đối chiếu yêu cầu đề

| Yêu cầu | Vị trí trong app | Trạng thái |
|---|---|---|
| Đăng ký tên + SĐT, sinh mã KT-xxx duy nhất, hiện trên thẻ | Thành viên → Vào thẻ → Đăng ký thành viên | Hoàn thành |
| Điểm + 3 hạng Đồng/Bạc/Vàng, thẻ đổi màu theo hạng | Thành viên → Thẻ; mốc ở Thể lệ | Hoàn thành |
| Chế độ Quầy: mã thành viên + số tiền → cộng điểm theo tỉ lệ | Quầy → Cộng điểm | Hoàn thành |
| Chống cộng trùng mã giao dịch | Quầy → Cộng điểm (khung lỗi dưới ô mã giao dịch) | Hoàn thành |
| Đổi điểm ≥ 2 mức, trừ đúng điểm, ví ưu đãi | Thành viên → Ưu đãi (Đổi điểm / Ví ưu đãi) | Hoàn thành |
| Lịch sử biến động: loại, số điểm, thời gian | Thành viên → Lịch sử; Quầy → Thành viên → chi tiết | Hoàn thành |
| Nạp dữ liệu mẫu từ file BTC, mã thử KT-004, 5 ca KT_CaKiemTra | Màn đầu của cả 2 vai; Quầy → ⋯ → Dữ liệu | Hoàn thành |
| Lưu bằng localStorage | Toàn app (khóa `tem:v1`) | Hoàn thành |
| Chạy khi mất mạng (tải lại trang lúc offline) | — | Chưa hoàn thành |
| QR trên thẻ (payload = mã thành viên) | Thành viên → Thẻ → Hiện mã QR | Hoàn thành |
| Quét QR bằng camera + tải ảnh QR lên | Quầy → Cộng điểm / Voucher → icon quét | Hoàn thành (quét ảnh đã kiểm thử; camera cần HTTPS) |
| Hiệu ứng cộng điểm, chúc mừng lên hạng, cảnh báo tụt hạng | Quầy → Cộng điểm; Thành viên → Ưu đãi | Hoàn thành |
| Thiết bị ngoại vi (camera, máy quét mã vạch, âm báo, rung) | Quầy → Cộng điểm, Voucher | Hoàn thành |
| Thống kê mini | Quầy → Thống kê | Hoàn thành |

## Thể lệ

Nguồn duy nhất: `src/lib/rules.ts` — trang Thể lệ trong app đọc trực tiếp từ đây.

- Tỉ lệ: **10.000đ = 1 điểm**, làm tròn xuống (VD: 199.000đ → 19 điểm). Số tiền hợp lệ từ 10.000đ đến 1.000.000.000đ; dưới 10.000đ không tích điểm.

| Hạng | Mốc điểm (điểm hiện tại) | Màu thẻ |
|---|---|---|
| Đồng | dưới 1.000 | `#8A5A3B` |
| Bạc | 1.000 – 4.999 | `#6F7A86` |
| Vàng | từ 5.000 | `#A9802A` |

| Mã | Tên | Điểm cần | Điều kiện |
|---|---|---|---|
| KT-VCH-01 | Voucher 20.000đ | 500 | Mọi hạng (từ file BTC) |
| KT-VCH-02 | Voucher 50.000đ | 1.100 | Mọi hạng (từ file BTC) |
| KT-VCH-03 | Quà tặng đặc biệt | 2.000 | Mọi hạng (từ file BTC) |
| KT-VCH-VANG | Quà tri ân hạng Vàng | 3.000 | Chỉ hạng Vàng (ưu đãi của đội) |

Quy tắc:
- Hạng tính theo điểm hiện tại, nên đổi quà có thể làm hạng giảm — màn xác nhận luôn báo trước ("Sau khi đổi, hạng sẽ chuyển từ Vàng xuống Bạc").
- Mỗi mã giao dịch chỉ được cộng 1 lần trên toàn hệ thống: mã được chuẩn hóa (bỏ khoảng trắng thừa, chữ hoa) trước khi kiểm tra, gồm cả mã mẫu TX-KT-001..007.
- Mỗi voucher (mã `XS-XXXX-XXXX`) chỉ dùng 1 lần, xác nhận tại Quầy.

## Phần mở rộng

- **Màn mở đầu** (~1,5 giây, chạm để bỏ qua, 1 lần mỗi phiên, tắt khi bật giảm chuyển động). Xem lại: Quầy → ⋯ → "Xem lại màn mở đầu", hoặc thêm `?intro=1` vào URL.
- **Quét QR**: camera sau (Html5Qrcode, khung ngắm tự vẽ) + "Tải ảnh QR lên"; lỗi quyền camera / không HTTPS / ảnh không có QR đều có thông báo và nút "Nhập tay".
- **Voucher tại quầy**: nhập hoặc quét mã → xem ưu đãi, chủ voucher, trạng thái → "Xác nhận sử dụng" (ghi lịch sử). Ví phía Thành viên có QR cho từng voucher chưa dùng.
- **Thống kê**: tổng thành viên, điểm đã phát, điểm đã đổi, voucher đã dùng/đã phát, phân bố hạng, top 5, 8 giao dịch gần nhất.
- **Hiệu ứng**: "+N" nổi lên và số dư đếm tăng khi cộng điểm; màn chúc mừng lên hạng (~1,6 giây) ở Quầy và ở vai Thành viên khi thấy hạng mới lần đầu.
- **Đồng bộ 2 tab thời gian thực**: vai Thành viên ở tab A, Quầy ở tab B — cộng điểm ở B thì thẻ ở A tự cập nhật, không tải lại.
- **Tự kiểm tra 5 ca BTC** trong app, chạy trên bản sao dữ liệu mẫu (không đụng dữ liệu thật).
- **Quầy thông minh**: ô mã nhận cả SĐT đầy đủ hoặc 4 số cuối SĐT; gợi ý "Mua thêm …đ để lên hạng …" khi khách còn dưới 30% khoảng điểm.
- **Đăng nhập Quầy mô phỏng** (`admin` / `XSon`, điền sẵn); mở link Quầy, "Nạp dữ liệu mẫu", "Thử ca này" đều tự đăng nhập.
- **Chạy offline (PWA)**: Chưa hoàn thành.

## Thiết bị ngoại vi

| Thiết bị | Cách dùng | Ghi chú |
|---|---|---|
| Camera | Quét QR thẻ thành viên / voucher ở Quầy | Cần HTTPS hoặc localhost; bị từ chối quyền → thông báo + nhập tay |
| Máy quét mã vạch USB/Bluetooth | Chế độ bàn phím: ô mã tự focus, Enter để nhảy sang ô tiếp theo | Không cần cài thêm |
| Âm báo | Tiếng bíp Web Audio (~880Hz, 120ms) khi quét / cộng điểm thành công | Bật/tắt ở Quầy → ⋯ → Dữ liệu |
| Rung | `navigator.vibrate` 80ms cùng lúc với âm báo | Chỉ Android; iOS không hỗ trợ rung (bỏ qua êm) |

## Dữ liệu mẫu

Nguồn: file BTC `data/mau.xlsx` → chuyển 1 lần sang JSON bằng `scripts/xlsx-to-json.mjs` (tự dò dòng header vì dòng 3 trong file để trống) → `src/data/KT_*.json`. App import JSON tĩnh, không đọc Excel lúc chạy. Mapping chi tiết trong `src/lib/seed.ts`.

| Sheet | Dữ liệu trong app |
|---|---|
| KT_ThanhVien | 8 thành viên; `DiemHienTai` → điểm, SĐT giữ số 0 đầu, `NgayThamGia` → ISO (giờ Việt Nam) |
| KT_GiaoDich | 7 giao dịch lịch sử; `ThoiGian` → ISO, `ThayDoiDiem` có dấu |
| KT_UuDai | 3 ưu đãi (`DiemCanDoi` chuỗi → số) |
| KT_CaKiemTra | 5 ca trên trang Dữ liệu + unit test + tự kiểm tra |
| KT_MaQR | Payload = mã thành viên; app tự sinh QR, không dùng ảnh |
| KT_LichSuDiem | Không dùng (trùng thông tin KT_GiaoDich) |

- Điểm hiện tại đã gồm giao dịch mẫu, không cộng lại khi nạp.
- TX-KT-001..007 được đánh dấu đã dùng, nhập lại sẽ báo trùng.
- Dữ liệu là hư cấu, gắn nhãn "Dữ liệu mẫu" trong app.

## Quyết định thiết kế

- Một nguồn quy tắc duy nhất (`src/lib/rules.ts`) cho cả logic và trang Thể lệ — đổi một hằng số là cả app và trang công bố cùng đổi.
- Hạng tính theo điểm hiện tại để khớp hạng tham chiếu trong file BTC (cả 8 thành viên mẫu đều ra đúng hạng).
- Chống trùng mã giao dịch có chuẩn hóa (`" tx-kt-002 "` = `TX-KT-002`) và kiểm tra trên sổ toàn hệ thống.
- Mọi thao tác nghiệp vụ là hàm thuần trả `{ ok, state }` hoặc `{ ok: false, error }` thay vì throw — dữ liệu sai không làm crash app; dữ liệu lưu bị hỏng thì tự khởi tạo lại.
- Mobile-first ở 360px: tab bar dưới đáy, nút ≥ 44px, không cuộn ngang, một màu nhấn `#1E5B45` (riêng màu hạng dùng cho thẻ, chip hạng, thanh phân bố).

## Công nghệ

| Thành phần | Phiên bản |
|---|---|
| Vite | ^8.3.8 |
| React / React DOM | ^19.3.1 |
| TypeScript (strict) | ^7.0.2 |
| Tailwind CSS v4 (`@tailwindcss/vite`) | ^4.3.5 |
| React Router (`react-router-dom`, HashRouter) | ^7.18.5 |
| motion | ^14.14.0 |
| lucide-react | ^1.74.0 |
| qrcode.react | ^4.2.0 |
| html5-qrcode | ^2.3.8 |
| vitest | ^5.1.0 |
| xlsx (chỉ dùng trong script chuyển dữ liệu) | ^0.18.5 |
| Be Vietnam Pro (`@fontsource/be-vietnam-pro`, tự host) | ^5.3.0 |
| vite-plugin-pwa | Chưa dùng (offline chưa hoàn thành) |
| GitHub Actions + GitHub Pages | Deploy tự động khi push `main` |

## Cài đặt và chạy

Yêu cầu Node ≥ 20.

```bash
npm install
npm run dev                     # chạy local
npm test                        # unit test
npm run build                   # build ra dist/
npm run data -- data/mau.xlsx   # chuyển file BTC sang src/data/*.json
```

## Cấu trúc thư mục

```
data/mau.xlsx               file mẫu BTC (nguồn)
scripts/xlsx-to-json.mjs    Excel → JSON
.github/workflows/          deploy GitHub Pages
src/
  App.tsx, main.tsx         HashRouter, header chuyển vai, cổng Quầy, màn mở đầu, tab bar
  routes/tv/                vai Thành viên: Vào thẻ, Thẻ, Ưu đãi, Lịch sử, Thể lệ
  routes/quay/              vai Quầy: Đăng nhập, Cộng điểm, Voucher, Thành viên, Thống kê, Dữ liệu
  components/               thẻ thành viên, sheet QR/quét QR, chúc mừng lên hạng, lịch sử...
  components/ui/            Button, Field, Sheet, Toast, Empty, PageHeader...
  lib/                      logic thuần: rules, seed, stats, selfcheck, counter, format, feedback, auth
  store/                    state (context + useReducer) + localStorage
  data/                     JSON sinh từ file mẫu
```

## Kiểm thử

`npm test`: **26 test, 3 file, tất cả pass**.

- 5 ca KT_CaKiemTra (TC-KT-01..05) và kiểm tra đủ 5 ca trong file mẫu.
- Dữ liệu mẫu: 8 thành viên ra đúng hạng tham chiếu, không cộng lại giao dịch, giữ số 0 đầu SĐT, thời gian ISO hợp lệ.
- Ca biên quy tắc: mốc hạng 999 / 1.000 / 4.999 / 5.000, làm tròn xuống, số tiền ngoài giới hạn, chuẩn hóa mã giao dịch, đổi quà làm tụt hạng, ưu đãi chỉ hạng Vàng, voucher dùng 1 lần, đăng ký (mã KT-009, SĐT trùng, SĐT sai), mở thẻ bằng mã hoặc SĐT, nhóm ngày theo giờ Việt Nam.
- Thống kê, tự kiểm tra 5 ca, quầy thông minh (SĐT, 4 số cuối trùng nhiều người, gợi ý mua thêm).

## Giới hạn và hướng phát triển

- Dữ liệu lưu trên từng thiết bị (localStorage), chỉ đồng bộ giữa các tab cùng trình duyệt. Bản thật: đồng bộ qua server, mã giao dịch là khóa duy nhất trong database, đối soát với hệ thống POS.
- Đăng nhập Quầy là cổng phân vai mô phỏng (kiểm tra ngay trên trình duyệt, `src/lib/auth.ts`), không phải bảo mật thật. Bản thật: xác thực phía server.
- Chạy khi mất mạng (PWA): chưa hoàn thành.
- Quét bằng camera mới kiểm thử qua nhánh báo lỗi quyền; quét ảnh QR đã kiểm thử.

## Quá trình thực hiện

| Phase | Nội dung | Commit |
|---|---|---|
| 0 | Khung Vite + React + TS + Tailwind v4, HashRouter, tab bar, deploy Pages | `eb5d71d` |
| 1 | Dữ liệu BTC, quy tắc, chế độ Quầy | `4adac7a` |
| 2 | Phía Thành viên + QR | `5717376` |
| 3.1 | Đổi tên app Tem → XSon | `337a71c` |
| 3.2 | Màn mở đầu mới | `47ada7a` |
| 3.3 | Quét QR (camera + tải ảnh) ở Quầy | `8f2bacd` |
| 3.4 | Tab Voucher ở Quầy + QR voucher trong ví | `f07fda9` |
| 3.5 | Tab Thống kê ở Quầy | `97de267` |
| 3.6 | Hiệu ứng cộng điểm + màn chúc mừng lên hạng | `a95e123` |
| 3.7 | Đồng bộ 2 đầu thời gian thực giữa các tab | `b7e8b53` |
| 3.8 | Tự kiểm tra 5 ca BTC trong app | `ab1e2ee` |
| 3.9 | Quầy thông minh (SĐT, 4 số cuối, gợi ý mua thêm) | `4a9ba8e` |
| 3.10 | Đăng nhập Quầy bản nhẹ | `277a1f1` |
