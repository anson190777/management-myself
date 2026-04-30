# Project Docs - Room Management

## 1) Mục tiêu

Tài liệu này là "nguồn sự thật" cho giai đoạn backend hiện tại:

- Quản lý 2 phòng trọ (có thể mở rộng thêm phòng).
- Lưu thông tin cố định của phòng.
- Lưu hóa đơn theo tháng (snapshot) để truy vết lịch sử.
- Cung cấp CRUD API bằng NestJS + MongoDB.

Ngoài phạm vi hiện tại:

- Chưa làm module lương/dòng tiền cá nhân.
- Chưa có auth/role.

## 2) Cấu trúc project

- `frontend`: React (Vite)
- `backend`: NestJS
- `docker-compose.yml`: MongoDB + Backend + Frontend cho dev

## 3) Công nghệ backend

- NestJS 10
- MongoDB + Mongoose
- Validation: `class-validator`, `class-transformer`
- API docs: Swagger (`/api-docs`)

## 4) Dữ liệu và collection

### 4.1 `rooms` (dữ liệu cố định của phòng)

Field chính:

- `name`: tên phòng
- `nameUser`: tên người thuê
- `monthlyRent`: tiền thuê hàng tháng
- `electricityUnitPrice`: đơn giá điện
- `waterUnitPrice`: đơn giá nước
- `wifiFee`: phí wifi
- `trashFee`: phí rác
- `isActive`: phòng đang hoạt động hay không
- `createdAt`, `updatedAt`

### 4.2 `room_bills` (hóa đơn theo tháng)

Field chính:

- `roomId`: tham chiếu `rooms._id`
- `billingMonth`: dạng `YYYY-MM`
- `electricityOldReading`, `electricityNewReading`, `electricityUsed`
- `waterOldReading`, `waterNewReading`, `waterUsed`
- `electricityAmount`, `waterAmount`
- `wifiFee`, `trashFee`, `monthlyRent` (snapshot theo tháng)
- `otherFees`: danh sách chi phí phát sinh (`[{ name, amount }]`)
- `note`
- `totalAmount`
- `createdAt`, `updatedAt`

Ràng buộc quan trọng:

- Unique index: `roomId + billingMonth` (mỗi phòng chỉ 1 bill/tháng).

### 4.3 `account_banks` (tài khoản ngân hàng nhận tiền)

Field chính:

- `customerCode`: mã khách hàng
- `customerName`: tên khách hàng
- `bank`: tên ngân hàng
- `accountNumber`: số tài khoản
- `isDefault`: tài khoản mặc định
- `createdAt`, `updatedAt`

Ràng buộc quan trọng:

- Chỉ được có tối đa 1 record `isDefault = true` (unique partial index).

## 5) Công thức tính bill (server-side)

Trong `room-bills.service`:

- `electricityUsed = electricityNewReading - electricityOldReading`
- `waterUsed = waterNewReading - waterOldReading`
- `electricityAmount = electricityUsed * room.electricityUnitPrice`
- `waterAmount = waterUsed * room.waterUnitPrice`
- `wifiFee/trashFee/monthlyRent`:
  - Nếu client truyền thì dùng giá trị truyền vào.
  - Nếu không truyền thì lấy từ `room` (snapshot mặc định).
- `totalAmount = electricityAmount + waterAmount + wifiFee + trashFee + monthlyRent + sum(otherFees.amount)`

## 6) API hiện có

### 6.1 Rooms

- `POST /rooms`
- `GET /rooms`
- `GET /rooms/:id`
- `PATCH /rooms/:id`
- `DELETE /rooms/:id`

### 6.2 Room Bills

- `POST /room-bills`
- `GET /room-bills?roomId=&billingMonth=&beforeMonth=&fields=&page=&limit=`
- `GET /room-bills/:id`
- `PATCH /room-bills/:id`
- `DELETE /room-bills/:id`

Ghi chú:
- `beforeMonth=YYYY-MM`: lấy các bill trước tháng này (dùng cho logic lấy bill gần nhất tháng trước).
- `fields=a,b,c`: chọn field cần trả về để tối ưu payload.

### 6.3 Account Banks

- `POST /account-banks` (create)
- `GET /account-banks` (list)
- `GET /account-banks/default` (get default)
- `PATCH /account-banks/:id/default` (set default mới, tự hủy default cũ)
- `DELETE /account-banks/:id` (delete)

### 6.4 Pagination chuẩn cho list API

- `GET /rooms?page=1&limit=20`
- `GET /room-bills?page=1&limit=20`
- Response list trả về dạng:
  - `items`
  - `pagination` (`page`, `limit`, `totalItems`, `totalPages`)

## 7) Swagger

- URL: `http://localhost:3000/api-docs`
- Đã có:
  - `ApiTags` cho `rooms`, `room-bills`, `account-banks`
  - mô tả endpoint (`ApiOperation`, `ApiParam`, `ApiQuery`, `ApiBody`)
  - request schema DTO
  - response schema DTO (`RoomResponseDto`, `RoomBillResponseDto`)

## 8) Các file backend quan trọng

- `backend/src/app.module.ts`: ConfigModule + MongooseModule
- `backend/src/main.ts`: ValidationPipe + Swagger setup
- `backend/src/rooms/*`: module/controller/service/schema/dto
- `backend/src/room-bills/*`: module/controller/service/schema/dto
- `backend/src/account-bank/*`: module/controller/service/schema/dto
- `backend/.env.example`: biến môi trường mẫu

## 9) Cách chạy local

### Cách 1: Chạy nhanh bằng Docker Compose (khuyến nghị)

1. Chạy toàn bộ service:
  - `docker compose up -d --build`
2. Xem logs backend/frontend:
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`
3. Mở ứng dụng:
  - Frontend: `http://localhost:5173`
4. Mở docs backend:
  - `http://localhost:3000/api-docs`

### Cách 2: Chạy backend local, chỉ dùng MongoDB từ Docker

1. Chạy MongoDB:
  - `docker compose up -d mongodb`
2. Chạy backend:
  - `cd backend`
  - `npm install`
  - `npm run start:dev`

Nếu máy chưa có Docker, backend sẽ không kết nối được MongoDB (`ECONNREFUSED 27017`).

## 10) Quy ước dev để làm việc tiếp

- Không đổi schema mà không cập nhật tài liệu này.
- Khi thêm field vào `room_bills`, bắt buộc cập nhật:
  - schema
  - create/update DTO
  - response DTO
  - Swagger annotations
- Nếu đổi công thức tính tiền, ghi rõ trong mục "Công thức tính bill".
- Ưu tiên giữ tính "snapshot theo tháng" để bảo toàn lịch sử bill.

## 11) Gợi ý bước tiếp theo

- Thêm endpoint thống kê tổng tiền theo tháng/quý.
- Thêm seed script cho 2 phòng mẫu + bill mẫu.
- Thêm auth (JWT) nếu cần đa user/phân quyền.
- Frontend trang quản lý phòng + lập bill tháng từ form.

