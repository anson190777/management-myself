import 'dart:convert';

import 'package:googleapis/sheets/v4.dart';
import 'package:googleapis_auth/googleapis_auth.dart' as auth;
import 'package:http/http.dart' as http;

import '../auth/google_auth_service.dart';
import '../config/google_config.dart';
import '../config/sheet_columns.dart';

class SheetsReadResponse {
  const SheetsReadResponse({
    required this.sheetKey,
    required this.sheetName,
    required this.headers,
    required this.rows,
  });

  final String sheetKey;
  final String sheetName;
  final List<String> headers;
  final List<Map<String, Object?>> rows;
}

class SheetsClient {
  SheetsClient({Future<String?> Function()? getAccessToken})
      : _getAccessToken =
            getAccessToken ?? GoogleAuthService.instance.getAccessToken;

  final Future<String?> Function() _getAccessToken;
  http.Client? _httpClient;

  String escapeSheetName(String sheetName) =>
      "'${sheetName.replaceAll("'", "''")}'";

  Future<SheetsApi> _api() async {
    final token = await _getAccessToken();
    if (token == null || token.isEmpty) {
      throw StateError('Chưa đăng nhập Google — không có access token');
    }
    _httpClient ??= http.Client();
    final credentials = auth.AccessCredentials(
      auth.AccessToken(
        'Bearer',
        token,
        DateTime.now().toUtc().add(const Duration(hours: 1)),
      ),
      null,
      GoogleConfig.scopes,
    );
    final client = auth.authenticatedClient(_httpClient!, credentials);
    return SheetsApi(client);
  }

  void dispose() {
    _httpClient?.close();
    _httpClient = null;
  }

  static String columnIndexToLetter(int index) {
    var n = index + 1;
    final chars = <int>[];
    while (n > 0) {
      final rem = (n - 1) % 26;
      chars.insert(0, 65 + rem);
      n = (n - 1) ~/ 26;
    }
    return String.fromCharCodes(chars);
  }

  static Object? parseCellValue(String raw, SheetColumnType type) {
    final value = raw.trim();
    switch (type) {
      case SheetColumnType.number:
        final num = double.tryParse(value.replaceAll(',', ''));
        return num?.isFinite == true ? num : 0;
      case SheetColumnType.boolean:
        final lower = value.toLowerCase();
        return lower == 'true' || lower == '1' || lower == 'yes';
      case SheetColumnType.string:
        return value;
    }
  }

  static List<String> rowToValues(
    Map<String, Object?> row,
    List<SheetColumnMapping> columns,
  ) =>
      columns.map((column) {
        final raw = row[column.key];
        if (raw == null) return '';
        if (raw is bool) return raw ? 'TRUE' : 'FALSE';
        if (raw is Map || raw is List) return jsonEncode(raw);
        return raw.toString();
      }).toList();

  static List<Map<String, Object?>> mapRowsFromValues(
    List<List<Object?>> values,
    SheetDefinition definition,
  ) {
    final headerRow = definition.headerRow;
    if (values.length <= headerRow) return [];

    return values
        .skip(headerRow)
        .where((cells) => cells.any((c) => c?.toString().trim().isNotEmpty == true))
        .map((cells) {
      final record = <String, Object?>{};
      for (var i = 0; i < definition.columns.length; i++) {
        final column = definition.columns[i];
        record[column.key] = parseCellValue(
          cells.length > i ? cells[i]?.toString() ?? '' : '',
          column.type,
        );
      }
      return record;
    }).toList();
  }

  Future<SheetsReadResponse> read({
    String? sheetKey,
    String? sheetName,
  }) async {
    final definition = resolveSheetDefinition(sheetKey: sheetKey, sheetName: sheetName);
    final sheets = await _api();
    final tab = escapeSheetName(definition.sheetName);

    final response = await sheets.spreadsheets.values.get(
      definition.spreadsheetId,
      '$tab!A:Z',
    );

    final values = response.values ?? [];
    final rows = mapRowsFromValues(values, definition);

    return SheetsReadResponse(
      sheetKey: sheetKey ?? definition.id,
      sheetName: definition.sheetName,
      headers: definition.columns.map((c) => c.header).toList(),
      rows: rows,
    );
  }

  Future<int?> _findRowIndexById(
    SheetsApi sheets,
    String spreadsheetId,
    String sheetName,
    String id,
  ) async {
    final tab = escapeSheetName(sheetName);
    final response = await sheets.spreadsheets.values.get(
      spreadsheetId,
      '$tab!A:A',
    );
    final values = response.values ?? [];
    for (var i = 1; i < values.length; i++) {
      if (values[i].isNotEmpty && values[i][0]?.toString().trim() == id) {
        return i + 1;
      }
    }
    return null;
  }

  Future<int?> _getSheetIdByName(
    SheetsApi sheets,
    String spreadsheetId,
    String sheetName,
  ) async {
    final meta = await sheets.spreadsheets.get(spreadsheetId);
    for (final sheet in meta.sheets ?? []) {
      if (sheet.properties?.title == sheetName) {
        return sheet.properties?.sheetId;
      }
    }
    return null;
  }

  Future<int> append({
    String? sheetKey,
    String? sheetName,
    required Map<String, Object?> row,
  }) async {
    final definition = resolveSheetDefinition(sheetKey: sheetKey, sheetName: sheetName);
    final sheets = await _api();
    final tab = escapeSheetName(definition.sheetName);
    final values = [rowToValues(row, definition.columns)];

    final response = await sheets.spreadsheets.values.append(
      ValueRange(values: values),
      definition.spreadsheetId,
      '$tab!A:A',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
    );

    final updatedRange = response.updates?.updatedRange ?? '';
    final match = RegExp(r'!A(\d+)').firstMatch(updatedRange);
    return match != null ? int.tryParse(match.group(1)!) ?? 0 : 0;
  }

  Future<void> updateById({
    String? sheetKey,
    String? sheetName,
    required String id,
    required Map<String, Object?> row,
  }) async {
    final definition = resolveSheetDefinition(sheetKey: sheetKey, sheetName: sheetName);
    final sheets = await _api();
    final rowIndex = await _findRowIndexById(
      sheets,
      definition.spreadsheetId,
      definition.sheetName,
      id,
    );
    if (rowIndex == null) {
      throw StateError('Row not found for id: $id');
    }

    final lastCol = columnIndexToLetter(definition.columns.length - 1);
    final tab = escapeSheetName(definition.sheetName);
    final values = [rowToValues(row, definition.columns)];

    await sheets.spreadsheets.values.update(
      ValueRange(values: values),
      definition.spreadsheetId,
      '$tab!A$rowIndex:$lastCol$rowIndex',
      valueInputOption: 'RAW',
    );
  }

  Future<void> deleteRowById({
    String? sheetKey,
    String? sheetName,
    required String id,
  }) async {
    final definition = resolveSheetDefinition(sheetKey: sheetKey, sheetName: sheetName);
    final sheets = await _api();
    final rowIndex = await _findRowIndexById(
      sheets,
      definition.spreadsheetId,
      definition.sheetName,
      id,
    );
    if (rowIndex == null) {
      throw StateError('Row not found for id: $id');
    }

    final sheetId = await _getSheetIdByName(
      sheets,
      definition.spreadsheetId,
      definition.sheetName,
    );
    if (sheetId == null) {
      throw StateError('Sheet not found: ${definition.sheetName}');
    }

    await sheets.spreadsheets.batchUpdate(
      BatchUpdateSpreadsheetRequest(
        requests: [
          Request(
            deleteDimension: DeleteDimensionRequest(
              range: DimensionRange(
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              ),
            ),
          ),
        ],
      ),
      definition.spreadsheetId,
    );
  }

  Future<bool> ensureSheetWithHeaders({
    required String sheetName,
    List<SheetColumnMapping>? columns,
  }) async {
    final cols = columns ??
        (sheetName == roomsSheetName
            ? roomColumns
            : sheetName == accountBanksSheetName
                ? accountBankColumns
                : roomBillColumns);

    final sheets = await _api();
    final spreadsheetId = GoogleConfig.spreadsheetId;
    var sheetId = await _getSheetIdByName(sheets, spreadsheetId, sheetName);
    final created = sheetId == null;

    if (sheetId == null) {
      await sheets.spreadsheets.batchUpdate(
        BatchUpdateSpreadsheetRequest(
          requests: [
            Request(addSheet: AddSheetRequest(properties: SheetProperties(title: sheetName))),
          ],
        ),
        spreadsheetId,
      );
    }

    final tab = escapeSheetName(sheetName);
    final headerResponse = await sheets.spreadsheets.values.get(
      spreadsheetId,
      '$tab!A1:1',
    );
    final hasHeader = headerResponse.values?.firstOrNull?.isNotEmpty == true;
    final expectedHeaders = cols.map((c) => c.header).toList();
    final currentHeaders =
        headerResponse.values?.firstOrNull?.map((e) => e.toString()).toList() ?? [];

    if (!hasHeader) {
      await sheets.spreadsheets.values.update(
        ValueRange(values: [expectedHeaders]),
        spreadsheetId,
        '$tab!A1',
        valueInputOption: 'RAW',
      );
    } else if (currentHeaders.length < expectedHeaders.length) {
      final lastCol = columnIndexToLetter(expectedHeaders.length - 1);
      await sheets.spreadsheets.values.update(
        ValueRange(values: [expectedHeaders]),
        spreadsheetId,
        '$tab!A1:${lastCol}1',
        valueInputOption: 'RAW',
      );
    }

    return created;
  }

  Future<void> deleteSheetTab(String sheetName) async {
    final sheets = await _api();
    final spreadsheetId = GoogleConfig.spreadsheetId;
    final sheetId = await _getSheetIdByName(sheets, spreadsheetId, sheetName);
    if (sheetId == null) return;

    await sheets.spreadsheets.batchUpdate(
      BatchUpdateSpreadsheetRequest(
        requests: [Request(deleteSheet: DeleteSheetRequest(sheetId: sheetId))],
      ),
      spreadsheetId,
    );
  }

  Future<List<String>> listTabs() async {
    final sheets = await _api();
    final meta = await sheets.spreadsheets.get(GoogleConfig.spreadsheetId);
    return meta.sheets
            ?.map((s) => s.properties?.title)
            .whereType<String>()
            .toList() ??
        [];
  }

  Future<({bool roomsSheetReady, bool created})> bootstrap() async {
    final created = await ensureSheetWithHeaders(
      sheetName: roomsSheetName,
      columns: roomColumns,
    );
    return (roomsSheetReady: true, created: created);
  }
}
