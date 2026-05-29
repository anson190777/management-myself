import type { PaginatedResponse, Room, RoomBill } from '../../types/api';
import { buildRoomBillPayload, type RoomBillInput } from './calculations/roomBill.calc';
import { mapRoomBillToRow, mapRowToRoomBill } from './mappers/roomBill.mapper';
import { sheetsHttp } from './http';
import { paginateItems } from './pagination';
import { roomsSheets } from './roomsSheets';

interface RoomBillParams {
  roomId?: string;
  billingMonth?: string;
  beforeMonth?: string;
  fields?: string;
  page?: number;
  limit?: number;
}

const loadBillsForSheet = async (sheetName: string, room?: Room): Promise<RoomBill[]> => {
  try {
    const response = await sheetsHttp.read({ sheetName });
    return response.rows.map((row) => mapRowToRoomBill(row, room));
  } catch {
    return [];
  }
};

const loadAllBills = async (rooms: Room[]): Promise<RoomBill[]> => {
  const roomById = Object.fromEntries(rooms.map((room) => [room._id, room]));
  const results: RoomBill[] = [];

  for (const room of rooms) {
    const sheetName = room.billSheetName;
    if (!sheetName) {
      continue;
    }
    const bills = await loadBillsForSheet(sheetName, room);
    results.push(...bills);
  }

  return results
    .map((bill) => {
      const room =
        typeof bill.roomId === 'object'
          ? bill.roomId
          : roomById[String(bill.roomId)] ?? bill.roomId;
      return { ...bill, roomId: room };
    })
    .sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
};

export const roomBillsSheets = {
  async getRoomBills(params: RoomBillParams = {}): Promise<PaginatedResponse<RoomBill>> {
    const roomsResponse = await roomsSheets.getRooms({ page: 1, limit: 500 });
    const rooms = roomsResponse.items;

    let items: RoomBill[] = [];

    if (params.roomId) {
      const room = rooms.find((item) => item._id === params.roomId) ?? (await roomsSheets.getRoomById(params.roomId));
      const sheetName = room.billSheetName;
      if (sheetName) {
        items = await loadBillsForSheet(sheetName, room);
      }
    } else {
      items = await loadAllBills(rooms);
    }

    if (params.billingMonth) {
      items = items.filter((bill) => bill.billingMonth === params.billingMonth);
    }

    if (params.beforeMonth) {
      items = items
        .filter((bill) => bill.billingMonth < params.beforeMonth!)
        .sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));

      if (params.fields) {
        const limited = items.slice(0, params.limit ?? 1);
        return paginateItems(limited, params.page, params.limit);
      }

      return paginateItems(items.slice(0, params.limit ?? 1), params.page, params.limit);
    }

    return paginateItems(items, params.page, params.limit);
  },

  async createRoomBill(payload: Partial<RoomBill> & RoomBillInput) {
    const room = await roomsSheets.getRoomById(payload.roomId);
    const sheetName = room.billSheetName;
    if (!sheetName) {
      throw new Error('Room has no bill sheet configured');
    }

    const existing = await loadBillsForSheet(sheetName, room);
    if (existing.some((bill) => bill.billingMonth === payload.billingMonth)) {
      throw new Error(`Bill already exists for month ${payload.billingMonth}`);
    }

    const computed = buildRoomBillPayload(payload, room);
    const now = new Date().toISOString();
    const bill: RoomBill = {
      _id: crypto.randomUUID(),
      ...computed,
      roomId: room,
      createdAt: now,
      updatedAt: now,
    };

    await sheetsHttp.append({
      sheetName,
      row: mapRoomBillToRow(bill),
    });

    return bill;
  },

  async updateRoomBill({
    id,
    payload,
  }: {
    id: string;
    payload: Partial<RoomBill> & Partial<RoomBillInput>;
  }) {
    const roomIdRaw = payload.roomId as string | Room | undefined;
    if (!roomIdRaw) {
      throw new Error('roomId is required for update');
    }

    const resolvedRoomId =
      typeof roomIdRaw === 'object' ? roomIdRaw._id : String(roomIdRaw);

    const room = await roomsSheets.getRoomById(resolvedRoomId);
    const sheetName = room.billSheetName;
    if (!sheetName) {
      throw new Error('Room has no bill sheet configured');
    }

    const bills = await loadBillsForSheet(sheetName, room);
    const existing = bills.find((bill) => bill._id === id);
    if (!existing) {
      throw new Error('Room bill not found');
    }

    const mergedInput: RoomBillInput = {
      roomId: room._id,
      billingMonth: payload.billingMonth ?? existing.billingMonth,
      electricityOldReading:
        payload.electricityOldReading ?? existing.electricityOldReading,
      electricityNewReading:
        payload.electricityNewReading ?? existing.electricityNewReading,
      waterOldReading: payload.waterOldReading ?? existing.waterOldReading,
      waterNewReading: payload.waterNewReading ?? existing.waterNewReading,
      wifiFee: payload.wifiFee ?? existing.wifiFee,
      trashFee: payload.trashFee ?? existing.trashFee,
      monthlyRent: payload.monthlyRent ?? existing.monthlyRent,
      otherFees: payload.otherFees ?? existing.otherFees,
      note: payload.note ?? existing.note,
    };

    const computed = buildRoomBillPayload(mergedInput, room);
    const updated: RoomBill = {
      ...existing,
      ...computed,
      _id: existing._id,
      roomId: room,
      updatedAt: new Date().toISOString(),
    };

    await sheetsHttp.update({
      sheetName,
      id,
      row: mapRoomBillToRow(updated),
    });

    return updated;
  },

  async deleteRoomBill(id: string, roomId: string) {
    const room = await roomsSheets.getRoomById(roomId);
    const sheetName = room.billSheetName;
    if (!sheetName) {
      throw new Error('Room has no bill sheet configured');
    }
    await sheetsHttp.deleteRow({ sheetName, id });
    return { ok: true };
  },
};

export type RoomBillsSheetsApi = typeof roomBillsSheets;
