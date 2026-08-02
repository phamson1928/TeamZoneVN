# TeamZoneVN Mobile

Ứng dụng mobile TeamZoneVN xây dựng bằng Expo 54, React Native 0.81.5 và React 19.1.

## Chức năng hiện có

- Onboarding, đăng ký, đăng nhập, Google Sign-In và khôi phục mật khẩu.
- Khám phá, tạo, xem chi tiết và quản lý Zone.
- Nhóm, chat realtime và thông báo.
- Hồ sơ cá nhân, hồ sơ game và hồ sơ công khai.
- Bạn bè, lời mời Zone, danh sách chặn và bảng xếp hạng.

## Yêu cầu

- Node.js 20+
- Backend TeamZoneVN đang chạy
- Android Studio/emulator, Xcode simulator hoặc thiết bị phù hợp với Expo development build

Ứng dụng dùng native module `@react-native-google-signin/google-signin`; Expo Go tiêu chuẩn có thể không chứa module này. Khi gặp lỗi native module, dùng `npm run android`, `npm run ios` hoặc development build thay vì chỉ Expo Go.

## Cài đặt và chạy

```bash
npm install
npm start
```

Các lệnh khác:

```bash
npm run android
npm run ios
npm run web
npm run lint
npm test
```

## Kết nối Backend

API client ưu tiên `EXPO_PUBLIC_API_URL`. Tạo file `.env` trong thư mục `Frontend`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

- Android emulator thường truy cập máy host qua `http://10.0.2.2:3000`.
- Thiết bị thật cần IP LAN của máy chạy Backend và hai thiết bị phải truy cập được nhau.
- Không thêm dấu `/` cuối URL.

## Cấu trúc

```text
Frontend/
├── src/api/          HTTP client và API modules
├── src/components/   UI dùng lại
├── src/navigation/   Stack/tab navigation
├── src/screens/      Các màn hình của ứng dụng
├── src/store/        Zustand stores
├── src/theme/        Theme và token giao diện
├── src/types/        TypeScript types
├── App.tsx
└── app.json          Expo configuration
```
