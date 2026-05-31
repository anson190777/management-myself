const _defaultTemplate = 'compact2';

String _normalizeAmount(num amount) {
  final numeric = amount.toDouble();
  if (numeric.isNaN || numeric < 0) return '0';
  return numeric.floor().toString();
}

String _toEncodedValue(String value) =>
    Uri.encodeComponent(value.trim());

String buildVietQrImageUrl({
  required String bankCode,
  required String accountNumber,
  String template = _defaultTemplate,
  num amount = 0,
  String addInfo = '',
  String accountName = '',
}) {
  if (bankCode.isEmpty || accountNumber.isEmpty) return '';

  final path =
      '${_toEncodedValue(bankCode)}-${_toEncodedValue(accountNumber)}-${_toEncodedValue(template)}.png';
  final query = {
    'amount': _normalizeAmount(amount),
    'addInfo': addInfo,
    'accountName': accountName,
  };
  return 'https://img.vietqr.io/image/$path?${query.entries.map((e) => '${Uri.encodeQueryComponent(e.key)}=${Uri.encodeQueryComponent(e.value)}').join('&')}';
}

String buildVietQrImageUrlFromAccountBank({
  required String? bank,
  required String? accountNumber,
  required String? customerName,
  num amount = 0,
  String addInfo = '',
  String template = _defaultTemplate,
}) =>
    buildVietQrImageUrl(
      bankCode: bank ?? '',
      accountNumber: accountNumber ?? '',
      template: template,
      amount: amount,
      addInfo: addInfo,
      accountName: customerName ?? '',
    );
