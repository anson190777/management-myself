import http from './http';
import type { PaginatedResponse, Room } from '../types/api';

interface RoomParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const roomsApi = {
  async getRooms(params: RoomParams = {}) {
    const { data } = await http.get<PaginatedResponse<Room>>('/rooms', { params });
    return data;
  },
  async getRoomById(id: string) {
    const { data } = await http.get<Room>(`/rooms/${id}`);
    return data;
  },
  async createRoom(payload: Omit<Room, '_id'>) {
    const { data } = await http.post<Room>('/rooms', payload);
    return data;
  },
  async updateRoom({ id, payload }: { id: string; payload: Partial<Room> }) {
    const { data } = await http.patch<Room>(`/rooms/${id}`, payload);
    return data;
  },
  async deleteRoom(id: string) {
    const { data } = await http.delete(`/rooms/${id}`);
    return data;
  },
};
