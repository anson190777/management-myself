final _invalidSheetChars = RegExp(r'[\\/?*[\]:]');
final _billSheetYearSuffix = RegExp(r'_\d{4}$');

String sanitizeRoomNameForSheet(String roomName) {
  var cleaned = roomName
      .trim()
      .replaceAll(_invalidSheetChars, '_')
      .replaceAll(RegExp(r'\s+'), '_')
      .replaceAll(RegExp(r'_+'), '_')
      .replaceAll(RegExp(r'^_|_$'), '');

  final base = cleaned.isEmpty ? 'room' : cleaned;
  return base.length > 75 ? base.substring(0, 75) : base;
}

String extractBillingYear(String billingMonth) {
  final match = RegExp(r'^(\d{4})-\d{2}$').firstMatch(billingMonth);
  if (match == null) {
    throw ArgumentError('Invalid billingMonth: $billingMonth');
  }
  return match.group(1)!;
}

String buildBillSheetName(String roomName, String billingMonthOrYear) {
  final year = billingMonthOrYear.contains('-')
      ? extractBillingYear(billingMonthOrYear)
      : billingMonthOrYear.trim();
  return 'bill_${sanitizeRoomNameForSheet(roomName)}_$year';
}

String buildLegacyBillSheetName(String roomName) =>
    'bill_${sanitizeRoomNameForSheet(roomName)}';

String buildBillSheetPrefix(String roomName) =>
    '${buildLegacyBillSheetName(roomName)}_';

bool isBillSheetForRoom(String sheetName, String roomName) {
  if (sheetName == buildLegacyBillSheetName(roomName)) return true;
  final prefix = buildBillSheetPrefix(roomName);
  return sheetName.startsWith(prefix) && _billSheetYearSuffix.hasMatch(sheetName);
}

bool isLegacyBillSheetTab(String sheetName) {
  if (!sheetName.startsWith('bill_') || sheetName == 'account_banks') {
    return false;
  }
  return !_billSheetYearSuffix.hasMatch(sheetName);
}

bool isRoomBillSheetTab(String sheetName) {
  if (!sheetName.startsWith('bill_')) return false;
  if (sheetName == 'account_banks') return false;
  return _billSheetYearSuffix.hasMatch(sheetName) || isLegacyBillSheetTab(sheetName);
}
