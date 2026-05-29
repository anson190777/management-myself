import type { OtherFee, Room, RoomBill } from '../../../types/api';

export type RoomBillSheetRow = Record<string, string | number | boolean>;

const parseOtherFees = (raw: unknown): OtherFee[] => {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw as OtherFee[];
  }
  const text = String(raw).trim();
  if (!text) {
    return [];
  }
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as OtherFee[]) : [];
  } catch {
    return [];
  }
};

export const mapRowToRoomBill = (row: RoomBillSheetRow, room?: Room): RoomBill => {
  const roomId = String(row.roomId ?? '');
  return {
    _id: String(row._id ?? ''),
    roomId: room ?? roomId,
    billingMonth: String(row.billingMonth ?? ''),
    electricityOldReading: Number(row.electricityOldReading ?? 0),
    electricityNewReading: Number(row.electricityNewReading ?? 0),
    electricityUsed: Number(row.electricityUsed ?? 0),
    waterOldReading: Number(row.waterOldReading ?? 0),
    waterNewReading: Number(row.waterNewReading ?? 0),
    waterUsed: Number(row.waterUsed ?? 0),
    electricityAmount: Number(row.electricityAmount ?? 0),
    waterAmount: Number(row.waterAmount ?? 0),
    wifiFee: Number(row.wifiFee ?? 0),
    trashFee: Number(row.trashFee ?? 0),
    monthlyRent: Number(row.monthlyRent ?? 0),
    otherFees: parseOtherFees(row.otherFees),
    note: String(row.note ?? ''),
    totalAmount: Number(row.totalAmount ?? 0),
    createdAt: String(row.createdAt ?? ''),
    updatedAt: String(row.updatedAt ?? ''),
  };
};

export const mapRoomBillToRow = (bill: Partial<RoomBill>): Record<string, unknown> => {
  const roomId =
    typeof bill.roomId === 'object' && bill.roomId && '_id' in bill.roomId
      ? (bill.roomId as Room)._id
      : bill.roomId;

  return {
    _id: bill._id,
    roomId,
    billingMonth: bill.billingMonth,
    electricityOldReading: bill.electricityOldReading,
    electricityNewReading: bill.electricityNewReading,
    electricityUsed: bill.electricityUsed,
    waterOldReading: bill.waterOldReading,
    waterNewReading: bill.waterNewReading,
    waterUsed: bill.waterUsed,
    electricityAmount: bill.electricityAmount,
    waterAmount: bill.waterAmount,
    wifiFee: bill.wifiFee,
    trashFee: bill.trashFee,
    monthlyRent: bill.monthlyRent,
    otherFees: JSON.stringify(bill.otherFees ?? []),
    note: bill.note ?? '',
    totalAmount: bill.totalAmount,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
  };
};
