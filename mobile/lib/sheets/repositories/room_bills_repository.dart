import 'package:uuid/uuid.dart';

import '../../models/api_models.dart';
import '../../utils/pagination.dart';
import '../calculations/room_bill_calc.dart';
import '../mappers/room_bill_mapper.dart';
import '../sheet_names.dart';
import '../sheets_client.dart';
import 'rooms_repository.dart';

class RoomBillsRepository {
  RoomBillsRepository(this._client, this._rooms);

  final SheetsClient _client;
  final RoomsRepository _rooms;
  final _uuid = const Uuid();
  List<String>? _tabNamesCache;

  void resetTabCache() => _tabNamesCache = null;

  Future<List<String>> _loadTabNames() async {
    _tabNamesCache ??= await _client.listTabs();
    return _tabNamesCache!;
  }

  List<String> _billSheetNamesForRoom(List<String> tabNames, Room room) =>
      tabNames.where((name) => isBillSheetForRoom(name, room.name)).toList();

  Future<List<RoomBill>> _loadBillsForSheet(String sheetName, {Room? room}) async {
    try {
      final response = await _client.read(sheetName: sheetName);
      return response.rows.map((row) => mapRowToRoomBill(row, room: room)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<List<RoomBill>> _loadBillsForRoom(Room room, List<String> tabNames) async {
    final results = <RoomBill>[];
    for (final sheetName in _billSheetNamesForRoom(tabNames, room)) {
      results.addAll(await _loadBillsForSheet(sheetName, room: room));
    }
    return results;
  }

  Future<({String sheetName, RoomBill bill})?> _findBillById(
    Room room,
    String billId,
    List<String> tabNames,
  ) async {
    for (final sheetName in _billSheetNamesForRoom(tabNames, room)) {
      final bills = await _loadBillsForSheet(sheetName, room: room);
      final bill = bills.where((b) => b.id == billId).firstOrNull;
      if (bill != null) return (sheetName: sheetName, bill: bill);
    }
    return null;
  }

  Future<PaginatedResponse<RoomBill>> getRoomBills({
    String? roomId,
    String? billingYear,
    String? billingMonth,
    String? beforeMonth,
    int? limit,
    int page = 1,
  }) async {
    final tabNames = await _loadTabNames();
    final roomsPage = await _rooms.getRooms(page: 1, limit: 500);
    var items = <RoomBill>[];

    if (roomId != null) {
      final room = roomsPage.items.where((r) => r.id == roomId).firstOrNull ??
          await _rooms.getRoomById(roomId);

      if (billingYear != null) {
        final sheetName = buildBillSheetName(room.name, billingYear);
        items = await _loadBillsForSheet(sheetName, room: room);
      } else {
        items = await _loadBillsForRoom(room, tabNames);
      }
    }

    if (billingMonth != null) {
      items = items.where((b) => b.billingMonth == billingMonth).toList();
    }

    if (beforeMonth != null) {
      items = items.where((b) => b.billingMonth.compareTo(beforeMonth) < 0).toList()
        ..sort((a, b) => b.billingMonth.compareTo(a.billingMonth));
      final take = limit ?? 1;
      return paginateItems(items.take(take).toList(), page: page, limit: limit ?? 20);
    }

    return paginateItems(items, page: page, limit: limit ?? 20);
  }

  Future<RoomBill> createRoomBill(RoomBillInput input) async {
    final room = await _rooms.getRoomById(input.roomId);
    final sheetName = buildBillSheetName(room.name, input.billingMonth);

    final existing = await _loadBillsForSheet(sheetName, room: room);
    if (existing.any((b) => b.billingMonth == input.billingMonth)) {
      throw StateError('Bill already exists for month ${input.billingMonth}');
    }

    final computed = buildRoomBillPayload(input, room);
    final now = DateTime.now().toUtc().toIso8601String();
    final bill = RoomBill(
      id: _uuid.v4(),
      roomId: room.id,
      room: room,
      roomName: room.name,
      billingMonth: computed.billingMonth,
      electricityOldReading: computed.electricityOldReading,
      electricityNewReading: computed.electricityNewReading,
      electricityUsed: computed.electricityUsed,
      waterOldReading: computed.waterOldReading,
      waterNewReading: computed.waterNewReading,
      waterUsed: computed.waterUsed,
      electricityAmount: computed.electricityAmount,
      waterAmount: computed.waterAmount,
      wifiFee: computed.wifiFee,
      trashFee: computed.trashFee,
      monthlyRent: computed.monthlyRent,
      otherFees: computed.otherFees,
      note: computed.note,
      totalAmount: computed.totalAmount,
      createdAt: now,
      updatedAt: now,
    );

    await _client.ensureSheetWithHeaders(sheetName: sheetName);
    resetTabCache();
    await _client.append(sheetName: sheetName, row: mapRoomBillToRow(bill));
    return bill;
  }

  Future<RoomBill> updateRoomBill(String id, String roomId, RoomBillInput patch) async {
    final room = await _rooms.getRoomById(roomId);
    final tabNames = await _loadTabNames();
    final located = await _findBillById(room, id, tabNames);
    if (located == null) throw StateError('Room bill not found');

    final existing = located.bill;
    final merged = RoomBillInput(
      roomId: room.id,
      billingMonth: patch.billingMonth,
      electricityOldReading: patch.electricityOldReading,
      electricityNewReading: patch.electricityNewReading,
      waterOldReading: patch.waterOldReading,
      waterNewReading: patch.waterNewReading,
      wifiFee: patch.wifiFee ?? existing.wifiFee,
      trashFee: patch.trashFee ?? existing.trashFee,
      monthlyRent: patch.monthlyRent ?? existing.monthlyRent,
      otherFees: patch.otherFees ?? existing.otherFees,
      note: patch.note ?? existing.note,
    );

    final computed = buildRoomBillPayload(merged, room);
    var updated = RoomBill(
      id: existing.id,
      roomId: room.id,
      room: room,
      roomName: room.name,
      billingMonth: computed.billingMonth,
      electricityOldReading: computed.electricityOldReading,
      electricityNewReading: computed.electricityNewReading,
      electricityUsed: computed.electricityUsed,
      waterOldReading: computed.waterOldReading,
      waterNewReading: computed.waterNewReading,
      waterUsed: computed.waterUsed,
      electricityAmount: computed.electricityAmount,
      waterAmount: computed.waterAmount,
      wifiFee: computed.wifiFee,
      trashFee: computed.trashFee,
      monthlyRent: computed.monthlyRent,
      otherFees: computed.otherFees,
      note: computed.note,
      totalAmount: computed.totalAmount,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now().toUtc().toIso8601String(),
    );

    final targetSheet = buildBillSheetName(room.name, updated.billingMonth);
    final sourceSheet = located.sheetName;

    if (targetSheet != sourceSheet) {
      final targetBills = await _loadBillsForSheet(targetSheet, room: room);
      if (targetBills.any(
        (b) => b.billingMonth == updated.billingMonth && b.id != id,
      )) {
        throw StateError('Bill already exists for month ${updated.billingMonth}');
      }
      await _client.ensureSheetWithHeaders(sheetName: targetSheet);
      await _client.append(sheetName: targetSheet, row: mapRoomBillToRow(updated));
      await _client.deleteRowById(sheetName: sourceSheet, id: id);
      resetTabCache();
    } else {
      await _client.updateById(
        sheetName: sourceSheet,
        id: id,
        row: mapRoomBillToRow(updated),
      );
    }

    return updated;
  }

  Future<void> deleteRoomBill(String id, String roomId) async {
    final room = await _rooms.getRoomById(roomId);
    final tabNames = await _loadTabNames();
    final located = await _findBillById(room, id, tabNames);
    if (located == null) throw StateError('Room bill not found');
    await _client.deleteRowById(sheetName: located.sheetName, id: id);
  }
}
