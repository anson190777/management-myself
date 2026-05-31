import '../../models/api_models.dart';

Room mapRowToRoom(Map<String, Object?> row) {
  final isActiveRaw = row['isActive'];
  final isActive = isActiveRaw == true ||
      isActiveRaw == 'TRUE' ||
      isActiveRaw == 'true' ||
      isActiveRaw == 1;

  return Room(
    id: row['_id']?.toString() ?? '',
    name: row['name']?.toString() ?? '',
    nameUser: row['nameUser']?.toString() ?? '',
    monthlyRent: (row['monthlyRent'] as num?)?.toDouble() ?? 0,
    electricityUnitPrice: (row['electricityUnitPrice'] as num?)?.toDouble() ?? 0,
    waterUnitPrice: (row['waterUnitPrice'] as num?)?.toDouble() ?? 0,
    wifiFee: (row['wifiFee'] as num?)?.toDouble() ?? 0,
    trashFee: (row['trashFee'] as num?)?.toDouble() ?? 0,
    isActive: isActive,
    createdAt: row['createdAt']?.toString(),
    updatedAt: row['updatedAt']?.toString(),
    billSheetName: row['billSheetName']?.toString(),
  );
}

Map<String, Object?> mapRoomToRow(Room room) => {
      '_id': room.id,
      'name': room.name,
      'nameUser': room.nameUser,
      'monthlyRent': room.monthlyRent,
      'electricityUnitPrice': room.electricityUnitPrice,
      'waterUnitPrice': room.waterUnitPrice,
      'wifiFee': room.wifiFee,
      'trashFee': room.trashFee,
      'isActive': room.isActive,
      'createdAt': room.createdAt,
      'updatedAt': room.updatedAt,
      'billSheetName': room.billSheetName,
    };
