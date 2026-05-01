import http from './http';
import type { PaginatedResponse, RoomBill } from '../types/api';

interface RoomBillParams {
  roomId?: string;
  billingMonth?: string;
  beforeMonth?: string;
  fields?: string;
  page?: number;
  limit?: number;
}

export const roomBillsApi = {
  async getRoomBills(params: RoomBillParams = {}) {
    const { data } = await http.get<PaginatedResponse<RoomBill>>('/room-bills', {
      params,
    });
    return data;
  },
  async createRoomBill(payload: Partial<RoomBill>) {
    const { data } = await http.post<RoomBill>('/room-bills', payload);
    return data;
  },
  async updateRoomBill({ id, payload }: { id: string; payload: Partial<RoomBill> }) {
    const { data } = await http.patch<RoomBill>(`/room-bills/${id}`, payload);
    return data;
  },
  async deleteRoomBill(id: string) {
    const { data } = await http.delete(`/room-bills/${id}`);
    return data;
  },
};
