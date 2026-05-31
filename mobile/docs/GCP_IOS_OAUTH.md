# Phase 1 — OAuth client iOS (làm trên Google Cloud Console)

Dùng **cùng GCP project** với web. Không xóa Web client.

## Checklist

1. [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) — **Testing**, thêm email iPhone vào **Test users**
2. Scopes: `spreadsheets`, `userinfo.email`
3. [Library](https://console.cloud.google.com/apis/library) — bật **Google Sheets API**, **Google Drive API**
4. [Credentials](https://console.cloud.google.com/apis/credentials) → **Create OAuth client ID** → **iOS**
   - Bundle ID: `com.sonnguyen.managementmyself` (khớp Xcode)
5. Copy **iOS Client ID** → `mobile/lib/config/google_config.dart`

## `google_config.dart`

```dart
static const iosClientId = 'XXXX.apps.googleusercontent.com';
static const urlScheme = 'com.googleusercontent.apps.XXXX'; // prefix trước .apps...
```

Sau khi sửa `urlScheme`, cập nhật **`mobile/ios/Runner/Info.plist`** → `CFBundleURLSchemes` (cùng giá trị reversed client ID).

```bash
cd mobile/ios && pod install && cd ../..
```

## Web client (đã có)

`803101295999-sl9munqjld1mu1g76vvfrdi9brf9htn9.apps.googleusercontent.com` — giữ làm `webClientId` / `serverClientId`.

## Trên iPhone lần đầu

Consent **Testing** → **Advanced** → **Go to ManagementMyself (unsafe)**.
