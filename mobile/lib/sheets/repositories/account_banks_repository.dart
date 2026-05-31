import 'package:uuid/uuid.dart';

import '../../config/sheet_columns.dart';
import '../../models/api_models.dart';
import '../mappers/account_bank_mapper.dart';
import '../sheets_client.dart';

class AccountBanksRepository {
  AccountBanksRepository(this._client);

  final SheetsClient _client;
  final _uuid = const Uuid();
  Future<void>? _bootstrapFuture;

  void resetBootstrap() => _bootstrapFuture = null;

  Future<void> _ensureBootstrap() {
    _bootstrapFuture ??=
        _client.ensureSheetWithHeaders(sheetName: accountBanksSheetName).then((_) {});
    return _bootstrapFuture!;
  }

  Future<List<AccountBank>> loadAll() async {
    await _ensureBootstrap();
    final response = await _client.read(sheetKey: 'accountBanks');
    return response.rows.map(mapRowToAccountBank).toList();
  }

  Future<AccountBank?> getDefault() async {
    final items = await loadAll();
    return items.where((i) => i.isDefault).firstOrNull;
  }

  Future<void> _clearDefaultFlags(List<AccountBank> items, {String? exceptId}) async {
    final now = DateTime.now().toUtc().toIso8601String();
    for (final item in items.where((i) => i.isDefault && i.id != exceptId)) {
      await _client.updateById(
        sheetKey: 'accountBanks',
        id: item.id,
        row: mapAccountBankToRow(
          AccountBank(
            id: item.id,
            customerCode: item.customerCode,
            customerName: item.customerName,
            bank: item.bank,
            accountNumber: item.accountNumber,
            isDefault: false,
            createdAt: item.createdAt,
            updatedAt: now,
          ),
        ),
      );
    }
  }

  Future<AccountBank> create({
    required String customerCode,
    required String customerName,
    required String bank,
    required String accountNumber,
    bool isDefault = false,
  }) async {
    await _ensureBootstrap();
    final now = DateTime.now().toUtc().toIso8601String();
    var account = AccountBank(
      id: _uuid.v4(),
      customerCode: customerCode,
      customerName: customerName,
      bank: bank,
      accountNumber: accountNumber,
      isDefault: isDefault,
      createdAt: now,
      updatedAt: now,
    );

    if (account.isDefault) {
      await _clearDefaultFlags(await loadAll());
    }

    await _client.append(
      sheetKey: 'accountBanks',
      row: mapAccountBankToRow(account),
    );
    return account;
  }

  Future<AccountBank> setDefault(String id) async {
    final items = await loadAll();
    final existing = items.where((i) => i.id == id).firstOrNull;
    if (existing == null) throw StateError('Account bank not found');

    await _clearDefaultFlags(items, exceptId: id);
    final updated = AccountBank(
      id: existing.id,
      customerCode: existing.customerCode,
      customerName: existing.customerName,
      bank: existing.bank,
      accountNumber: existing.accountNumber,
      isDefault: true,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now().toUtc().toIso8601String(),
    );

    await _client.updateById(
      sheetKey: 'accountBanks',
      id: id,
      row: mapAccountBankToRow(updated),
    );
    return updated;
  }

  Future<void> remove(String id) async {
    await _client.deleteRowById(sheetKey: 'accountBanks', id: id);
  }
}
