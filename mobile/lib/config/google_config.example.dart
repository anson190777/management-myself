/// Copy → `google_config.dart` và điền iOS Client ID sau khi tạo trên Google Cloud.
/// Web Client ID = cùng project với Next.js (public).
class GoogleConfig {
  /// OAuth client iOS — Credentials → Create → iOS, Bundle ID khớp Xcode.
  static const iosClientId =
      'REPLACE_IOS_CLIENT_ID.apps.googleusercontent.com';

  /// Web client (Next.js) — cần cho serverClientId / access token Sheets API.
  static const webClientId =
      '803101295999-sl9munqjld1mu1g76vvfrdi9brf9htn9.apps.googleusercontent.com';

  static const spreadsheetId =
      '1JRTw0JdfMroakOY9B-J3B88WdMaNLTRYrWxC0u5zSvo';

  static const scopes = <String>[
    'https://www.googleapis.com/auth/spreadsheets',
    'email',
  ];

  /// Reversed iOS client ID → CFBundleURLSchemes
  /// VD client `123-abc.apps.googleusercontent.com` → `com.googleusercontent.apps.123-abc`
  static const urlScheme =
      'com.googleusercontent.apps.REPLACE_IOS_CLIENT_PREFIX';

  static bool get isConfigured =>
      !iosClientId.contains('REPLACE') && !urlScheme.contains('REPLACE');
}
