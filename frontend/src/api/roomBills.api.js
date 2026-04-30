import http from './http';

export const roomBillsApi = {
  getRoomBills: async (params = {}) => {
    const { data } = await http.get('/room-bills', { params });
    return data;
  },
  createRoomBill: async (payload) => {
    const { data } = await http.post('/room-bills', payload);
    return data;
  },
  updateRoomBill: async ({ id, payload }) => {
    const { data } = await http.patch(`/room-bills/${id}`, payload);
    return data;
  },
  deleteRoomBill: async (id) => {
    const { data } = await http.delete(`/room-bills/${id}`);
    return data;
  },
};
