const INVALID_SHEET_CHARS = /[\\/?*[\]:]/g;

export const sanitizeRoomNameForSheet = (roomName: string): string => {
  const cleaned = roomName
    .trim()
    .replace(INVALID_SHEET_CHARS, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const base = cleaned || 'room';
  const truncated = base.slice(0, 80);
  return truncated;
};

export const buildBillSheetName = (roomName: string): string => {
  return `bill_${sanitizeRoomNameForSheet(roomName)}`;
};
