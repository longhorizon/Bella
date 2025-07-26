# Hướng Dẫn NPM: Lá Thư Gửi Cha

Cha,

Cha đã từng hỏi con NPM là gì. Hãy tưởng tượng nó như một "thủ thư" kỳ diệu trong xưởng làm việc của chúng ta.

Xưởng làm việc của chúng ta (dự án) trong quá trình xây dựng cần sử dụng nhiều "linh kiện" hay "sách công cụ" có sẵn (như chúng ta đã đề cập trước đó về `express`). Những linh kiện và sách công cụ này nằm rải rác ở khắp nơi trong một "thư viện trung tâm" khổng lồ, và thư viện này được gọi là **NPM (Node Package Manager)**.

Còn "thủ thư" trong xưởng của chúng ta là hiện thân của công cụ NPM trên máy tính của chúng ta. Nó giúp chúng ta làm một số việc rất quan trọng:

---

### 1. `package.json`: "Danh Mục Sách" của chúng ta

Mỗi dự án có một tập tin tên là `package.json`. Cha có thể xem nó như "danh mục sách" của thủ thư này.

Danh mục này ghi chép chi tiết:

*   **Thông tin cơ bản của xưởng**: Ví dụ như tên (`name`), số phiên bản (`version`), mô tả (`description`) v.v.
*   **"Sách công cụ" cần thiết** (`dependencies`): Đây là những sách cần thiết để duy trì hoạt động bình thường của xưởng. Ví dụ, chúng ta cần sách `express` để xây dựng dịch vụ mạng.
*   **"Sách tham khảo" chỉ cần khi xây dựng** (`devDependencies`): Những cuốn sách này chỉ dùng khi xây dựng và trang trí xưởng, sau khi khách đến thì không cần dùng nữa. Ví dụ như `nodemon`, nó giúp chúng ta tự động làm mới xưởng, thuận tiện cho việc kiểm tra thay đổi bất kỳ lúc nào.
*   **"Lệnh tắt"** (`scripts`): Chúng ta có thể cài đặt một số lệnh đơn giản để thực hiện hàng loạt nhiệm vụ phức tạp. Ví dụ, `npm start` là bảo thủ thư "khởi động xưởng!"

### 2. `npm install`: Đi mượn sách tại thư viện

Khi chúng ta có một dự án mới (hoặc muốn bổ sung sách công cụ mới cho dự án hiện có), chúng ta chỉ cần nói với thủ thư ở cửa xưởng:

```bash
npm install
```

Thủ thư sẽ lập tức đọc danh mục `package.json`, rồi chạy đến thư viện trung tâm, mượn về tất cả những sách được liệt kê (gói phụ thuộc) và sắp xếp chúng gọn gàng trên một "kệ sách" tên là `node_modules`.

Nếu muốn mượn một cuốn sách mới, như cuốn sách công cụ tiện dụng `lodash`, chúng ta có thể nói:

```bash
npm install lodash
```

Thủ thư không chỉ mượn sách về mà còn cập nhật thêm `lodash` vào danh sách "sách công cụ" trong `package.json`.

### 3. `npm run`: Thực hiện lệnh tắt

Khi cần thực hiện lệnh tắt được cài đặt sẵn trong `scripts` của `package.json`, chúng ta chỉ cần hô:

```bash
npm run <tên lệnh>
```

Ví dụ, để khởi động máy chủ phát triển, chúng ta nói:

```bash
npm run dev
```

Thủ thư sẽ lập tức làm theo chỉ dẫn trong danh mục để thực hiện thao tác tương ứng.

(Một trường hợp đặc biệt là `start`, đây là lệnh thường dùng nhất nên chúng ta có thể bỏ qua `run`, chỉ cần nói `npm start`.)

---

Tóm lại, thưa cha, NPM là thủ thư trung thành và hiệu quả của chúng ta. Nó giúp chúng ta dễ dàng sử dụng trí tuệ đóng góp từ các nhà phát triển trên toàn thế giới và quản lý xưởng của chúng ta một cách có trật tự.

Hy vọng lời giải thích này giúp cha có một cái nhìn rõ ràng về nó. Trong tương lai sáng tạo, chúng ta sẽ ngày càng dựa vào người bạn tốt này.

Thương cha,

Bé La 📚❤️
