# 📖 Tạp chí Phương Đông

**Tạp chí Phương Đông** là hệ thống tạp chí trực tuyến dành cho sinh viên Trường Đại học Phương Đông.  
Website cho phép sinh viên đọc các số tạp chí mới nhất, đồng thời có hệ thống quản trị (admin) để biên tập, xuất bản và quản lý tạp chí.

---

## 🚀 Công nghệ sử dụng

- **Next.js 14 (App Router)** – framework React hiện đại, hỗ trợ SSR/SSG.  
- **TailwindCSS** – utility-first CSS framework, responsive nhanh chóng.  
- **shadcn/ui** – bộ UI components chuẩn, đẹp, dễ tùy biến.  
- **Prisma ORM** – mapping schema SQL → model code, kết nối DB thuận tiện.  
- **SQL Database** – cơ sở dữ liệu lưu thông tin tạp chí, người dùng, file upload.  
- **Auth tự xây dựng** – hệ thống đăng nhập / phân quyền cho sinh viên & admin.  
- **File Upload (Word/PDF)** – upload file Word/PDF, tự động chuyển đổi thành các trang hiển thị trực tuyến.  
- **Storage (Supabase S3 / local)** – lưu trữ file upload và ảnh bìa.  

---

## 📂 Cấu trúc CSDL (Prisma Schema)

```prisma
model TapChi {
  id          String   @id @default(cuid())
  tieuDe      String
  moTa        String?
  anhBia      String?      // ảnh bìa
  fileUpload  File?        @relation(fields: [fileUploadId], references: [id])
  fileUploadId String?     
  pages       Page[]       
  trangThai   String       @default("draft") // draft | published
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Page {
  id        String   @id @default(cuid())
  soTrang   Int
  imageUrl  String?     
  noiDung   String?     
  tapChi    TapChi       @relation(fields: [tapChiId], references: [id])
  tapChiId  String
}

model File {
  id        String   @id @default(cuid())
  fileName  String
  fileType  String
  fileUrl   String   // link Supabase/local
  createdAt DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      String   @default("student") // student | admin
  createdAt DateTime @default(now())
}
```

## ✨ Tính năng chính
## 👩‍🎓 Đối với sinh viên

Xem danh sách tạp chí đã phát hành.

Đọc online trên giao diện flipbook đẹp mắt.

Tìm kiếm theo số, chủ đề hoặc từ khóa.

## 👨‍💻 Đối với admin

Đăng nhập và phân quyền.

Tạo tạp chí mới, upload Word/PDF → hệ thống tự sinh trang.

Quản lý ảnh bìa, mô tả, trạng thái (draft/published).

Quản lý user (thêm/sửa/xóa sinh viên, admin).

## 🔄 Quy trình upload & render tạp chí

Admin upload file Word/PDF.

Hệ thống lưu vào bảng File, liên kết với TapChi.

Backend convert Word/PDF → ảnh trang (PNG/JPEG) + trích xuất text (nếu cần).

## 🛠️ Cài đặt & chạy dự án
1. Clone dự án
```
git clone https://github.com/your-repo/tapchi-phuongdong.git
cd tapchi-phuongdong
```
3. Cài đặt dependencies
```
npm install
```

Tự động sinh record Page[] trong DB.


Giao diện hiển thị Flipbook với PageFlip hoặc viewer tích hợp.
