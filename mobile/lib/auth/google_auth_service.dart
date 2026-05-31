import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../config/google_config.dart';

const _kEmailKey = 'google_email';

/// google_sign_in 7.x: singleton + [initialize] + [authenticate].
class GoogleAuthService {
  GoogleAuthService._();
  static final GoogleAuthService instance = GoogleAuthService._();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final GoogleSignIn _signIn = GoogleSignIn.instance;

  Future<void>? _initFuture;
  GoogleSignInAccount? _account;

  GoogleSignInAccount? get currentUser => _account;

  Future<void> _ensureInitialized() {
    _initFuture ??= _signIn.initialize(
      clientId: GoogleConfig.iosClientId,
      serverClientId: GoogleConfig.webClientId,
    );
    return _initFuture!;
  }

  Future<String?> get storedEmail => _storage.read(key: _kEmailKey);

  Future<bool> get isSignedIn async {
    await _ensureInitialized();
    if (_account != null) return true;
    final email = await storedEmail;
    return email != null && email.isNotEmpty;
  }

  Future<GoogleSignInAccount> signIn() async {
    if (!GoogleConfig.isConfigured) {
      throw StateError(
        'Chưa cấu hình iOS Client ID — xem mobile/docs/GCP_IOS_OAUTH.md',
      );
    }
    await _ensureInitialized();
    final account = await _signIn.authenticate(
      scopeHint: GoogleConfig.scopes,
    );
    _account = account;
    await _storage.write(key: _kEmailKey, value: account.email);
    await _authorizeSheets(account);
    return account;
  }

  Future<GoogleSignInAccount?> signInSilently() async {
    if (!GoogleConfig.isConfigured) return null;
    await _ensureInitialized();
    try {
      final future = _signIn.attemptLightweightAuthentication();
      if (future == null) return null;
      final account = await future;
      if (account != null) {
        _account = account;
        await _storage.write(key: _kEmailKey, value: account.email);
        await _authorizeSheets(account);
      }
      return account;
    } catch (e, st) {
      debugPrint('signInSilently: $e\n$st');
      return null;
    }
  }

  Future<void> signOut() async {
    await _ensureInitialized();
    await _signIn.signOut();
    _account = null;
    await _storage.delete(key: _kEmailKey);
  }

  Future<String?> getAccessToken() async {
    await _ensureInitialized();
    var account = _account ?? await signInSilently();
    if (account == null) return null;
    final authz = await account.authorizationClient.authorizationForScopes(
      GoogleConfig.scopes,
    );
    if (authz != null) return authz.accessToken;
    final granted = await account.authorizationClient.authorizeScopes(
      GoogleConfig.scopes,
    );
    return granted.accessToken;
  }

  Future<void> _authorizeSheets(GoogleSignInAccount account) async {
    final existing = await account.authorizationClient.authorizationForScopes(
      GoogleConfig.scopes,
    );
    if (existing == null) {
      await account.authorizationClient.authorizeScopes(GoogleConfig.scopes);
    }
  }
}
