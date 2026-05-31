# ManagementMyself — Mobile (Flutter)

App Flutter quản lý phòng trọ — **cùng Google Spreadsheet** với web, gọi Sheets API trực tiếp từ thiết bị.

## Tài liệu chính

- **[PROJECT_DOCS.md §10 — Mobile Flutter](../PROJECT_DOCS.md#10-mobile-flutter-app-mobile)** — kiến trúc, màn hình, parity web, cách chạy
- **[FLUTTER_MOBILE_PLAN.md](../FLUTTER_MOBILE_PLAN.md)** — plan triển khai & checklist phase
- **[docs/GCP_IOS_OAUTH.md](docs/GCP_IOS_OAUTH.md)** — OAuth client iOS

## Quick start

```bash
cp lib/config/google_config.example.dart lib/config/google_config.dart
# Sửa iosClientId + urlScheme theo GCP

# urlScheme trong google_config.dart phải khớp CFBundleURLSchemes trong ios/Runner/Info.plist
cd ios && pod install && cd ..

flutter pub get
flutter run -d <iphone_device_id> --release
```

`google_config.dart` nằm trong `.gitignore` — không commit.

## Stack

Flutter 3.12+ · Riverpod · go_router · google_sign_in · googleapis
