import '../config/google_config.dart';

enum SheetColumnType { string, number, boolean }

class SheetColumnMapping {
  const SheetColumnMapping({
    required this.key,
    required this.header,
    this.type = SheetColumnType.string,
  });

  final String key;
  final String header;
  final SheetColumnType type;
}

class SheetDefinition {
  const SheetDefinition({
    required this.id,
    required this.spreadsheetId,
    required this.sheetName,
    required this.columns,
    this.headerRow = 1,
  });

  final String id;
  final String spreadsheetId;
  final String sheetName;
  final int headerRow;
  final List<SheetColumnMapping> columns;
}

const roomsSheetName = 'rooms';
const accountBanksSheetName = 'account_banks';

const roomColumns = <SheetColumnMapping>[
  SheetColumnMapping(key: '_id', header: 'ID'),
  SheetColumnMapping(key: 'name', header: 'Tên phòng'),
  SheetColumnMapping(key: 'nameUser', header: 'Người thuê'),
  SheetColumnMapping(key: 'monthlyRent', header: 'Tiền thuê', type: SheetColumnType.number),
  SheetColumnMapping(
    key: 'electricityUnitPrice',
    header: 'Đơn giá điện',
    type: SheetColumnType.number,
  ),
  SheetColumnMapping(
    key: 'waterUnitPrice',
    header: 'Đơn giá nước',
    type: SheetColumnType.number,
  ),
  SheetColumnMapping(key: 'wifiFee', header: 'Phí wifi', type: SheetColumnType.number),
  SheetColumnMapping(key: 'trashFee', header: 'Phí rác', type: SheetColumnType.number),
  SheetColumnMapping(
    key: 'isActive',
    header: 'Đang hoạt động',
    type: SheetColumnType.boolean,
  ),
  SheetColumnMapping(key: 'createdAt', header: 'Ngày tạo'),
  SheetColumnMapping(key: 'updatedAt', header: 'Ngày cập nhật'),
  SheetColumnMapping(key: 'billSheetName', header: 'Sheet hóa đơn'),
];

const accountBankColumns = <SheetColumnMapping>[
  SheetColumnMapping(key: '_id', header: 'ID'),
  SheetColumnMapping(key: 'customerCode', header: 'Mã khách hàng'),
  SheetColumnMapping(key: 'customerName', header: 'Tên khách hàng'),
  SheetColumnMapping(key: 'bank', header: 'Ngân hàng'),
  SheetColumnMapping(key: 'accountNumber', header: 'Số tài khoản'),
  SheetColumnMapping(key: 'isDefault', header: 'Mặc định', type: SheetColumnType.boolean),
  SheetColumnMapping(key: 'createdAt', header: 'Ngày tạo'),
  SheetColumnMapping(key: 'updatedAt', header: 'Ngày cập nhật'),
];

const roomBillColumns = <SheetColumnMapping>[
  SheetColumnMapping(key: '_id', header: 'ID'),
  SheetColumnMapping(key: 'roomId', header: 'Room ID'),
  SheetColumnMapping(key: 'roomName', header: 'Tên phòng'),
  SheetColumnMapping(key: 'billingMonth', header: 'Tháng'),
  SheetColumnMapping(key: 'electricityOldReading', header: 'Điện cũ', type: SheetColumnType.number),
  SheetColumnMapping(key: 'electricityNewReading', header: 'Điện mới', type: SheetColumnType.number),
  SheetColumnMapping(key: 'electricityUsed', header: 'Điện dùng', type: SheetColumnType.number),
  SheetColumnMapping(key: 'waterOldReading', header: 'Nước cũ', type: SheetColumnType.number),
  SheetColumnMapping(key: 'waterNewReading', header: 'Nước mới', type: SheetColumnType.number),
  SheetColumnMapping(key: 'waterUsed', header: 'Nước dùng', type: SheetColumnType.number),
  SheetColumnMapping(key: 'electricityAmount', header: 'Tiền điện', type: SheetColumnType.number),
  SheetColumnMapping(key: 'waterAmount', header: 'Tiền nước', type: SheetColumnType.number),
  SheetColumnMapping(key: 'wifiFee', header: 'Phí wifi', type: SheetColumnType.number),
  SheetColumnMapping(key: 'trashFee', header: 'Phí rác', type: SheetColumnType.number),
  SheetColumnMapping(key: 'monthlyRent', header: 'Tiền thuê', type: SheetColumnType.number),
  SheetColumnMapping(key: 'otherFees', header: 'Phí khác'),
  SheetColumnMapping(key: 'note', header: 'Ghi chú'),
  SheetColumnMapping(key: 'totalAmount', header: 'Tổng tiền', type: SheetColumnType.number),
  SheetColumnMapping(key: 'createdAt', header: 'Ngày tạo'),
  SheetColumnMapping(key: 'updatedAt', header: 'Ngày cập nhật'),
];

final roomsSheetDefinition = SheetDefinition(
  id: 'rooms',
  spreadsheetId: GoogleConfig.spreadsheetId,
  sheetName: roomsSheetName,
  columns: roomColumns,
);

final accountBanksSheetDefinition = SheetDefinition(
  id: 'accountBanks',
  spreadsheetId: GoogleConfig.spreadsheetId,
  sheetName: accountBanksSheetName,
  columns: accountBankColumns,
);

SheetDefinition roomBillSheetDefinition(String sheetName) => SheetDefinition(
      id: sheetName,
      spreadsheetId: GoogleConfig.spreadsheetId,
      sheetName: sheetName,
      columns: roomBillColumns,
    );

SheetDefinition? sheetDefinitionForKey(String sheetKey) {
  switch (sheetKey) {
    case 'rooms':
      return roomsSheetDefinition;
    case 'accountBanks':
      return accountBanksSheetDefinition;
    default:
      return null;
  }
}

SheetDefinition resolveSheetDefinition({String? sheetKey, String? sheetName}) {
  if (sheetKey != null) {
    final fromKey = sheetDefinitionForKey(sheetKey);
    if (fromKey != null) return fromKey;
  }
  if (sheetName != null) {
    if (sheetName == roomsSheetName) return roomsSheetDefinition;
    if (sheetName == accountBanksSheetName) return accountBanksSheetDefinition;
    return roomBillSheetDefinition(sheetName);
  }
  throw StateError('Missing sheetKey or sheetName');
}
