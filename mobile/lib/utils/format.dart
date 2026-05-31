import 'package:intl/intl.dart';

final _vndFormat = NumberFormat.currency(
  locale: 'vi_VN',
  symbol: '₫',
  decimalDigits: 0,
);

String formatCurrencyVnd(num value) => _vndFormat.format(value);

final _numberDots = NumberFormat('#,###', 'vi_VN');

/// Chỉ số: `100 → 145 (45)` — ngoặc chỉ là số tiêu thụ.
String formatMeterReadingLine({
  required double oldReading,
  required double newReading,
  required double used,
}) {
  final o = oldReading.toStringAsFixed(0);
  final n = newReading.toStringAsFixed(0);
  final u = used.toStringAsFixed(0);
  return '$o → $n ($u)';
}

/// Công thức tiền: `45 × 3.500 ₫ = 157.500 ₫`
String formatUsageAmountFormula({
  required double used,
  required double unitPrice,
  required double amount,
}) {
  final usedStr = used.toStringAsFixed(0);
  final unitStr = _numberDots.format(unitPrice);
  return '$usedStr × $unitStr ₫ = ${formatCurrencyVnd(amount)}';
}
