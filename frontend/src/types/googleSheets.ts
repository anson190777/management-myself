export type SheetColumnType = 'string' | 'number' | 'date' | 'boolean';

export interface SheetColumnMapping {
  key: string;
  header: string;
  type?: SheetColumnType;
}

export interface GoogleSheetDefinition {
  id: string;
  spreadsheetId: string;
  sheetName: string;
  headerRow?: number;
  columns: SheetColumnMapping[];
}

export interface OAuthTokenRow {
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  updatedAt: string;
}

export interface GoogleOAuthStatus {
  connected: boolean;
  email?: string;
}

export interface GoogleSheetsReadResponse {
  sheetKey: string;
  sheetName: string;
  headers: string[];
  rows: Record<string, string | number | boolean>[];
}
