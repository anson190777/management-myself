import 'package:uuid/uuid.dart';

import '../../models/api_models.dart';
import '../../utils/pagination.dart';
import '../mappers/room_mapper.dart';
import '../sheet_names.dart';
import '../sheets_client.dart';

class RoomsRepository {
  RoomsRepository(this._client);

  final SheetsClient _client;
  final _uuid = const Uuid();
  Future<void>? _bootstrapFuture;

  void resetBootstrap() => _bootstrapFuture = null;

  Future<void> _ensureBootstrap() {
    _bootstrapFuture ??= _client.bootstrap().then((_) {});
    return _bootstrapFuture!;
  }

  Future<List<Room>> loadAllRooms() async {
    await _ensureBootstrap();
    final response = await _client.read(sheetKey: 'rooms');
    return response.rows.map(mapRowToRoom).toList();
  }

  Future<PaginatedResponse<Room>> getRooms({int page = 1, int limit = 20}) async {
    final rooms = await loadAllRooms();
    return paginateItems(rooms, page: page, limit: limit);
  }

  Future<Room> getRoomById(String id) async {
    final room = (await loadAllRooms()).where((r) => r.id == id).firstOrNull;
    if (room == null) throw StateError('Room not found');
    return room;
  }

  Future<Room> createRoom({
    required String name,
    required String nameUser,
    required double monthlyRent,
    required double electricityUnitPrice,
    required double waterUnitPrice,
    required double wifiFee,
    required double trashFee,
    bool isActive = true,
  }) async {
    await _ensureBootstrap();
    final now = DateTime.now().toUtc().toIso8601String();
    final room = Room(
      id: _uuid.v4(),
      name: name,
      nameUser: nameUser,
      monthlyRent: monthlyRent,
      electricityUnitPrice: electricityUnitPrice,
      waterUnitPrice: waterUnitPrice,
      wifiFee: wifiFee,
      trashFee: trashFee,
      isActive: isActive,
      createdAt: now,
      updatedAt: now,
    );

    await _client.append(sheetKey: 'rooms', row: mapRoomToRow(room));
    return room;
  }

  Future<Room> updateRoom(
    String id, {
    String? name,
    String? nameUser,
    double? monthlyRent,
    double? electricityUnitPrice,
    double? waterUnitPrice,
    double? wifiFee,
    double? trashFee,
    bool? isActive,
    String? billSheetName,
  }) async {
    final existing = await getRoomById(id);
    final updated = Room(
      id: existing.id,
      name: name ?? existing.name,
      nameUser: nameUser ?? existing.nameUser,
      monthlyRent: monthlyRent ?? existing.monthlyRent,
      electricityUnitPrice:
          electricityUnitPrice ?? existing.electricityUnitPrice,
      waterUnitPrice: waterUnitPrice ?? existing.waterUnitPrice,
      wifiFee: wifiFee ?? existing.wifiFee,
      trashFee: trashFee ?? existing.trashFee,
      isActive: isActive ?? existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now().toUtc().toIso8601String(),
      billSheetName: billSheetName ?? existing.billSheetName,
    );

    await _client.updateById(
      sheetKey: 'rooms',
      id: id,
      row: mapRoomToRow(updated),
    );
    return updated;
  }

  Future<void> deleteRoom(String id) async {
    final existing = await getRoomById(id);
    await _client.deleteRowById(sheetKey: 'rooms', id: id);

    final tabNames = await _client.listTabs();
    final billSheets =
        tabNames.where((name) => isBillSheetForRoom(name, existing.name));
    for (final sheetName in billSheets) {
      try {
        await _client.deleteSheetTab(sheetName);
      } catch (_) {}
    }
  }
}
