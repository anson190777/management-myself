import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'auth/google_auth_service.dart';
import 'theme/app_theme.dart';
import 'features/account_banks/account_banks_screen.dart';
import 'features/login/login_screen.dart';
import 'features/revenue/revenue_screen.dart';
import 'features/room_bills/room_bills_screen.dart';
import 'features/rooms/rooms_screen.dart';
import 'features/shell/app_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: ManagementMyselfApp()));
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final _router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/login',
  redirect: (context, state) async {
    final signedIn = await GoogleAuthService.instance.isSignedIn;
    final onLogin = state.matchedLocation == '/login';
    if (!signedIn && !onLogin) return '/login';
    if (signedIn && onLogin) return '/house/rooms';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) =>
          AppShell(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/house/rooms',
              builder: (context, state) => const RoomsScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/house/room-bills',
              builder: (context, state) => const RoomBillsScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile/account-banks',
              builder: (context, state) => const AccountBanksScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/revenue',
              builder: (context, state) => const RevenueScreen(),
            ),
          ],
        ),
      ],
    ),
  ],
);

class ManagementMyselfApp extends StatelessWidget {
  const ManagementMyselfApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ManagementMyself',
      theme: buildAppTheme(),
      routerConfig: _router,
    );
  }
}
