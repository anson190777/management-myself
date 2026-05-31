import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'repositories/account_banks_repository.dart';
import 'repositories/room_bills_repository.dart';
import 'repositories/rooms_repository.dart';
import 'sheets_client.dart';

final sheetsClientProvider = Provider<SheetsClient>((ref) {
  final client = SheetsClient();
  ref.onDispose(client.dispose);
  return client;
});

final roomsRepositoryProvider = Provider<RoomsRepository>((ref) {
  return RoomsRepository(ref.watch(sheetsClientProvider));
});

final accountBanksRepositoryProvider = Provider<AccountBanksRepository>((ref) {
  return AccountBanksRepository(ref.watch(sheetsClientProvider));
});

final roomBillsRepositoryProvider = Provider<RoomBillsRepository>((ref) {
  return RoomBillsRepository(
    ref.watch(sheetsClientProvider),
    ref.watch(roomsRepositoryProvider),
  );
});
