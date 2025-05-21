# TÀI LIỆU PHÂN TÍCH VÀ THIẾT KẾ USECASE ĐẶT VÉ XEM PHIM

## 1. Problem Statement (Mô tả vấn đề/usecase)

Hệ thống đặt vé xem phim cho phép người dùng duyệt danh sách phim đang chiếu, xem thông tin chi tiết của từng bộ phim, chọn suất chiếu và ghế ngồi mong muốn. Hệ thống sẽ xử lý yêu cầu đặt vé, kiểm tra tính khả dụng của ghế và thực hiện đặt vé. Nếu vé được đặt thành công, hệ thống sẽ lưu thông tin đặt vé, cập nhật trạng thái ghế và gửi email xác nhận kèm thông tin vé cho người dùng. Nếu ghế không còn hoặc có lỗi xảy ra, quy trình sẽ thông báo cho người dùng. Hệ thống cũng hỗ trợ tính năng đặt giữ chỗ tạm thời cho các ghế đang được chọn.

---

## 2. Service-Oriented Analysis (Phân tích hướng dịch vụ)

### 2.1. Tiến trình nghiệp vụ (Ticket Booking Business Process)

1.  **Bắt đầu duyệt phim**: Người dùng truy cập hệ thống và xem danh sách các bộ phim hiện có.
2.  **Xem chi tiết phim**: Người dùng chọn một bộ phim để xem thông tin chi tiết (mô tả, diễn viên, trailer, suất chiếu). Thông tin này có thể được lấy từ các API bên ngoài (OMDb, TMDb).
3.  **Chọn suất chiếu và ghế**: Người dùng chọn một suất chiếu cụ thể và sau đó chọn các ghế mong muốn từ sơ đồ ghế của phòng chiếu.
4.  **Đặt giữ chỗ tạm thời**: Khi người dùng chọn ghế, hệ thống sẽ tạm thời giữ những ghế đó trong một khoảng thời gian ngắn để tránh người khác chọn trùng (sử dụng Socket.io).
5.  **Xác nhận đặt vé**: Người dùng xác nhận thông tin vé và tiến hành đặt vé.
6.  **Kiểm tra tính hợp lệ của việc đặt vé**: Hệ thống kiểm tra xem các ghế đã chọn có còn trống và hợp lệ không.
7.  **Nếu không hợp lệ thì dừng quy trình**: Nếu ghế đã được người khác đặt hoặc có lỗi, quy trình dừng lại và thông báo cho người dùng.
8.  **Lưu thông tin đặt vé vào cơ sở dữ liệu**: Nếu hợp lệ, hệ thống lưu thông tin đặt vé (phim, suất chiếu, ghế, thông tin người dùng) vào cơ sở dữ liệu.
9.  **Cập nhật trạng thái ghế**: Hệ thống cập nhật trạng thái của các ghế đã đặt thành "đã bán".
10. **Gửi email xác nhận đặt vé**: Hệ thống gửi email thông báo đặt vé thành công kèm theo chi tiết vé (mã vé, thông tin phim, ghế) cho người dùng.

### 2.2. Phân rã Chức năng và Xác định Context Nghiệp vụ:

-   **Quản lý Phim (Movie Management)**: Hiển thị danh sách phim, chi tiết phim, suất chiếu. Lấy dữ liệu từ API bên ngoài.
-   **Quản lý Đặt Vé (Booking Management)**: Xử lý toàn bộ quy trình đặt vé, từ chọn ghế đến xác nhận.
-   **Quản lý Ghế & Đặt Chỗ (Seat & Reservation Management)**: Hiển thị sơ đồ ghế, quản lý trạng thái ghế, xử lý đặt giữ chỗ tạm thời.
-   **Quản lý Thông báo (Notification Management)**: Gửi email xác nhận đặt vé.
-   **API Gateway**: Điều phối các yêu cầu từ frontend đến các microservice phù hợp, quản lý đặt giữ chỗ tạm thời qua Socket.io.

### 2.3. Service Candidates, chức năng và resource

Dựa trên cấu trúc dự án của bạn:

1.  **API Service (API Gateway)**
    *   *Layer*: Gateway, Coordination Service
    *   Chức năng/Trách nhiệm trong usecase:
        *   Điều phối các yêu cầu HTTP từ frontend đến các service backend (`movie-service`, `notifications-service`).
        *   Quản lý các kết nối WebSocket (Socket.io) cho việc đặt giữ chỗ tạm thời.
        *   Có thể tổng hợp phản hồi từ nhiều service nếu cần.
    *   Resource (examples): `/api/movies`, `/api/movies/:id`, `/api/orders`, WebSocket endpoint cho `/reservations`

2.  **Movie Service**
    *   *Layer*: Entity Service, Business Logic Service
    *   Chức năng/Trách nhiệm trong usecase:
        *   Cung cấp thông tin phim (có thể lấy từ API bên ngoài và cache lại).
        *   Quản lý thông tin suất chiếu, sơ đồ ghế.
        *   Xử lý logic đặt vé: kiểm tra tính khả dụng của ghế, tạo và lưu trữ đơn đặt vé.
        *   Cập nhật trạng thái ghế sau khi đặt vé.
    *   Resource (examples): `/movies`, `/movies/:id/showtimes`, `/orders`, `/seats/status`

3.  **Notifications Service**
    *   *Layer*: Utility Service
    *   Chức năng/Trách nhiệm trong usecase:
        *   Gửi email xác nhận đặt vé thành công cho người dùng.
        *   Có thể xử lý các loại thông báo khác trong tương lai.
    *   Resource: (Thường là internal, được kích hoạt qua message queue hoặc RPC từ `movie-service` hoặc `api-service`)

4.  **Frontend Service**
    *   *Layer*: Presentation Service
    *   Chức năng/Trách nhiệm trong usecase:
        *   Cung cấp giao diện người dùng để duyệt phim, chọn suất chiếu, chọn ghế, và thực hiện đặt vé.
        *   Tương tác với `API Service` để gửi yêu cầu và nhận dữ liệu.
        *   Xử lý hiển thị đặt giữ chỗ tạm thời qua Socket.io.
    *   Resource: (Serves static web assets)

---

## 3. 🔄 Service-Oriented Design

### 3.1. Service Capabilities.

#### 3.1.1. API Service (Gateway):

| Capability                      | Input                                                                 | Output                                                                    | Mô tả                                                                                                                               |
| ------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `routeGetMovies`                | HTTP GET `/api/movies`                                                | HTTP Response (danh sách phim từ Movie Service)                           | Chuyển tiếp yêu cầu lấy danh sách phim đến Movie Service.                                                                            |
| `routeGetMovieDetails`          | HTTP GET `/api/movies/:id`                                            | HTTP Response (chi tiết phim từ Movie Service)                            | Chuyển tiếp yêu cầu lấy chi tiết phim đến Movie Service.                                                                             |
| `routeGetShowtimesAndSeats`     | HTTP GET `/api/movies/:movieId/showtimes/:showtimeId/seats`             | HTTP Response (thông tin ghế từ Movie Service)                            | Chuyển tiếp yêu cầu lấy thông tin ghế và suất chiếu đến Movie Service.                                                                |
| `routeCreateBooking`            | HTTP POST `/api/orders` (Body: `BookingRequest`)                      | HTTP Response (kết quả đặt vé từ Movie Service)                           | Chuyển tiếp yêu cầu tạo đặt vé đến Movie Service.                                                                                    |
| `manageSeatReservation`         | WebSocket connection, messages (e.g., `select_seat`, `release_seat`)  | WebSocket messages (e.g., `seat_reserved`, `seat_released`, `error`)      | Quản lý việc đặt giữ ghế tạm thời qua Socket.io. Giao tiếp với Movie Service để kiểm tra và cập nhật trạng thái ghế tạm thời.          |
| `routeGetUserOrders`            | HTTP GET `/api/orders/user/:userId`                                   | HTTP Response (danh sách đơn đặt vé của người dùng từ Movie Service)      | Chuyển tiếp yêu cầu lấy lịch sử đặt vé của người dùng đến Movie Service.                                                              |

API Service đóng vai trò là cổng vào chính cho tất cả các yêu cầu từ frontend. Nó điều hướng các yêu cầu đến các microservice phù hợp và quản lý các tương tác thời gian thực như đặt giữ ghế tạm thời.

#### 3.1.2. Movie Service:

| Capability                  | Input                                                                    | Output                                                                                                | Mô tả                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getMoviesList`             | (Không có)                                                               | `List<MovieSummary>`: Danh sách tóm tắt các phim                                                      | Trả về danh sách các phim đang chiếu. Có thể lấy từ cache hoặc API bên ngoài.                                                                                       |
| `getMovieDetails`           | `movieId`: ID của phim                                                   | `Movie`: Thông tin chi tiết phim (bao gồm suất chiếu)                                                  | Trả về thông tin chi tiết của một bộ phim, bao gồm các suất chiếu có sẵn.                                                                                           |
| `getShowtimeSeatLayout`     | `movieId`, `showtimeId`                                                  | `SeatLayout`: Sơ đồ ghế và trạng thái (trống, đã đặt, đang giữ tạm thời) của một suất chiếu cụ thể. | Lấy sơ đồ ghế và trạng thái hiện tại của các ghế cho một suất chiếu.                                                                                                 |
| `createBooking`             | `CreateBookingRequest`: <br>- `userId` (nếu có)<br>- `movieId`<br>- `showtimeId`<br>- `selectedSeats` (danh sách ID ghế) | `BookingConfirmation`:<br>- `bookingId`<br>- `status` ("CONFIRMED" hoặc "FAILED")<br>- `message`<br>- `ticketDetails` (nếu thành công) | Xử lý yêu cầu đặt vé: kiểm tra ghế, lưu đơn đặt vé, cập nhật trạng thái ghế. Nếu thành công, có thể kích hoạt sự kiện để Notifications Service gửi email. |
| `updateTemporarySeatStatus` | `UpdateSeatStatusRequest`: <br>- `showtimeId`<br>- `seatId`<br>- `status` ("RESERVED_TEMP", "AVAILABLE") | `boolean`: thành công/thất bại                                                                        | (Internal hoặc được gọi bởi API Service) Cập nhật trạng thái tạm thời của một ghế (đang được chọn/đã nhả).                                                              |
| `getUserBookings`           | `userId`                                                                 | `List<Booking>`: Danh sách các vé đã đặt của người dùng                                               | Lấy lịch sử đặt vé của một người dùng.                                                                                                                             |

Movie Service là trái tim của hệ thống, quản lý tất cả logic nghiệp vụ liên quan đến phim, suất chiếu, ghế và quá trình đặt vé.

#### 3.1.3. Notifications Service:

| Capability                      | Input                                                                                                | Output | Mô tả                                                                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sendBookingConfirmationEmail`  | `BookingConfirmationEvent`: <br>- `emailAddress`<br>- `userName`<br>- `bookingId`<br>- `movieTitle`<br>- `showtime`<br>- `seatNumbers`<br>- `ticketDetails` (e.g., QR code) | Void   | Gửi email xác nhận đặt vé thành công đến người dùng. Nội dung email bao gồm chi tiết vé đã đặt. Sử dụng dịch vụ SMTP (ví dụ: Ethereal cho môi trường dev). |

Notifications Service chịu trách nhiệm gửi các thông báo đến người dùng, chủ yếu là email xác nhận sau khi đặt vé thành công. Service này thường lắng nghe các sự kiện (ví dụ: `BookingConfirmedEvent`) từ Movie Service.

### 3.2. Interaction (Luồng Đặt Vé Tiêu Biểu)

1.  **Frontend**: Người dùng duyệt phim và chọn một bộ phim. Gửi yêu cầu `GET /api/movies/:id` đến **API Service**.
2.  **API Service**: Chuyển tiếp yêu cầu đến **Movie Service**.
3.  **Movie Service**: Lấy thông tin chi tiết phim (bao gồm các suất chiếu) và trả về cho **API Service**.
4.  **API Service**: Trả về thông tin chi tiết phim cho **Frontend**.
5.  **Frontend**: Người dùng chọn suất chiếu và ghế.
    *   Khi chọn ghế, **Frontend** gửi thông điệp qua WebSocket (ví dụ: `select_seat` với `showtimeId`, `seatId`) đến **API Service**.
    *   **API Service** (Socket.io handler): Gọi đến **Movie Service** (ví dụ: `updateTemporarySeatStatus`) để tạm giữ ghế.
    *   **Movie Service**: Kiểm tra và cập nhật trạng thái ghế thành "đang giữ tạm thời", trả kết quả về **API Service**.
    *   **API Service**: Gửi thông điệp xác nhận/lỗi về **Frontend** qua WebSocket. Sơ đồ ghế trên frontend được cập nhật.
6.  **Frontend**: Người dùng xác nhận đặt vé. Gửi yêu cầu `POST /api/orders` với `BookingRequest` (thông tin người dùng, phim, suất chiếu, ghế đã chọn) đến **API Service**.
7.  **API Service**: Chuyển tiếp yêu cầu `createBooking` đến **Movie Service**.
8.  **Movie Service**:
    *   Xác thực lại tính khả dụng của các ghế đã chọn (tránh trường hợp ghế vừa bị người khác đặt).
    *   Nếu hợp lệ:
        *   Tạo bản ghi đặt vé trong cơ sở dữ liệu.
        *   Cập nhật trạng thái các ghế thành "đã bán".
        *   Trả về `BookingConfirmation` (thành công) cho **API Service**.
        *   (Option 1) Phát một sự kiện `BookingConfirmedEvent` (chứa thông tin đặt vé và email người dùng) lên một message broker (ví dụ: RabbitMQ/Kafka nếu có AMQP_URL).
        *   (Option 2) Gọi trực tiếp (RPC) hoặc gửi yêu cầu HTTP đến **Notifications Service** để yêu cầu gửi email.
    *   Nếu không hợp lệ: Trả về lỗi cho **API Service**.
9.  **API Service**:
    *   Nếu đặt vé thành công: Trả về phản hồi thành công cho **Frontend**.
    *   Nếu thất bại: Trả về phản hồi lỗi cho **Frontend**.
10. **Notifications Service** (nếu sử dụng Option 1 ở bước 8):
    *   Lắng nghe sự kiện `BookingConfirmedEvent` từ message broker.
    *   Khi nhận được sự kiện, tiến hành gửi email xác nhận đặt vé cho người dùng.
11. **Frontend**: Hiển thị thông báo đặt vé thành công (kèm chi tiết vé) hoặc thông báo lỗi cho người dùng.

### 3.3. Data Ownership

| Service                 | Data Owned                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| **Movie Service**       | - Thông tin phim (có thể cache từ API ngoài, hoặc dữ liệu riêng của rạp).<br>- Thông tin suất chiếu (ngày, giờ, phòng chiếu).<br>- Sơ đồ và trạng thái ghế của từng phòng chiếu.<br>- Đơn đặt vé (thông tin người dùng, phim, suất chiếu, ghế, giá vé, trạng thái). |
| **API Service (Gateway)** | - Trạng thái đặt giữ ghế tạm thời (có thể lưu trong memory của API Gateway như README đề cập, hoặc Redis nếu muốn mở rộng). |
| **Notifications Service** | - Không sở hữu dữ liệu lâu dài. Chỉ sử dụng tạm thời thông tin đặt vé và người dùng để gửi thông báo.        |
| **Frontend Service**    | - Không sở hữu dữ liệu backend. Chỉ cache dữ liệu phía client để cải thiện trải nghiệm người dùng.         |

---

## 4. API Specs (Sơ lược)

*(Phần này cung cấp một cái nhìn tổng quan. Chi tiết API nên được định nghĩa trong các file OpenAPI/Swagger riêng nếu có.)*

### 4.1. API Service (Gateway) - Exposed to Frontend

#### RESTful Endpoints

| Method | Endpoint                                          | Description                                      | Request Body (Example)                                                                 | Response (Example)                                                                                                |
| ------ | ------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/movies`                                     | Lấy danh sách phim                               | N/A                                                                                    | `List<MovieSummary>`                                                                                              |
| GET    | `/api/movies/:movieId`                            | Lấy chi tiết phim và suất chiếu                   | N/A                                                                                    | `MovieDetail` (bao gồm `List<Showtime>`)                                                                          |
| GET    | `/api/movies/:movieId/showtimes/:showtimeId/seats`  | Lấy sơ đồ ghế và trạng thái cho suất chiếu       | N/A                                                                                    | `SeatLayout`                                                                                                      |
| POST   | `/api/orders`                                     | Tạo đơn đặt vé mới                               | `CreateBookingRequest` { `userId` (opt), `movieId`, `showtimeId`, `List<seatId>` }     | `BookingConfirmation` { `bookingId`, `status`, `message`, `ticketDetails` (opt) }                                 |
| GET    | `/api/orders/user/:userId`                        | Lấy lịch sử đặt vé của người dùng                | N/A                                                                                    | `List<Booking>`                                                                                                   |

#### WebSocket Endpoints (ví dụ: `ws://localhost/reservations`)

*   **Client to Server Messages:**
    *   `{ "action": "select_seat", "payload": { "showtimeId": "...", "seatId": "..." } }`
    *   `{ "action": "release_seat", "payload": { "showtimeId": "...", "seatId": "..." } }`
*   **Server to Client Messages:**
    *   `{ "event": "seat_status_updated", "payload": { "showtimeId": "...", "seatId": "...", "status": "reserved_by_you" / "available" / "reserved_by_other" } }`
    *   `{ "event": "reservation_error", "payload": { "message": "..." } }`

### 4.2. Movie Service API (Internal - được gọi bởi API Service)

#### RESTful Endpoints

| Method | Endpoint                                          | Description                                                              |
| ------ | ------------------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/movies`                                         | Lấy danh sách phim                                                       |
| GET    | `/movies/:movieId`                                | Lấy chi tiết phim                                                        |
| GET    | `/movies/:movieId/showtimes/:showtimeId/seats`      | Lấy sơ đồ và trạng thái ghế                                              |
| POST   | `/orders`                                         | Tạo đơn đặt vé                                                           |
| GET    | `/orders/user/:userId`                            | Lấy lịch sử đặt vé của người dùng                                        |
| POST   | `/seats/update-temporary-status`                  | Cập nhật trạng thái giữ ghế tạm thời (có thể là internal logic hơn là API) |

*(Request/Response bodies tương tự như phần API Gateway nhưng là giao tiếp nội bộ)*

### 4.3. Notifications Service API (Internal - được gọi bởi Movie Service hoặc qua Message Queue)

| Method / Event Trigger | Endpoint / Event Name        | Description                               | Request Body / Event Payload (Example)                                                                                                                               |
| ---------------------- | ---------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST (RPC/HTTP)        | `/send-booking-confirmation` | Gửi email xác nhận đặt vé                 | `EmailRequest` { `emailAddress`, `userName`, `bookingDetails` { `bookingId`, `movieTitle`, `showtime`, `seatNumbers`, `qrCodeData` (opt) } }                         |
| Event Listener         | `BookingConfirmedEvent`      | Xử lý sự kiện đặt vé thành công để gửi mail | `BookingConfirmedPayload` { `emailAddress`, `userName`, `bookingDetails` { `bookingId`, `movieTitle`, `showtime`, `seatNumbers`, `qrCodeData` (opt) } } |

---
*Lưu ý: Đây là tài liệu phân tích và thiết kế ở mức cao. Trong thực tế, mỗi service sẽ có tài liệu API chi tiết hơn (ví dụ: sử dụng OpenAPI/Swagger). Các quyết định về giao thức giao tiếp nội bộ (REST, gRPC, message queues) cũng cần được làm rõ.*
