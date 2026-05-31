import '../../models/api_models.dart';

AccountBank mapRowToAccountBank(Map<String, Object?> row) {
  final isDefaultRaw = row['isDefault'];
  final isDefault = isDefaultRaw == true ||
      isDefaultRaw == 'TRUE' ||
      isDefaultRaw == 'true' ||
      isDefaultRaw == 1;

  return AccountBank(
    id: row['_id']?.toString() ?? '',
    customerCode: row['customerCode']?.toString() ?? '',
    customerName: row['customerName']?.toString() ?? '',
    bank: row['bank']?.toString() ?? '',
    accountNumber: row['accountNumber']?.toString() ?? '',
    isDefault: isDefault,
    createdAt: row['createdAt']?.toString(),
    updatedAt: row['updatedAt']?.toString(),
  );
}

Map<String, Object?> mapAccountBankToRow(AccountBank bank) => {
      '_id': bank.id,
      'customerCode': bank.customerCode,
      'customerName': bank.customerName,
      'bank': bank.bank,
      'accountNumber': bank.accountNumber,
      'isDefault': bank.isDefault,
      'createdAt': bank.createdAt,
      'updatedAt': bank.updatedAt,
    };
