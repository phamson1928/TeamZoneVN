Vai trò (Role)	Email đăng nhập	Tên người dùng (Username)	Ghi chú
ADMIN	admin@teamzonevn.com	Admin_Master	Toàn quyền quản trị hệ thống
USER	test-demo@teamzonevn.com	TestUser_Seed	Tài khoản demo chính
USER	son.pham@example.com	SonGoku_VN	Game thủ Valorant/LoL
USER	linh.nguyen@example.com	Linh_Xinh_Genshin	Game thủ Genshin Impact
USER	tuan.tran@example.com	Tuan_Fps_God	Chuyên game FPS (CS2)
USER	huong.le@example.com	Huong_Support	Chuyên Support (Tốc Chiến)
USER	duy.nguyen@example.com	Duy_Solo_Top	Đang bị cảnh cáo (Warning)
USER	toxic.player@example.com	Toxic_Yashuo	Đã bị Banned

1. Cách chạy dự án
Dự án gồm 3 phần chính: Backend, Frontend (Mobile App), và Dashboard (Web Admin).

Bước 1: Chạy Backend (NestJS + Prisma)
Mở terminal và di chuyển vào thư mục backend: cd Backend
Cài đặt thư viện: npm install
Tạo file .env từ file .env.example và cấu hình DATABASE_URL (PostgreSQL).
Đẩy schema lên database: npx prisma db push
Chạy seed để tạo dữ liệu mẫu và tài khoản: npx prisma db seed
Khởi động server: npm run start:dev (Server sẽ chạy tại http://localhost:3000)
Bước 2: Chạy Dashboard (Giao diện Admin - React + Vite)
Di chuyển vào thư mục dashboard: cd Dashboard
Cài đặt thư viện: npm install
Khởi động: npm run dev
Bước 3: Chạy Frontend (Ứng dụng Mobile - React Native/Expo)
Di chuyển vào thư mục frontend: cd Frontend
Cài đặt thư viện: npm install
Khởi động: npm start (Sử dụng ứng dụng Expo Go trên điện thoại hoặc trình giả lập để xem).