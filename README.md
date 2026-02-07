# ISO 9001 Digital QMS Backend (PostgreSQL Locked)

## 🚀 Quy trình Làm việc & Thiết lập (Đã đơn giản hóa)

Project này sử dụng một quy trình cực kỳ đơn giản để quản lý cơ sở dữ liệu, chỉ với các file SQL chính:

1.  `supabase_setup.sql`: **File Thiết lập Schema.** Chứa toàn bộ cấu trúc database. File này **an toàn để chạy lại nhiều lần** và sẽ không xóa dữ liệu hiện có.
2.  `supabase_seed_all.sql`: **(Khuyến nghị)** Tạo dữ liệu mẫu cho **TẤT CẢ** các bảng (Users, Inspections, NCRs, IPOs, v.v.) để có một môi trường demo đầy đủ.
3.  `supabase_seed_ipo.sql`: **(Tùy chọn)** Chỉ tạo dữ liệu mẫu cho bảng IPO.

**CẢNH BÁO:** Các file `seed` sẽ **XÓA SẠCH** dữ liệu trong các bảng tương ứng trước khi thêm dữ liệu mới.

---

### **Workflow Quản lý Cấu trúc Database (An toàn)**

Khi bạn cần thay đổi cấu trúc database (ví dụ: thêm một bảng, thêm một cột):

1.  **Đưa ra Yêu cầu:** Mô tả thay đổi bạn muốn thực hiện.
2.  **AI Cập nhật Script:** Tôi sẽ cập nhật file `supabase_setup.sql` với các lệnh an toàn (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
3.  **Bạn Thực thi Script:**
    *   Mở Supabase project của bạn và đi đến mục **SQL Editor**.
    *   Sao chép **toàn bộ nội dung** của file `supabase_setup.sql` đã được cập nhật.
    *   Dán vào SQL Editor và nhấn **"Run"**.

Thao tác này sẽ áp dụng các thay đổi mới mà không ảnh hưởng đến dữ liệu hiện tại của bạn.

---

### **⚙️ Quy trình Thiết lập Ban đầu**

**Bước 1: Chạy Script Thiết lập Schema**

1.  Mở Supabase project của bạn và đi đến mục **SQL Editor**.
2.  Tạo một "New query" và chạy **toàn bộ nội dung** của file `supabase_setup.sql`.

**Bước 2: Tạo Storage Bucket (BẮT BUỘC CHO UPLOAD)**

1.  Trong Supabase dashboard, đi đến mục **Storage**.
2.  Nhấn **"Create a new bucket"** và đặt tên chính xác là: `qms-attachments`.
3.  **BỎ CHỌN** ô "Public bucket".
4.  Thiết lập **Policies** cho phép `authenticated` users có thể `insert`.

**Bước 3: KHỞI ĐỘNG LẠI API (QUAN TRỌNG)**

1.  Trong Supabase dashboard, đi đến **Project Settings** (biểu tượng bánh răng) &rarr; **API**.
2.  Cuộn xuống dưới cùng và nhấn vào nút **"Restart"**.

**Bước 4 (Tùy chọn): Tạo Dữ liệu Mẫu**

1.  Quay lại **SQL Editor**.
2.  Để có dữ liệu demo đầy đủ, chạy toàn bộ nội dung của file `supabase_seed_all.sql`.
