# 🧩 Hệ Thống Đặt Vé Xem Phim

## **ỨNG DỤNG ĐẶT VÉ XEM PHIM ĐƯỢC TRIỂN KHAI THEO KIẾN TRÚC MICROSERVICES**

## Thành Viên Nhóm

| Họ và tên       | Mã sinh viên |
|-----------------|--------------|
| Tống Quang Nam  |  B21DCCN556  |
| Dương Thái Bình |  B21DCCN172  |
| Đăng Thanh Mai  |  B21DCCN508  |

---

## 📁 Cấu Trúc Thư Mục

```
movie-ticket-booking-system/
├── README.md                       # File hướng dẫn này
├── docker-compose.yml              # Cài đặt đa container cho tất cả dịch vụ
├── LICENSE                         # Giấy phép dự án
├── docs/                           # Thư mục tài liệu và tài sản
│   ├── analysis-and-design.md      # Tài liệu phân tích và thiết kế
│   ├── architecture.md             # Tài liệu kiến trúc hệ thống
│   └── assets/                     # Chứa hình ảnh, sơ đồ cho tài liệu
│       ├── architecture.jpeg       # Sơ đồ kiến trúc
│       ├── demo.gif                # GIF demo
│       ├── movie.jpg               # Hình ảnh phim
│       ├── movies.jpg              # Hình ảnh danh sách phim
│       ├── orders.png              # Hình ảnh đơn hàng
│       ├── temporary-reservation.gif # GIF demo đặt giữ chỗ tạm thời
│       └── ticket.png              # Hình ảnh vé
├── api-service/                    # Dịch vụ API Gateway
│   ├── Dockerfile                  # Cấu hình Docker cho dịch vụ API
│   ├── package.json                # Các dependency và script Node.js
│   └── src/                        # Mã nguồn cho dịch vụ API
├── frontend/                       # Ứng dụng web Frontend
│   ├── Dockerfile                  # Cấu hình Docker cho frontend
│   ├── package.json                # Các dependency và script Node.js
│   └── src/                        # Mã nguồn cho frontend (Vue.js)
├── movie-service/                  # Microservice quản lý phim
│   ├── Dockerfile                  # Cấu hình Docker cho dịch vụ phim
│   ├── package.json                # Các dependency và script Node.js
│   └── src/                        # Mã nguồn cho dịch vụ phim
│       ├── config/db.js            # Cấu hình cơ sở dữ liệu
│       └── init/index.js           # Script để điền dữ liệu mẫu vào DB
└── notifications-service/          # Microservice quản lý thông báo
    ├── Dockerfile                  # Cấu hình Docker cho dịch vụ thông báo
    ├── package.json                # Các dependency và script Node.js
    └── src/                        # Mã nguồn cho dịch vụ thông báo

Lưu ý: Cấu trúc này làm nổi bật các thành phần chính. Mỗi thư mục dịch vụ chứa mã nguồn, Dockerfile và cấu hình riêng.
```

---

## Về Dự Án

Dự án này là một ứng dụng đặt vé xem phim, được triển khai theo kiến trúc microservices. Nó cho phép người dùng duyệt phim, mua vé và nhận thông báo qua email. Hệ thống được thiết kế để có thể mở rộng và dễ bảo trì bằng cách tách biệt các chức năng khác nhau thành các dịch vụ riêng lẻ.

Các khía cạnh chính của dự án bao gồm:
- **Kiến trúc Microservice**: Hệ thống được chia thành nhiều dịch vụ độc lập (API Gateway, Dịch vụ Phim, Dịch vụ Thông báo, Frontend).
- **Container hóa**: Docker và Docker Compose được sử dụng để dễ dàng cài đặt và triển khai các dịch vụ.
- **Giao tiếp bất đồng bộ**: Ngụ ý bởi biến `AMQP_URL` cho khả năng sử dụng hàng đợi tin nhắn (ví dụ: cho thông báo).
- **Tính năng thời gian thực**: Đặt giữ chỗ tạm thời được triển khai bằng Socket.io.

### Xây dựng với

1.  Node.js
2.  Express.js (giả định cho `api-service`, `movie-service`, `notifications-service`)
3.  Vue.js (dựa trên `frontend/src/App.vue`)
4.  Docker & Docker Compose
5.  Socket.io
6.  MySQL (Cơ sở dữ liệu chính cho `movie-service`)
7.  OMDb API (cho chi tiết phim)
8.  TMDb API (cho chi tiết phim)
9.  Ethereal (cho dịch vụ SMTP giả)

---

## 🚀 Bắt đầu

### Điều kiện tiên quyết

*   Cài đặt Docker và Docker Compose: [Hướng dẫn cài đặt Docker](https://docs.docker.com/get-docker/)
*   Node.js và npm (cho phát triển cục bộ nếu không chỉ sử dụng Docker)

### Sao chép Kho lưu trữ này

```bash
git clone <YOUR_REPOSITORY_URL_HERE>
cd movie-ticket-booking-system
```
*(Vui lòng cập nhật URL kho lưu trữ của bạn)*

### Cài đặt

1.  **Kết nối Cơ sở dữ liệu (MySQL)**:
    Thiết lập kết nối đến cơ sở dữ liệu của bạn trong `movie-service/src/config/db.js`.
    File cấu hình mặc định sử dụng MySQL.

2.  **Biến môi trường**:
    Tạo một file `.env` ở thư mục gốc của dự án `movie-ticket-booking-system` hoặc cấu hình các biến môi trường theo yêu cầu của mỗi dịch vụ.
    Một biến quan trọng cần đặt là `AMQP_URL` (ví dụ: cho RabbitMQ qua CloudAMQP):
    ```
    AMQP_URL=amqp://user:password@host/vhost
    ```
    *(Bạn có thể sử dụng gói 'Little Lemur' miễn phí từ [CloudAMQP](https://www.cloudamqp.com/))*

### Triển khai với Docker Compose

1.  **Khởi động Dịch vụ**:
    Từ thư mục `movie-ticket-booking-system` (nơi chứa file `docker-compose.yml`):
    ```bash
    docker-compose up -d
    ```

2.  **Khởi tạo Dữ liệu Mẫu (Tùy chọn nhưng được khuyến nghị)**:
    Sau khi các dịch vụ đang chạy, hãy điền dữ liệu mẫu vào cơ sở dữ liệu:
    ```bash
    docker exec -it <MOVIE_SERVICE_CONTAINER_NAME> node src/init
    ```
    *Thay thế `<MOVIE_SERVICE_CONTAINER_NAME>` bằng tên container thực tế của dịch vụ phim của bạn (bạn có thể tìm thấy tên này bằng lệnh `docker ps`).*

Sau khi khởi động các dịch vụ, ứng dụng web sẽ có sẵn tại `http://localhost:80` (hoặc theo cấu hình trong `docker-compose.yml` và dịch vụ frontend của bạn).

---

## ✨ Tính năng

-   **Duyệt phim có sẵn tại rạp**
    *   Chi tiết phim được lấy từ các API bên ngoài: [OMDb](http://www.omdbapi.com/) và [TMDb](https://www.themoviedb.org/).
    *   ![](docs/assets/movies.jpg)
    *   ![](docs/assets/movie.jpg)

-   **Mua vé**
    *   Đơn hàng được lưu trữ trong cơ sở dữ liệu cục bộ.
    *   ![](docs/assets/demo.gif)
    *   ![](docs/assets/orders.png)

-   **Đặt giữ chỗ tạm thời**
    *   Được triển khai bằng [Socket.io](https://socket.io/). Mỗi phim có một phòng riêng, vì vậy người dùng chỉ đăng ký các sự kiện cho bộ phim họ đang duyệt.
    *   Thông tin đặt giữ chỗ được lưu trữ trong bộ nhớ của API gateway.
    *   *Gợi ý cho môi trường production: Để cải thiện khả năng mở rộng của API, thông tin đặt giữ chỗ nên được lưu trữ trong một cơ sở dữ liệu phân tán như [Redis](https://redis.io/)*.
    *   ![](docs/assets/temporary-reservation.gif)

-   **Gửi email kèm vé đã mua**
    *   Sử dụng một dịch vụ SMTP giả như [Ethereal](https://ethereal.email/) cho việc phát triển và kiểm thử.
    *   ![](docs/assets/ticket.png)

---

## 🛠️ Phát triển

### Các lệnh Docker Compose hữu ích

*   **Xây dựng lại container** (nếu bạn đã thay đổi Dockerfile hoặc mã nguồn cần xây dựng lại):
    ```bash
    docker-compose build
    ```

*   **Liệt kê tất cả container** (đang chạy và đã dừng):
    ```bash
    docker-compose ps -a
    ```

*   **Xem log cho một dịch vụ cụ thể**:
    ```bash
    docker-compose logs -f <SERVICE_NAME>
    ```
    *(ví dụ: `docker-compose logs -f movie-service`)*

*   **Dừng và xóa container, mạng, volume và image được tạo bởi `up`**:
    ```bash
    docker-compose down
    ```

---

## 📄 Tài liệu Dự án

-   [Phân tích và Thiết kế Hệ thống](./movie-ticket-booking-system/docs/analysis-and-design.md)
-   [Kiến trúc Hệ thống](./movie-ticket-booking-system/docs/architecture.md)

## 🔗 Liên kết hữu ích

-   Cách áp dụng biến môi trường trong giai đoạn xây dựng container: [Bình luận trên Docker Compose Issue](https://github.com/docker/compose/issues/1837#issuecomment-316896858)
-   Tham số build của Docker Compose (map vs list): [Bình luận trên Docker for Mac Issue](https://github.com/docker/for-mac/issues/2661#issuecomment-370362897)
-   [CloudAMQP](https://www.cloudamqp.com/) (cho AMQP message broker)
-   [OMDb API](http://www.omdbapi.com/)
-   [TMDb API](https://www.themoviedb.org/)
-   [Socket.io](https://socket.io/)
-   [Ethereal Email](https://ethereal.email/)

---

*(Tùy chọn: Cân nhắc thêm các phần như "Đóng góp", "Chi tiết Giấy phép" nếu chưa có trong file LICENSE, hoặc "Tài liệu API" cụ thể nếu bạn có thông số kỹ thuật Swagger/OpenAPI.)*

*(Tùy chọn: Nếu đây là một bài tập học thuật, bạn có thể muốn thêm các phần như "Chi tiết Nộp bài" hoặc "Lời cảm ơn" như trong ví dụ của bạn.)*
