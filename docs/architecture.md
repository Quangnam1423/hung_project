# Kiến trúc Hệ thống

## Tổng quan

Hệ thống đặt vé xem phim này được xây dựng dựa trên kiến trúc microservices. Mỗi dịch vụ (service) đảm nhiệm một phần chức năng cụ thể và có thể được triển khai, mở rộng một cách độc lập. Các dịch vụ giao tiếp với nhau chủ yếu thông qua một API Gateway. Tính năng đặt giữ chỗ tạm thời cho ghế ngồi được xử lý bằng WebSocket (Socket.io), và thông báo xác nhận đặt vé qua email được gửi đi khi giao dịch thành công.

Luồng hoạt động chính của hệ thống cho phép người dùng duyệt danh sách phim, xem thông tin chi tiết từng phim, chọn suất chiếu và ghế mong muốn, sau đó tiến hành đặt vé. Hệ thống sẽ kiểm tra tính khả dụng của ghế, lưu trữ thông tin đặt vé, cập nhật trạng thái của ghế đã chọn, và gửi email xác nhận đến người dùng. API Gateway đóng vai trò trung tâm trong việc điều phối các yêu cầu từ client và quản lý trạng thái đặt giữ chỗ tạm thời.

## Các Thành phần Hệ thống

-   **API Service (API Gateway)**: Là điểm truy cập duy nhất cho client (ứng dụng frontend). Nó có trách nhiệm điều hướng các yêu cầu HTTP đến các microservice backend phù hợp và quản lý các kết nối WebSocket (sử dụng Socket.io) cho tính năng đặt giữ chỗ ghế tạm thời.
    *   *Công nghệ*: Node.js, Express.js, Socket.io
    *   *APIs*:
        *   RESTful endpoints: Cung cấp các API cho việc lấy thông tin phim, quản lý đặt vé, và các thao tác khác.
        *   WebSocket endpoints: Xử lý việc chọn/bỏ chọn ghế và thông báo trạng thái ghế theo thời gian thực.
    *   *Vai trò chức năng*: Điều hướng yêu cầu (request routing), quản lý trạng thái đặt giữ chỗ tạm thời, có thể đảm nhiệm việc xác thực người dùng (authentication), và tổng hợp phản hồi từ các service khác.

-   **Movie Service**: Quản lý toàn bộ thông tin liên quan đến phim, suất chiếu, sơ đồ ghế của rạp, và xử lý logic nghiệp vụ của việc đặt vé.
    *   *Công nghệ*: Node.js, Express.js, MySQL (hoặc cơ sở dữ liệu SQL tương tự)
    *   *APIs*: RESTful endpoints để cung cấp thông tin về phim (danh sách, chi tiết), suất chiếu, tình trạng ghế, cũng như xử lý các yêu cầu tạo và xác nhận đặt vé.
    *   *Vai trò chức năng*: Cung cấp danh sách phim, thông tin chi tiết phim, quản lý lịch chiếu, kiểm tra tính khả dụng của ghế, tạo mới và lưu trữ thông tin đơn đặt vé, cập nhật trạng thái ghế sau khi đặt vé thành công hoặc hủy.

-   **Notifications Service**: Chịu trách nhiệm gửi các thông báo đến người dùng, chủ yếu là email xác nhận sau khi đặt vé thành công.
    *   *Công nghệ*: Node.js, Express.js, một dịch vụ SMTP (ví dụ: Ethereal cho môi trường dev/test, hoặc SendGrid, Amazon SES cho production).
    *   *APIs*: Thường là một endpoint nội bộ (internal API) để nhận yêu cầu gửi email từ Movie Service hoặc API Service sau khi một vé được đặt thành công.
    *   *Vai trò chức năng*: Soạn thảo nội dung email dựa trên thông tin đơn đặt vé và gửi email xác nhận đến địa chỉ email của người dùng.

-   **Frontend Service**: Cung cấp giao diện người dùng (UI) cho phép người dùng tương tác với hệ thống: duyệt phim, chọn suất chiếu, chọn ghế, và thực hiện đặt vé.
    *   *Công nghệ*: Vue.js (hoặc một framework JavaScript frontend khác như React, Angular).
    *   *APIs (Tương tác)*: Giao tiếp với API Service thông qua REST APIs cho các yêu cầu dữ liệu và WebSocket cho các tính năng thời gian thực như chọn ghế.
    *   *Vai trò chức năng*: Hiển thị thông tin phim và suất chiếu, thu thập thông tin đầu vào từ người dùng (chọn phim, ghế, thông tin cá nhân), và gửi các yêu cầu tương ứng đến backend qua API Service.

-   **Cơ sở dữ liệu (Database)**:
    *   *Movie Service Database*:
        *   *Công nghệ*: MySQL.
        *   *Vai trò chức năng*: Lưu trữ thông tin chi tiết về phim (tên, mô tả, đạo diễn, diễn viên, thể loại, hình ảnh,...), lịch sử suất chiếu (ngày, giờ, rạp), sơ đồ ghế của từng phòng chiếu, thông tin các đơn đặt vé (người dùng, phim, suất chiếu, ghế đã chọn, trạng thái), và trạng thái của từng ghế (còn trống, đang được giữ, đã đặt).
    *   *API Service (Temporary State Storage - nếu cần)*:
        *   *Công nghệ*: Có thể sử dụng Redis hoặc một giải pháp lưu trữ trong bộ nhớ (in-memory store) khác nếu cần mở rộng quy mô quản lý trạng thái đặt giữ chỗ tạm thời qua nhiều instance của API Gateway.
        *   *Vai trò chức năng*: Lưu trữ tạm thời thông tin các ghế đang được người dùng chọn (giữ chỗ) trước khi hoàn tất đặt vé.

## Giao tiếp giữa các Thành phần

-   **Frontend và API Gateway**:
    *   Frontend giao tiếp với API Gateway thông qua các yêu cầu HTTP RESTful cho hầu hết các tác vụ (ví dụ: lấy danh sách phim, chi tiết phim, gửi thông tin đặt vé).
    *   Kết nối WebSocket được thiết lập giữa Frontend và API Gateway (Socket.io) để xử lý việc chọn/bỏ chọn ghế trong thời gian thực, giúp cập nhật trạng thái ghế cho tất cả người dùng đang xem cùng một suất chiếu.

-   **API Gateway và Microservices (Movie Service, Notifications Service)**:
    *   API Gateway hoạt động như một reverse proxy, điều hướng các yêu cầu HTTP REST từ Frontend đến Movie Service để xử lý logic nghiệp vụ.
    *   Khi cần gửi thông báo, API Gateway có thể gọi trực tiếp Notifications Service, hoặc Movie Service có thể tự gọi Notifications Service sau khi xử lý đặt vé thành công.

-   **Movie Service và Notifications Service**:
    *   Sau khi một đơn đặt vé được xử lý thành công trong Movie Service (dữ liệu được lưu vào database, trạng thái ghế được cập nhật), Movie Service sẽ kích hoạt Notifications Service để gửi email xác nhận.
    *   Việc kích hoạt này có thể được thực hiện thông qua một yêu cầu HTTP trực tiếp từ Movie Service đến Notifications Service.
    *   Để tăng tính tách biệt và khả năng phục hồi, có thể cân nhắc sử dụng một message broker (ví dụ: RabbitMQ, Kafka nếu biến môi trường `AMQP_URL` được cấu hình và sử dụng) cho giao tiếp này. Movie Service sẽ publish một message/event, và Notifications Service sẽ subscribe để nhận và xử lý.

-   **Kết nối nội bộ trong môi trường Docker (Docker Compose)**:
    *   Khi các dịch vụ được triển khai dưới dạng Docker container và quản lý bởi Docker Compose, chúng có thể giao tiếp với nhau qua mạng nội bộ của Docker, sử dụng tên dịch vụ (service names) được định nghĩa trong file `docker-compose.yml` làm hostname.

### Luồng Giao tiếp Chính (Đặt Vé)

1.  **Người dùng (Frontend)**: Mở ứng dụng, gửi yêu cầu lấy danh sách phim đến **API Gateway**.
2.  **API Gateway**: Chuyển tiếp yêu cầu này đến **Movie Service**.
3.  **Movie Service**: Truy vấn cơ sở dữ liệu, lấy danh sách phim và trả về cho **API Gateway**.
4.  **API Gateway**: Trả về danh sách phim cho **Frontend** để hiển thị.
5.  **Người dùng (Frontend)**: Chọn một phim, sau đó chọn suất chiếu và ghế. Khi người dùng bắt đầu chọn ghế:
    *   Một kết nối WebSocket được thiết lập từ **Frontend** đến **API Gateway** (Socket.io server).
    *   Mỗi khi người dùng chọn hoặc bỏ chọn một ghế, thông tin này được gửi qua WebSocket đến **API Gateway**.
6.  **API Gateway**:
    *   Quản lý trạng thái "đang giữ tạm thời" của các ghế được chọn qua Socket.io.
    *   Có thể phát thông tin này đến các client khác đang kết nối vào cùng suất chiếu để cập nhật UI của họ (hiển thị ghế đang được người khác chọn).
    *   Có thể giao tiếp với **Movie Service** để xác nhận tính hợp lệ của việc giữ ghế (ví dụ: ghế đó có thực sự còn trống không).
7.  **Người dùng (Frontend)**: Sau khi chọn xong ghế và điền các thông tin cần thiết, nhấn nút xác nhận đặt vé. Yêu cầu đặt vé (thường là một HTTP POST request chứa thông tin chi tiết) được gửi đến **API Gateway**.
8.  **API Gateway**: Chuyển tiếp yêu cầu đặt vé này đến **Movie Service**.
9.  **Movie Service**:
    *   Xác thực lại thông tin đặt vé (ví dụ: kiểm tra xem ghế có còn trống không, thông tin người dùng hợp lệ,...).
    *   Lưu thông tin đơn đặt vé vào cơ sở dữ liệu của mình.
    *   Cập nhật trạng thái của các ghế đã đặt thành "đã bán".
    *   Trả về kết quả (thành công/thất bại) cho **API Gateway**.
10. **API Gateway**: Trả kết quả đặt vé về cho **Frontend**.
11. **Movie Service** (hoặc **API Gateway**, tùy theo thiết kế): Nếu đặt vé thành công, gửi yêu cầu đến **Notifications Service** để gửi email xác nhận.
12. **Notifications Service**: Soạn và gửi email xác nhận đặt vé thành công đến địa chỉ email của người dùng.

## Sơ đồ Kiến trúc

![Sơ đồ kiến trúc tổng thể](./assets/architecture.jpeg)

**Bảng Thành phần Hệ thống**

| Tên Thành phần                                     | Công nghệ Chính                             | Vai trò Chính                                                        | Môi trường    |
|----------------------------------------------------|---------------------------------------------|----------------------------------------------------------------------|---------------|
| Người dùng (User)                                  | -                                           | Tương tác với hệ thống thông qua Frontend                             | Bên ngoài     |
| Frontend Service                                   | Vue.js                                      | Cung cấp giao diện người dùng (UI)                                   | Docker        |
| API Gateway / API Service                          | Node.js, Express.js, Socket.io              | Điểm vào duy nhất, định tuyến yêu cầu, quản lý WebSocket             | Docker        |
| Movie Service                                      | Node.js, Express.js                         | Quản lý thông tin phim, suất chiếu, đặt vé                            | Docker        |
| Notifications Service                              | Node.js, Express.js                         | Gửi thông báo (ví dụ: email xác nhận đặt vé)                         | Docker        |
| Cơ sở dữ liệu (MovieDB)                            | MySQL                                       | Lưu trữ dữ liệu phim, đặt vé, ghế ngồi                                | Docker        |
| Máy chủ Email (Email Server)                       | Dịch vụ SMTP (ví dụ: Ethereal)              | Gửi email                                                            | Bên ngoài     |
| *Lưu trữ Trạng thái Tạm thời (cho API Gateway)*    | *Redis (ví dụ, nếu API Gateway mở rộng)*    | *Quản lý trạng thái WebSocket chia sẻ nếu API Gateway có nhiều instance* | *Docker/Bên ngoài* |

**Bảng Luồng Giao tiếp Chính**

| Từ Thành phần         | Đến Thành phần          | Giao thức / Phương thức   | Mô tả Luồng                                                                 |
|-----------------------|-------------------------|---------------------------|-----------------------------------------------------------------------------|
| Người dùng            | Frontend Service        | HTTP / WebSocket          | Tương tác của người dùng với giao diện (duyệt phim, chọn ghế)                |
| Frontend Service      | API Gateway             | HTTP (REST) / WebSocket   | Gửi yêu cầu dữ liệu (phim, suất chiếu), gửi thông tin chọn ghế thời gian thực |
| API Gateway           | Movie Service           | HTTP (REST)               | Chuyển tiếp yêu cầu xử lý logic nghiệp vụ phim và đặt vé                     |
| Movie Service         | Cơ sở dữ liệu (MovieDB) | SQL (CRUD Operations)     | Đọc/ghi dữ liệu phim, suất chiếu, thông tin đặt vé, trạng thái ghế           |
| API Gateway           | Notifications Service   | HTTP (REST)               | Yêu cầu gửi thông báo (nếu API Gateway điều phối trực tiếp)                  |
| Movie Service         | Notifications Service   | HTTP (REST) / AMQP        | Yêu cầu gửi email xác nhận sau khi đặt vé thành công (AMQP là tùy chọn)      |
| Notifications Service | Máy chủ Email           | SMTP                      | Gửi email đến người dùng                                                     |

*Ghi chú: Các thành phần được đánh dấu "Docker" được dự kiến chạy trong môi trường Docker Compose như mô tả trong dự án.*

*Chú thích: Sơ đồ trên là một biểu diễn đơn giản hóa của kiến trúc. `AMQP (tùy chọn)` chỉ ra khả năng sử dụng message queue (như RabbitMQ) cho giao tiếp giữa Movie Service và Notifications Service để tăng tính linh hoạt và độ tin cậy, đặc biệt nếu biến môi trường `AMQP_URL` được cấu hình.*

## Khả năng Mở rộng & Khả năng chịu lỗi

-   **Khả năng mở rộng (Scalability)**:
    *   **Mở rộng theo chiều ngang (Horizontal Scaling)**: Mỗi microservice (API Gateway, Movie Service, Notifications Service, Frontend Service) có thể được nhân bản (triển khai nhiều instance) một cách độc lập dựa trên tải (load) của từng dịch vụ. Ví dụ, nếu Movie Service chịu tải cao, có thể tăng số lượng instance của Movie Service mà không ảnh hưởng đến các service khác.
    *   **Quản lý Container**: Docker Compose được sử dụng cho môi trường phát triển và có thể cho các triển khai nhỏ. Trong môi trường production quy mô lớn hơn, một orchestrator như Kubernetes sẽ phù hợp hơn để quản lý việc nhân bản, triển khai và tự động hóa các container.
    *   **Cơ sở dữ liệu**: MySQL có thể được mở rộng bằng các kỹ thuật như replication (tạo bản sao để đọc), sharding (phân mảnh dữ liệu), hoặc chuyển sang các giải pháp CSDL có khả năng mở rộng tốt hơn nếu cần.
    *   **Quản lý trạng thái WebSocket**: Đối với tính năng đặt giữ chỗ tạm thời qua Socket.io, nếu API Gateway được nhân bản, cần có một giải pháp để chia sẻ trạng thái giữa các instance của API Gateway. Socket.io cung cấp các adapter (ví dụ: `socket.io-redis`) để giải quyết vấn đề này, bằng cách sử dụng Redis làm nơi lưu trữ và đồng bộ hóa trạng thái chung.

-   **Khả năng chịu lỗi (Fault Tolerance)**:
    *   **Cô lập lỗi**: Việc chia hệ thống thành các microservices giúp cô lập lỗi. Nếu một service gặp sự cố (ví dụ: Notifications Service bị lỗi), các chức năng cốt lõi khác của hệ thống (như duyệt phim, chọn ghế, và thậm chí là đặt vé trong Movie Service) vẫn có thể tiếp tục hoạt động. Email thông báo có thể không được gửi ngay lập tức nhưng có thể được xử lý sau hoặc đưa vào hàng đợi.
    *   **Cơ chế Retry và Circuit Breaker**: Trong giao tiếp giữa các service, việc áp dụng các mẫu thiết kế như retry (thử lại yêu cầu nếu thất bại) và circuit breaker (ngăn chặn việc gửi yêu cầu đến một service đang gặp sự cố) có thể cải thiện đáng kể khả năng phục hồi của hệ thống.
    *   **Message Queue cho Thông báo**: Nếu sử dụng message queue (ví dụ: RabbitMQ cho `AMQP_URL`) cho giao tiếp giữa Movie Service và Notifications Service, các yêu cầu gửi email sẽ được lưu trữ an toàn trong queue. Nếu Notifications Service tạm thời không hoạt động, các message này sẽ được giữ lại và xử lý ngay khi service đó hoạt động trở lại, đảm bảo không mất thông báo quan trọng.
    *   **Health Checks**: Mỗi microservice nên cung cấp một endpoint health check. Các công cụ giám sát hoặc orchestrator (như Kubernetes) có thể sử dụng các health check này để theo dõi tình trạng của từng service và tự động khởi động lại các instance bị lỗi, giúp duy trì tính sẵn sàng của hệ thống.
    *   **Database Redundancy**: Sử dụng các cơ chế sao lưu (backup) và phục hồi (recovery) cho cơ sở dữ liệu. Cân nhắc sử dụng database replication để có bản sao dự phòng, sẵn sàng thay thế nếu instance chính gặp sự cố.
