import http from './http';

export const roomsApi = {
  getRooms: async (params = {}) => {
    const { data } = await http.get('/rooms', { params });
    return data;
  },
  getRoomById: async (id) => {
    const { data } = await http.get(`/rooms/${id}`);
    return data;
  },
  createRoom: async (payload) => {
    const { data } = await http.post('/rooms', payload);
    return data;
  },
  updateRoom: async ({ id, payload }) => {
    const { data } = await http.patch(`/rooms/${id}`, payload);
    return data;
  },
  deleteRoom: async (id) => {
    const { data } = await http.delete(`/rooms/${id}`);
    return data;
  },
};
