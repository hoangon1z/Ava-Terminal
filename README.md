# Ava Terminal

> Tên tạm của project: một trading terminal trên Avalanche giúp người dùng khám phá token, hiểu giao dịch và thực hiện swap từ ví của mình.

## 1. Project này là gì?

Ava Terminal là ứng dụng web dành cho người giao dịch token trong hệ sinh thái Avalanche. Sản phẩm tập hợp dữ liệu thị trường, biểu đồ, hoạt động ví, danh mục tài sản và thao tác mua/bán vào một giao diện.

Trải nghiệm lấy cảm hứng từ trading terminal như MEVX, nhưng thiết kế, thương hiệu và cách phân tích dữ liệu sẽ được xây dựng riêng. MEVX đã hỗ trợ Avalanche, vì vậy lợi thế của project phải đến từ trải nghiệm và tính năng khác biệt, không chỉ từ việc hỗ trợ một network.

Project độc lập, đặt tại `E:\AvaTerminal`, không thuộc repository Alolai.

## 2. Ý nghĩa và vấn đề cần giải quyết

Người giao dịch thường phải chuyển giữa trang xem chart, explorer, DEX và công cụ theo dõi ví. Dữ liệu rời rạc khiến họ khó biết giao dịch sắp ký sẽ làm gì, chi phí thực tế ra sao và hoạt động của token có đáng tin cậy hay không.

Ava Terminal hướng tới ba giá trị:

- **Tập trung thông tin:** xem thị trường, phân tích và thực hiện giao dịch trong cùng một luồng.
- **Hiểu trước khi ký:** trình bày số tiền dự kiến nhận, phí, tác động giá và quyền truy cập token bằng ngôn ngữ dễ hiểu.
- **Có bằng chứng:** các nhận xét về dòng tiền hoặc rủi ro phải có dữ liệu, nguồn và thời điểm cập nhật; không đưa ra lời hứa lợi nhuận.

Đối tượng ban đầu là người dùng Avalanche cần một công cụ giao dịch dễ hiểu, đặc biệt người chưa quen đọc calldata, allowance và dữ liệu pool.

## 3. Sản phẩm làm gì?

### Discover — khám phá token

- Tìm token bằng tên, ký hiệu hoặc địa chỉ contract.
- Xem giá, thanh khoản, khối lượng giao dịch và biến động.
- Lọc và sắp xếp token theo các chỉ số có dữ liệu hỗ trợ.
- Phân biệt token trùng tên bằng contract và network.

### Trade — giao dịch

- Xem chart, giao dịch gần nhất và thông tin pool.
- Chọn token, nhập số lượng và lấy báo giá từ DEX/router được tích hợp.
- Hiển thị slippage, price impact, phí và số tiền tối thiểu nhận.
- Người dùng kiểm tra và tự ký bằng ví.
- Theo dõi trạng thái chờ ký, đã gửi, xác nhận hoặc thất bại.

### Trade Preview — điểm khác biệt của bản đầu

- Giải thích token nào sẽ bị trừ và token nào dự kiến nhận.
- Hiển thị rõ giao dịch approve và giao dịch swap là hai thao tác khác nhau.
- Cho biết contract nào được cấp quyền và hạn mức cấp quyền.
- Khi có khả năng mô phỏng, hiển thị kết quả mô phỏng và thay đổi số dư dự kiến.
- Nếu dữ liệu hoặc mô phỏng thiếu, nói rõ giới hạn thay vì đánh dấu giao dịch an toàn.

Phân tích định lượng và kết quả mô phỏng là nguồn sự thật. AI có thể diễn giải chúng bằng ngôn ngữ tự nhiên trong giai đoạn sau, nhưng không thay thế kiểm tra kỹ thuật.

### Portfolio — tài sản

- Xem số dư và lịch sử giao dịch của ví đã kết nối.
- Cập nhật sau khi giao dịch được xác nhận.
- Chỉ hiển thị PnL khi có đủ dữ liệu giá vốn; số dư không đồng nghĩa với lợi nhuận.

### Watchlist — theo dõi

- Lưu token và địa chỉ ví quan tâm.
- Mở nhanh dữ liệu của đối tượng đang theo dõi.
- Bản đầu có thể lưu cục bộ trên trình duyệt; cảnh báo thời gian thực thuộc giai đoạn sau.

## 4. Avalanche đóng vai trò gì?

Avalanche là nền tảng blockchain mà giao dịch của ứng dụng được thực hiện trên đó. C-Chain hỗ trợ smart contract EVM; Fuji là môi trường thử nghiệm.

- Frontend, chart và phần lớn xử lý dữ liệu chạy ngoài blockchain.
- Ví của người dùng ký giao dịch.
- DEX/router thực hiện swap và sử dụng thanh khoản trên blockchain.
- RPC, explorer và bộ lập chỉ mục cung cấp trạng thái giao dịch, số dư và dữ liệu thị trường.

Không cần tạo blockchain L1 riêng cho MVP. Không cần phát hành token riêng. Không cần tự xây DEX hoặc tạo thanh khoản mainnet từ đầu.

Trước khi chọn nhà cung cấp phải xác minh: hỗ trợ Avalanche, API/SDK, điều khoản sử dụng, giới hạn truy cập và khả năng hoạt động trên Fuji. Một tích hợp có thanh khoản mainnet không có nghĩa là có sẵn trên testnet.

## 5. Phạm vi MVP cho cuộc thi

MVP ưu tiên một luồng hoạt động hoàn chỉnh:

**Khám phá token → mở trang Trade → nhập lệnh → xem Trade Preview → tự ký → swap → xác nhận → cập nhật Portfolio.**

Phạm vi dự kiến:

1. Web desktop trước, có giao diện responsive.
2. Một network thử nghiệm: Avalanche Fuji.
3. Một tích hợp DEX/router hoặc pool demo được triển khai trên Fuji sau khi xác minh tính khả thi.
4. Một số token và cặp giao dịch thử nghiệm có thanh khoản được kiểm soát.
5. Kết nối ví, lấy quote, approve khi cần và swap thật bằng token thử nghiệm.
6. Discover, Trade, Trade Preview, Portfolio và Watchlist cơ bản.
7. Hiển thị địa chỉ contract, network, nguồn dữ liệu và đường dẫn giao dịch để kiểm chứng.

Dữ liệu mô phỏng phục vụ thiết kế phải được ghi rõ là demo. Không dùng chart giả hoặc thông báo thành công giả để trình bày như giao dịch blockchain thật. Nếu kết hợp dữ liệu mainnet và thao tác testnet, giao diện phải tách rõ hai môi trường.

### Chưa nằm trong MVP

- Copy trading, sniper và bot Telegram.
- Giao dịch đa chain hoặc bridging.
- Margin, đòn bẩy và phái sinh.
- Tự giữ private key hoặc nhận tiền gửi tập trung.
- Cam kết phát hiện mọi scam hoặc bảo vệ tuyệt đối trước MEV.
- Một nền tảng tự tạo token/launchpad đầy đủ.

## 6. Hướng mở rộng tạo quy mô

Sau khi giao dịch cơ bản ổn định, sản phẩm có thể phát triển theo các lớp:

| Giai đoạn | Kết quả |
|---|---|
| 1. Terminal MVP | Khám phá, preview và swap trên Fuji |
| 2. Dữ liệu thị trường | Lập chỉ mục pool, chart và hoạt động ví đáng tin cậy |
| 3. Phân tích | Holder concentration, nhóm ví có liên hệ và dòng tiền vào/ra pool |
| 4. Công cụ sử dụng hằng ngày | Cảnh báo, quản lý nhiều watchlist và thống kê danh mục |
| 5. Mainnet | Giao dịch tài sản thật sau khi kiểm tra tích hợp, bảo mật và vận hành |

Điểm khác biệt dài hạn là giúp người dùng hiểu **ai đang giao dịch, dòng tiền di chuyển thế nào và giao dịch sắp ký có hậu quả gì**. Quan hệ giữa các ví chỉ là suy luận có mức độ chắc chắn, không tự động chứng minh chúng thuộc cùng một người.

## 7. Kiến trúc dự kiến

| Thành phần | Nhiệm vụ |
|---|---|
| Web frontend | Bảng thị trường, chart, giao diện giao dịch và portfolio |
| Wallet adapter | Kết nối ví và yêu cầu người dùng ký |
| Market data service | Chuẩn hóa giá, pool, volume, lịch sử và thời điểm cập nhật |
| Quote/execution adapter | Lấy quote, xây giao dịch và tích hợp DEX/router |
| Preview/simulation service | Giải mã giao dịch và mô phỏng khi được hỗ trợ |
| Indexer/cache | Giảm số lần gọi RPC và cập nhật dữ liệu ổn định |

Stack đề xuất, chưa chốt: TypeScript, React/Next.js, thư viện giao tiếp EVM và chart phù hợp. Solidity chỉ cần khi có contract riêng hoặc pool thử nghiệm. Backend không giữ private key của người dùng.

## 8. Kịch bản demo

1. Mở Discover và chọn một token thử nghiệm.
2. Xem chart và thanh khoản của pool.
3. Kết nối ví Fuji và nhập số lượng mua.
4. Trade Preview giải thích số dư, phí, slippage và allowance.
5. Người dùng ký approve nếu cần, sau đó ký swap.
6. Giao diện hiển thị trạng thái xác nhận và link explorer.
7. Portfolio cập nhật số dư mới.
8. Thử một lệnh vượt số dư hoặc có price impact cao để chứng minh hệ thống xử lý giới hạn và lỗi rõ ràng.

## 9. Tiêu chí hoàn thành bản thi

- Luồng giao dịch đầu cuối chạy được trên Fuji, có transaction hash kiểm chứng.
- Quote và swap dùng cùng network, đúng token, decimals và địa chỉ contract.
- Không hiển thị giao dịch thành công trước khi có xác nhận phù hợp.
- Xử lý được người dùng từ chối ký, sai network, thiếu gas, thiếu số dư và quote hết hạn.
- Preview phân biệt dữ liệu tính toán, kết quả mô phỏng và giới hạn chưa biết.
- README hướng dẫn chạy, cấu hình môi trường, contract và giới hạn của bản demo.
- Có GitHub repository, pitch slides và video demo 2–3 phút truy cập được.

Theo FAQ đã đọc trên website ngày 13/10/2026: đội tối đa 3 người; nộp trong hồ sơ tại team1vn.xyz; hạn nộp 05:59 ngày 25/11/2026, giờ Việt Nam. Cần kiểm tra lại thông báo của ban tổ chức trước khi nộp.

## 10. Mô hình kinh doanh có thể khám phá

- Thu phí nền tảng minh bạch trên giao dịch nếu tích hợp cho phép.
- Gói trả phí cho cảnh báo, phân tích nâng cao và công cụ theo dõi ví.
- API dữ liệu hoặc dashboard cho dự án trong hệ sinh thái.

Đây là giả thuyết kinh doanh, chưa có dữ liệu xác nhận nhu cầu hoặc doanh thu. Bản đầu tập trung kiểm chứng trải nghiệm và mức độ hữu ích với người dùng.

## 11. Trạng thái hiện tại — dữ liệu thật

Snapshot GitHub: Trade đã dùng TradingView Lightweight Charts với pane volume riêng, SMA/EMA 20, crosshair, UTC/UTC+7, mở rộng chart và tải thêm lịch sử khi kéo trái. Pool LFJ V2.1 BTC.b/USDC có backend live riêng; các pool khác vẫn cập nhật định kỳ. Danh sách token có logo từ metadata. Chưa tích hợp swap, drawing tools hoặc indexer danh mục đầy đủ.

Để chạy live feed, mở thêm terminal và chạy `npm run live` (Node.js 22.22+); sau đó chạy `npm run dev`. SQLite được lưu trong thư mục data/ và không đưa lên Git. Xem [hướng dẫn backend](docs/live-backend.md).

Đã bỏ dữ liệu mẫu và paper trading. Bản hiện tại dùng React/Vite, phục vụ dữ liệu thị trường qua API proxy local.

- **Mainnet:** danh sách pool, tìm kiếm, giá base token USD, volume/thanh khoản pool, chart OHLCV và giao dịch gần nhất từ GeckoTerminal; có link contract/transaction để kiểm chứng.
- **Fuji:** số dư AVAX thật qua RPC, Core Extension và faucet Team1VN. Chưa cấu hình token/pool Fuji, nên không hiển thị thị trường mainnet dưới nhãn testnet.
- **Portfolio:** chỉ số dư AVAX trên network được chọn. Chưa có indexer token holdings, giá vốn hoặc PnL.
- **Watchlist:** lưu địa chỉ pool trong trình duyệt; hiển thị các pool đang có trong kết quả hiện tại. Tìm kiếm pool đã lưu nếu nó không thuộc danh sách đang tải.
- **Trade Preview:** chưa tích hợp router, quote, gas estimate, allowance hoặc simulation. Nút swap bị vô hiệu hóa; giá thị trường không phải báo giá thực thi.

Dữ liệu thị trường được tải lại mỗi 60 giây, không phải websocket realtime. Proxy cache phản hồi thành công trong 30 giây. Thiếu dữ liệu hiện “—”; lỗi nguồn được thông báo, không thay bằng mock hay cache cũ. Market cap không được thay bằng FDV.

### Core và Fuji

Cài [Core Extension](https://join.core.app/), mở app trên Chrome rồi chọn **Connect Core**. Chọn Fuji và **Switch to Fuji** nếu cần; người dùng tự xác nhận trong ví.

- Fuji chain ID: 43113; RPC: https://api.avax-test.network/ext/bc/C/rpc.
- Mainnet chain ID: 43114; RPC: https://api.avax.network/ext/bc/C/rpc.
- [Faucet Team1VN](https://team1vn.xyz/faucet.html).

Core được nhận diện qua EIP-6963 (app.core.extension) hoặc window.avalanche, không dùng window.ethereum để tránh mở nhầm MetaMask/Phantom. Website core.app không thay thế extension. WalletConnect/Core Mobile chưa tích hợp. App không giữ private key, không tự ký và chưa gửi giao dịch.

### Chạy local

```powershell
cd E:\AvaTerminal
npm install
npm run dev
```

```powershell
npm test
npm run build
npm run preview
```

API /api/market được cung cấp bởi middleware trong vite.config.js cho dev và preview; chỉ cho phép endpoint GeckoTerminal đã định sẵn, không phải proxy URL tùy ý. Khi triển khai production cần chuyển middleware thành backend/serverless route tương đương; chỉ upload thư mục dist lên static hosting sẽ không có API.

### Bước tiếp theo

1. Triển khai token và pool có thanh khoản thật trên Fuji.
2. Tích hợp quote, approve, swap và receipt trên đúng network.
3. Thêm kiểm tra allowance, slippage và simulation trước khi ký.
4. Bổ sung indexer holdings/lịch sử ví trước khi tính PnL.

Các mục 3–10 mô tả định hướng sản phẩm và tiêu chí mục tiêu, không phải toàn bộ tính năng đã hoàn thành.

## Nguồn tham khảo

- [GeckoTerminal API](https://apiguide.geckoterminal.com/)
- [Detect Core](https://docs.core.app/docs/connect-your-dapp/detect-core/)
- [Avalanche Explorer](https://build.avax.network/explorer)
- [Team1 Vietnam UniHack](https://team1vn.xyz/)
