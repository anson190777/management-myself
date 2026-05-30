import type { Room } from '../../../types/api';

export type RoomSheetRow = Record<string, string | number | boolean>;

export const mapRowToRoom = (row: RoomSheetRow): Room => ({
  _id: String(row._id ?? ''),
  name: String(row.name ?? ''),
  nameUser: String(row.nameUser ?? ''),
  monthlyRent: Number(row.monthlyRent ?? 0),
  electricityUnitPrice: Number(row.electricityUnitPrice ?? 0),
  waterUnitPrice: Number(row.waterUnitPrice ?? 0),
  wifiFee: Number(row.wifiFee ?? 0),
  trashFee: Number(row.trashFee ?? 0),
  isActive: row.isActive === true || row.isActive === 'TRUE' || row.isActive === 'true',
  createdAt: String(row.createdAt ?? ''),
  updatedAt: String(row.updatedAt ?? ''),
  billSheetName: String(row.billSheetName ?? ''),
});

export const mapRoomToRow = (room: Partial<Room>): Record<string, unknown> => ({
  _id: room._id,
  name: room.name,
  nameUser: room.nameUser,
  monthlyRent: room.monthlyRent,
  electricityUnitPrice: room.electricityUnitPrice,
  waterUnitPrice: room.waterUnitPrice,
  wifiFee: room.wifiFee,
  trashFee: room.trashFee,
  isActive: room.isActive ?? true,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
  billSheetName: room.billSheetName,
});
