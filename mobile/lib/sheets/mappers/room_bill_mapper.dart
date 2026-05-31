import 'dart:convert';

import '../../models/api_models.dart';

List<OtherFee> parseOtherFees(Object? raw) {
  if (raw == null) return [];
  if (raw is List) {
    return raw
        .whereType<Map>()
        .map((e) => OtherFee.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
  final text = raw.toString().trim();
  if (text.isEmpty) return [];
  try {
    final parsed = jsonDecode(text);
    if (parsed is List) {
      return parsed
          .whereType<Map>()
          .map((e) => OtherFee.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
  } catch (_) {}
  return [];
}

RoomBill mapRowToRoomBill(Map<String, Object?> row, {Room? room}) {
  final roomId = row['roomId']?.toString() ?? '';
  return RoomBill(
    id: row['_id']?.toString() ?? '',
    roomId: room?.id ?? roomId,
    room: room,
    roomName: row['roomName']?.toString() ?? room?.name,
    billingMonth: row['billingMonth']?.toString() ?? '',
    electricityOldReading: (row['electricityOldReading'] as num?)?.toDouble() ?? 0,
    electricityNewReading: (row['electricityNewReading'] as num?)?.toDouble() ?? 0,
    electricityUsed: (row['electricityUsed'] as num?)?.toDouble() ?? 0,
    waterOldReading: (row['waterOldReading'] as num?)?.toDouble() ?? 0,
    waterNewReading: (row['waterNewReading'] as num?)?.toDouble() ?? 0,
    waterUsed: (row['waterUsed'] as num?)?.toDouble() ?? 0,
    electricityAmount: (row['electricityAmount'] as num?)?.toDouble() ?? 0,
    waterAmount: (row['waterAmount'] as num?)?.toDouble() ?? 0,
    wifiFee: (row['wifiFee'] as num?)?.toDouble() ?? 0,
    trashFee: (row['trashFee'] as num?)?.toDouble() ?? 0,
    monthlyRent: (row['monthlyRent'] as num?)?.toDouble() ?? 0,
    otherFees: parseOtherFees(row['otherFees']),
    note: row['note']?.toString(),
    totalAmount: (row['totalAmount'] as num?)?.toDouble() ?? 0,
    createdAt: row['createdAt']?.toString(),
    updatedAt: row['updatedAt']?.toString(),
  );
}

Map<String, Object?> mapRoomBillToRow(RoomBill bill) {
  final room = bill.room;
  final roomId = room?.id ?? bill.roomId;
  final roomName = bill.roomName ?? room?.name ?? '';

  return {
    '_id': bill.id,
    'roomId': roomId,
    'roomName': roomName,
    'billingMonth': bill.billingMonth,
    'electricityOldReading': bill.electricityOldReading,
    'electricityNewReading': bill.electricityNewReading,
    'electricityUsed': bill.electricityUsed,
    'waterOldReading': bill.waterOldReading,
    'waterNewReading': bill.waterNewReading,
    'waterUsed': bill.waterUsed,
    'electricityAmount': bill.electricityAmount,
    'waterAmount': bill.waterAmount,
    'wifiFee': bill.wifiFee,
    'trashFee': bill.trashFee,
    'monthlyRent': bill.monthlyRent,
    'otherFees': jsonEncode(bill.otherFees.map((e) => e.toJson()).toList()),
    'note': bill.note ?? '',
    'totalAmount': bill.totalAmount,
    'createdAt': bill.createdAt,
    'updatedAt': bill.updatedAt,
  };
}
