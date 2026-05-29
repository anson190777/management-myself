import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getRoomBillSheetDefinition,
  getSheetDefinition,
  googleSheetsConfig,
  ROOM_BILL_COLUMNS,
  ROOM_COLUMNS,
  ROOMS_SHEET_NAME,
  type GoogleSheetKey,
} from '../../config/googleSheets.config';
import type {
  GoogleSheetDefinition,
  GoogleSheetsReadResponse,
  OAuthTokenRow,
  SheetColumnMapping,
} from '../../types/googleSheets';
import { getGoogleServerEnv } from './env';
import { authClientFromTokenRow } from './oauth';
import { getAuthenticatedClient } from './sessionTokens';

type SheetsApi = ReturnType<typeof google.sheets>;

export const escapeSheetName = (sheetName: string) =>
  `'${sheetName.replace(/'/g, "''")}'`;

const columnIndexToLetter = (index: number): string => {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};

const parseCellValue = (
  raw: string,
  type: SheetColumnMapping['type'] = 'string',
): string | number | boolean => {
  const value = String(raw ?? '').trim();
  if (type === 'number') {
    const num = Number(value.replace(/,/g, ''));
    return Number.isFinite(num) ? num : 0;
  }
  if (type === 'boolean') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return value;
};

const rowToValues = (
  row: Record<string, unknown>,
  columns: SheetColumnMapping[],
): string[] =>
  columns.map((column) => {
    const raw = row[column.key];
    if (raw === undefined || raw === null) {
      return '';
    }
    if (typeof raw === 'boolean') {
      return raw ? 'TRUE' : 'FALSE';
    }
    if (typeof raw === 'object') {
      return JSON.stringify(raw);
    }
    return String(raw);
  });

export const mapRowsFromValues = (
  values: string[][],
  definition: GoogleSheetDefinition,
): Record<string, string | number | boolean>[] => {
  const headerRow = definition.headerRow ?? 1;
  if (values.length <= headerRow) {
    return [];
  }

  const dataRows = values.slice(headerRow);
  return dataRows
    .filter((cells) => cells.some((cell) => String(cell ?? '').trim()))
    .map((cells) => {
      const record: Record<string, string | number | boolean> = {};
      definition.columns.forEach((column, index) => {
        record[column.key] = parseCellValue(
          String(cells[index] ?? ''),
          column.type,
        );
      });
      return record;
    });
};

const resolveDefinition = (
  sheetKey?: string,
  sheetName?: string,
): GoogleSheetDefinition => {
  if (sheetKey) {
    const fromKey = getSheetDefinition(sheetKey);
    if (fromKey) {
      return fromKey;
    }
  }
  if (sheetName) {
    if (sheetName === ROOMS_SHEET_NAME) {
      return googleSheetsConfig.sheets.rooms;
    }
    return getRoomBillSheetDefinition(sheetName);
  }
  throw new Error('Missing sheetKey or sheetName');
};

const getSheetsApi = async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = await getAuthenticatedClient(req, res);
  return google.sheets({ version: 'v4', auth });
};

export const readSheet = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: { sheetKey?: string; sheetName?: string },
): Promise<GoogleSheetsReadResponse> => {
  const definition = resolveDefinition(options.sheetKey, options.sheetName);
  const sheets = await getSheetsApi(req, res);
  const sheetTab = escapeSheetName(definition.sheetName);
  const headerRow = definition.headerRow ?? 1;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: definition.spreadsheetId,
    range: `${sheetTab}!A:Z`,
  });

  const values = (response.data.values ?? []) as string[][];
  const rows = mapRowsFromValues(values, definition);

  return {
    sheetKey: options.sheetKey ?? definition.id,
    sheetName: definition.sheetName,
    headers: definition.columns.map((column) => column.header),
    rows: rows as Record<string, string>[],
  };
};

export const readSheetByKey = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetKey: string,
): Promise<GoogleSheetsReadResponse> => readSheet(req, res, { sheetKey });

const findRowIndexById = async (
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string,
  id: string,
): Promise<number | null> => {
  const sheetTab = escapeSheetName(sheetName);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTab}!A:A`,
  });
  const values = response.data.values ?? [];
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i]?.[0] ?? '').trim() === id) {
      return i + 1;
    }
  }
  return null;
};

const getSheetIdByName = async (
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string,
): Promise<number | null> => {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((item) => item.properties?.title === sheetName);
  return sheet?.properties?.sheetId ?? null;
};

export const appendRow = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    sheetKey?: string;
    sheetName?: string;
    row: Record<string, unknown>;
  },
): Promise<{ rowNumber: number }> => {
  const definition = resolveDefinition(options.sheetKey, options.sheetName);
  const sheets = await getSheetsApi(req, res);
  const sheetTab = escapeSheetName(definition.sheetName);
  const values = [rowToValues(options.row, definition.columns)];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: definition.spreadsheetId,
    range: `${sheetTab}!A:A`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });

  const updatedRange = response.data.updates?.updatedRange ?? '';
  const match = updatedRange.match(/!A(\d+)/);
  const rowNumber = match ? Number(match[1]) : 0;
  return { rowNumber };
};

export const updateRowById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    sheetKey?: string;
    sheetName?: string;
    id: string;
    row: Record<string, unknown>;
  },
): Promise<void> => {
  const definition = resolveDefinition(options.sheetKey, options.sheetName);
  const sheets = await getSheetsApi(req, res);
  const rowIndex = await findRowIndexById(
    sheets,
    definition.spreadsheetId,
    definition.sheetName,
    options.id,
  );
  if (!rowIndex) {
    throw new Error(`Row not found for id: ${options.id}`);
  }

  const lastCol = columnIndexToLetter(definition.columns.length - 1);
  const sheetTab = escapeSheetName(definition.sheetName);
  const values = [rowToValues(options.row, definition.columns)];

  await sheets.spreadsheets.values.update({
    spreadsheetId: definition.spreadsheetId,
    range: `${sheetTab}!A${rowIndex}:${lastCol}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};

export const deleteRowById = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    sheetKey?: string;
    sheetName?: string;
    id: string;
  },
): Promise<void> => {
  const definition = resolveDefinition(options.sheetKey, options.sheetName);
  const sheets = await getSheetsApi(req, res);
  const rowIndex = await findRowIndexById(
    sheets,
    definition.spreadsheetId,
    definition.sheetName,
    options.id,
  );
  if (!rowIndex) {
    throw new Error(`Row not found for id: ${options.id}`);
  }

  const sheetId = await getSheetIdByName(
    sheets,
    definition.spreadsheetId,
    definition.sheetName,
  );
  if (sheetId === null) {
    throw new Error(`Sheet not found: ${definition.sheetName}`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: definition.spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
};

const ensureSheetWithHeadersOnApi = async (
  sheets: SheetsApi,
  spreadsheetId: string,
  options: {
    sheetName: string;
    columns?: SheetColumnMapping[];
  },
): Promise<{ created: boolean }> => {
  const columns =
    options.columns ??
    (options.sheetName === ROOMS_SHEET_NAME ? ROOM_COLUMNS : ROOM_BILL_COLUMNS);
  const sheetId = await getSheetIdByName(sheets, spreadsheetId, options.sheetName);

  if (sheetId === null) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: options.sheetName } } }],
      },
    });
  }

  const sheetTab = escapeSheetName(options.sheetName);
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTab}!A1:1`,
  });

  const hasHeader = Boolean(headerResponse.data.values?.[0]?.length);
  if (!hasHeader) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTab}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [columns.map((column) => column.header)],
      },
    });
  }

  return { created: sheetId === null };
};

export const ensureSheetWithHeaders = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    sheetName: string;
    columns?: SheetColumnMapping[];
  },
): Promise<{ created: boolean }> => {
  const env = getGoogleServerEnv();
  const sheets = await getSheetsApi(req, res);
  return ensureSheetWithHeadersOnApi(sheets, env.dataSpreadsheetId, options);
};

export const deleteSheetTab = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sheetName: string,
): Promise<void> => {
  const env = getGoogleServerEnv();
  const sheets = await getSheetsApi(req, res);
  const sheetId = await getSheetIdByName(sheets, env.dataSpreadsheetId, sheetName);
  if (sheetId === null) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: env.dataSpreadsheetId,
    requestBody: {
      requests: [{ deleteSheet: { sheetId } }],
    },
  });
};

export const bootstrapDataSpreadsheetWithRow = async (
  row: OAuthTokenRow,
): Promise<{ roomsSheetReady: boolean; created: boolean }> => {
  const env = getGoogleServerEnv();
  const auth = authClientFromTokenRow(row);
  const sheets = google.sheets({ version: 'v4', auth });
  const result = await ensureSheetWithHeadersOnApi(sheets, env.dataSpreadsheetId, {
    sheetName: ROOMS_SHEET_NAME,
    columns: ROOM_COLUMNS,
  });
  return { roomsSheetReady: true, created: result.created };
};

export const bootstrapDataSpreadsheet = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<{ roomsSheetReady: boolean; created: boolean }> => {
  const result = await ensureSheetWithHeaders(req, res, {
    sheetName: ROOMS_SHEET_NAME,
    columns: ROOM_COLUMNS,
  });
  return { roomsSheetReady: true, created: result.created };
};

export const isGoogleSheetKey = (value: string): value is GoogleSheetKey =>
  value === 'rooms';
