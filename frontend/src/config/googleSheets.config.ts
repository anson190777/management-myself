import type { GoogleSheetDefinition, SheetColumnMapping } from '../types/googleSheets';

export const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
] as const;

export const GOOGLE_DATA_SPREADSHEET_ID =
  process.env.GOOGLE_DATA_SPREADSHEET_ID ??
  process.env.NEXT_PUBLIC_GOOGLE_DATA_SPREADSHEET_ID ??
  process.env.GOOGLE_TOKEN_REGISTRY_SPREADSHEET_ID ??
  process.env.NEXT_PUBLIC_GOOGLE_TOKEN_REGISTRY_SPREADSHEET_ID ??
  '1JRTw0JdfMroakOY9B-J3B88WdMaNLTRYrWxC0u5zSvo';

export const GOOGLE_DATA_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_DATA_SPREADSHEET_ID}/edit`;

export const ROOMS_SHEET_NAME = 'rooms';

export const ROOM_COLUMNS: SheetColumnMapping[] = [
  { key: '_id', header: 'ID', type: 'string' },
  { key: 'name', header: 'Tên phòng', type: 'string' },
  { key: 'nameUser', header: 'Người thuê', type: 'string' },
  { key: 'monthlyRent', header: 'Tiền thuê', type: 'number' },
  { key: 'electricityUnitPrice', header: 'Đơn giá điện', type: 'number' },
  { key: 'waterUnitPrice', header: 'Đơn giá nước', type: 'number' },
  { key: 'wifiFee', header: 'Phí wifi', type: 'number' },
  { key: 'trashFee', header: 'Phí rác', type: 'number' },
  { key: 'isActive', header: 'Đang hoạt động', type: 'boolean' },
  { key: 'createdAt', header: 'Ngày tạo', type: 'string' },
  { key: 'updatedAt', header: 'Ngày cập nhật', type: 'string' },
  { key: 'billSheetName', header: 'Sheet hóa đơn', type: 'string' },
];

export const ACCOUNT_BANKS_SHEET_NAME = 'account_banks';

export const ACCOUNT_BANK_COLUMNS: SheetColumnMapping[] = [
  { key: '_id', header: 'ID', type: 'string' },
  { key: 'customerCode', header: 'Mã khách hàng', type: 'string' },
  { key: 'customerName', header: 'Tên khách hàng', type: 'string' },
  { key: 'bank', header: 'Ngân hàng', type: 'string' },
  { key: 'accountNumber', header: 'Số tài khoản', type: 'string' },
  { key: 'isDefault', header: 'Mặc định', type: 'boolean' },
  { key: 'createdAt', header: 'Ngày tạo', type: 'string' },
  { key: 'updatedAt', header: 'Ngày cập nhật', type: 'string' },
];

export const ROOM_BILL_COLUMNS: SheetColumnMapping[] = [
  { key: '_id', header: 'ID', type: 'string' },
  { key: 'roomId', header: 'Room ID', type: 'string' },
  { key: 'roomName', header: 'Tên phòng', type: 'string' },
  { key: 'billingMonth', header: 'Tháng', type: 'string' },
  { key: 'electricityOldReading', header: 'Điện cũ', type: 'number' },
  { key: 'electricityNewReading', header: 'Điện mới', type: 'number' },
  { key: 'electricityUsed', header: 'Điện dùng', type: 'number' },
  { key: 'waterOldReading', header: 'Nước cũ', type: 'number' },
  { key: 'waterNewReading', header: 'Nước mới', type: 'number' },
  { key: 'waterUsed', header: 'Nước dùng', type: 'number' },
  { key: 'electricityAmount', header: 'Tiền điện', type: 'number' },
  { key: 'waterAmount', header: 'Tiền nước', type: 'number' },
  { key: 'wifiFee', header: 'Phí wifi', type: 'number' },
  { key: 'trashFee', header: 'Phí rác', type: 'number' },
  { key: 'monthlyRent', header: 'Tiền thuê', type: 'number' },
  { key: 'otherFees', header: 'Phí khác', type: 'string' },
  { key: 'note', header: 'Ghi chú', type: 'string' },
  { key: 'totalAmount', header: 'Tổng tiền', type: 'number' },
  { key: 'createdAt', header: 'Ngày tạo', type: 'string' },
  { key: 'updatedAt', header: 'Ngày cập nhật', type: 'string' },
];

export const googleSheetsConfig = {
  dataSpreadsheetId: GOOGLE_DATA_SPREADSHEET_ID,
  sheets: {
    rooms: {
      id: 'rooms',
      spreadsheetId: GOOGLE_DATA_SPREADSHEET_ID,
      sheetName: ROOMS_SHEET_NAME,
      headerRow: 1,
      columns: ROOM_COLUMNS,
    } satisfies GoogleSheetDefinition,
    accountBanks: {
      id: 'accountBanks',
      spreadsheetId: GOOGLE_DATA_SPREADSHEET_ID,
      sheetName: ACCOUNT_BANKS_SHEET_NAME,
      headerRow: 1,
      columns: ACCOUNT_BANK_COLUMNS,
    } satisfies GoogleSheetDefinition,
  },
} as const;

export type GoogleSheetKey = keyof typeof googleSheetsConfig.sheets;

export const getSheetDefinition = (sheetKey: string): GoogleSheetDefinition | undefined =>
  googleSheetsConfig.sheets[sheetKey as GoogleSheetKey];

export const getRoomBillSheetDefinition = (sheetName: string): GoogleSheetDefinition => ({
  id: sheetName,
  spreadsheetId: GOOGLE_DATA_SPREADSHEET_ID,
  sheetName,
  headerRow: 1,
  columns: ROOM_BILL_COLUMNS,
});
