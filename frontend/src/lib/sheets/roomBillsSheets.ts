import type { PaginatedResponse, Room, RoomBill } from '../../types/api';
import { buildRoomBillPayload, type RoomBillInput } from './calculations/roomBill.calc';
import { mapRoomBillToRow, mapRowToRoomBill } from './mappers/roomBill.mapper';
import { sheetsHttp } from './http';
import { paginateItems } from './pagination';
import { roomsSheets } from './roomsSheets';
import {
  buildBillSheetName,
  isBillSheetForRoom,
} from './sheetNames';

interface RoomBillParams {
  roomId?: string;
  billingYear?: string;
  billingMonth?: string;
  beforeMonth?: string;
  fields?: string;
  page?: number;
  limit?: number;
}

let tabNamesCache: string[] | null = null;

const loadSpreadsheetTabNames = async (): Promise<string[]> => {
  if (!tabNamesCache) {
    const response = await sheetsHttp.listTabs();
    tabNamesCache = response.sheetNames;
  }
  return tabNamesCache;
};

export const resetRoomBillsSheetsTabCache = () => {
  tabNamesCache = null;
};

const getBillSheetNamesForRoom = (tabNames: string[], room: Room): string[] =>
  tabNames.filter((name) => isBillSheetForRoom(name, room.name));

const resolveBillSheetName = (room: Room, billingMonth: string): string =>
  buildBillSheetName(room.name, billingMonth);

const loadBillsForSheet = async (sheetName: string, room?: Room): Promise<RoomBill[]> => {
  try {
    const response = await sheetsHttp.read({ sheetName });
    return response.rows.map((row) => mapRowToRoomBill(row, room));
  } catch {
    return [];
  }
};

const loadBillsForRoom = async (room: Room, tabNames: string[]): Promise<RoomBill[]> => {
  const sheetNames = getBillSheetNamesForRoom(tabNames, room);
  const results: RoomBill[] = [];
  for (const sheetName of sheetNames) {
    const bills = await loadBillsForSheet(sheetName, room);
    results.push(...bills);
  }
  return results;
};

const findBillSheetById = async (
  room: Room,
  billId: string,
  tabNames: string[],
): Promise<{ sheetName: string; bill: RoomBill } | null> => {
  const sheetNames = getBillSheetNamesForRoom(tabNames, room);
  for (const sheetName of sheetNames) {
    const bills = await loadBillsForSheet(sheetName, room);
    const bill = bills.find((item) => item._id === billId);
    if (bill) {
      return { sheetName, bill };
    }
  }
  return null;
};

export const roomBillsSheets = {
  async migrateLegacySheets() {
    const result = await sheetsHttp.migrateBillSheets();
    tabNamesCache = null;
    return result;
  },

  async syncRoomNamesInBillSheets() {
    const tabNames = await loadSpreadsheetTabNames();
    const roomsResponse = await roomsSheets.getRooms({ page: 1, limit: 500 });
    let updated = 0;

    for (const room of roomsResponse.items) {
      for (const sheetName of getBillSheetNamesForRoom(tabNames, room)) {
        await sheetsHttp.ensureSheet(sheetName);
        const response = await sheetsHttp.read({ sheetName });

        for (const row of response.rows) {
          const roomName = String(row.roomName ?? '').trim();
          if (roomName) {
            continue;
          }

          const bill = mapRowToRoomBill(row, room);
          await sheetsHttp.update({
            sheetName,
            id: bill._id,
            row: mapRoomBillToRow({ ...bill, roomId: room }),
          });
          updated += 1;
        }
      }
    }

    return { updated };
  },

  async getRoomBills(params: RoomBillParams = {}): Promise<PaginatedResponse<RoomBill>> {
    const tabNames = await loadSpreadsheetTabNames();
    const roomsResponse = await roomsSheets.getRooms({ page: 1, limit: 500 });
    const rooms = roomsResponse.items;

    let items: RoomBill[] = [];

    if (params.roomId) {
      const room =
        rooms.find((item) => item._id === params.roomId) ??
        (await roomsSheets.getRoomById(params.roomId));

      if (params.billingYear) {
        const sheetName = buildBillSheetName(room.name, params.billingYear);
        items = await loadBillsForSheet(sheetName, room);
      } else {
        items = await loadBillsForRoom(room, tabNames);
      }
    } else {
      items = [];
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
    if (!payload.billingMonth) {
      throw new Error('billingMonth is required');
    }

    const room = await roomsSheets.getRoomById(payload.roomId);
    const sheetName = resolveBillSheetName(room, payload.billingMonth);

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

    await sheetsHttp.ensureSheet(sheetName);
    tabNamesCache = null;

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
    const tabNames = await loadSpreadsheetTabNames();
    const located = await findBillSheetById(room, id, tabNames);
    if (!located) {
      throw new Error('Room bill not found');
    }

    const { sheetName: sourceSheetName, bill: existing } = located;

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

    const targetSheetName = resolveBillSheetName(room, updated.billingMonth);

    if (targetSheetName !== sourceSheetName) {
      const targetBills = await loadBillsForSheet(targetSheetName, room);
      if (targetBills.some((bill) => bill.billingMonth === updated.billingMonth && bill._id !== id)) {
        throw new Error(`Bill already exists for month ${updated.billingMonth}`);
      }

      await sheetsHttp.ensureSheet(targetSheetName);
      await sheetsHttp.append({
        sheetName: targetSheetName,
        row: mapRoomBillToRow(updated),
      });
      await sheetsHttp.deleteRow({ sheetName: sourceSheetName, id });
      tabNamesCache = null;
    } else {
      await sheetsHttp.update({
        sheetName: sourceSheetName,
        id,
        row: mapRoomBillToRow(updated),
      });
    }

    return updated;
  },

  async deleteRoomBill(id: string, roomId: string) {
    const room = await roomsSheets.getRoomById(roomId);
    const tabNames = await loadSpreadsheetTabNames();
    const located = await findBillSheetById(room, id, tabNames);
    if (!located) {
      throw new Error('Room bill not found');
    }

    await sheetsHttp.deleteRow({ sheetName: located.sheetName, id });
    return { ok: true };
  },
};

export type RoomBillsSheetsApi = typeof roomBillsSheets;
