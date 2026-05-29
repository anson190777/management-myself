import type { PaginatedResponse, Room } from '../../types/api';
import { mapRoomToRow, mapRowToRoom } from './mappers/room.mapper';
import { buildBillSheetName } from './sheetNames';
import { sheetsHttp } from './http';
import { paginateItems } from './pagination';

interface RoomParams {
  page?: number;
  limit?: number;
}

let bootstrapPromise: Promise<void> | null = null;

const ensureBootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = sheetsHttp
      .bootstrap()
      .then(() => undefined)
      .catch((error) => {
        bootstrapPromise = null;
        throw error;
      });
  }
  await bootstrapPromise;
};

/** Allow retry after OAuth connect / Cho phép bootstrap lại sau khi kết nối Google */
export const resetRoomsSheetsBootstrap = () => {
  bootstrapPromise = null;
};

const loadAllRooms = async (): Promise<Room[]> => {
  await ensureBootstrap();
  const response = await sheetsHttp.read({ sheetKey: 'rooms' });
  return response.rows.map((row) => mapRowToRoom(row));
};

export const roomsSheets = {
  async getRooms(params: RoomParams = {}) {
    const rooms = await loadAllRooms();
    return paginateItems(rooms, params.page, params.limit);
  },

  async getRoomById(id: string) {
    const rooms = await loadAllRooms();
    const room = rooms.find((item) => item._id === id);
    if (!room) {
      throw new Error('Room not found');
    }
    return room;
  },

  async createRoom(payload: Omit<Room, '_id' | 'createdAt' | 'updatedAt' | 'billSheetName'>) {
    await ensureBootstrap();
    const now = new Date().toISOString();
    const billSheetName = buildBillSheetName(payload.name);
    const room: Room = {
      _id: crypto.randomUUID(),
      ...payload,
      billSheetName,
      createdAt: now,
      updatedAt: now,
    };

    await sheetsHttp.ensureSheet(billSheetName);
    await sheetsHttp.append({
      sheetKey: 'rooms',
      row: mapRoomToRow(room),
    });

    return room;
  },

  async updateRoom({ id, payload }: { id: string; payload: Partial<Room> }) {
    const existing = await this.getRoomById(id);
    const updated: Room = {
      ...existing,
      ...payload,
      _id: existing._id,
      billSheetName: existing.billSheetName || buildBillSheetName(existing.name),
      updatedAt: new Date().toISOString(),
    };

    await sheetsHttp.update({
      sheetKey: 'rooms',
      id,
      row: mapRoomToRow(updated),
    });

    return updated;
  },

  async deleteRoom(id: string) {
    const existing = await this.getRoomById(id);
    await sheetsHttp.deleteRow({ sheetKey: 'rooms', id });
    if (existing.billSheetName) {
      try {
        await sheetsHttp.deleteSheet(existing.billSheetName);
      } catch {
        // Bill tab may already be removed / Không xóa được tab bill thì bỏ qua
      }
    }
    return { ok: true };
  },
};

export type RoomsSheetsApi = typeof roomsSheets;
