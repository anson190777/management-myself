const INVALID_SHEET_CHARS = /[\\/?*[\]:]/g;
const BILL_SHEET_YEAR_SUFFIX = /_\d{4}$/;

export const sanitizeRoomNameForSheet = (roomName: string): string => {
  const cleaned = roomName
    .trim()
    .replace(INVALID_SHEET_CHARS, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const base = cleaned || 'room';
  return base.slice(0, 75);
};

export const extractBillingYear = (billingMonth: string): string => {
  const match = billingMonth.match(/^(\d{4})-\d{2}$/);
  if (!match) {
    throw new Error(`Invalid billingMonth: ${billingMonth}`);
  }
  return match[1];
};

export const buildBillSheetName = (roomName: string, billingMonthOrYear: string): string => {
  const year = billingMonthOrYear.includes('-')
    ? extractBillingYear(billingMonthOrYear)
    : billingMonthOrYear.trim();
  return `bill_${sanitizeRoomNameForSheet(roomName)}_${year}`;
};

export const buildLegacyBillSheetName = (roomName: string): string =>
  `bill_${sanitizeRoomNameForSheet(roomName)}`;

export const buildBillSheetPrefix = (roomName: string): string =>
  `${buildLegacyBillSheetName(roomName)}_`;

export const isBillSheetForRoom = (sheetName: string, roomName: string): boolean => {
  if (sheetName === buildLegacyBillSheetName(roomName)) {
    return true;
  }
  const prefix = buildBillSheetPrefix(roomName);
  return sheetName.startsWith(prefix) && BILL_SHEET_YEAR_SUFFIX.test(sheetName);
};

export const isLegacyBillSheetTab = (sheetName: string): boolean => {
  if (!sheetName.startsWith('bill_') || sheetName === 'account_banks') {
    return false;
  }
  return !BILL_SHEET_YEAR_SUFFIX.test(sheetName);
};

export const isRoomBillSheetTab = (sheetName: string): boolean => {
  if (!sheetName.startsWith('bill_')) {
    return false;
  }
  if (sheetName === 'account_banks') {
    return false;
  }
  return BILL_SHEET_YEAR_SUFFIX.test(sheetName) || isLegacyBillSheetTab(sheetName);
};
