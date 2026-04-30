import http from './http';

export const accountBanksApi = {
  getList: async () => {
    const { data } = await http.get('/account-banks');
    return data;
  },
  create: async (payload) => {
    const { data } = await http.post('/account-banks', payload);
    return data;
  },
  setDefault: async (id) => {
    const { data } = await http.patch(`/account-banks/${id}/default`);
    return data;
  },
  getDefault: async ({ forceRefresh = false } = {}) => {
    const { data } = await http.get('/account-banks/default', {
      params: forceRefresh ? { _ts: Date.now() } : undefined,
      headers: forceRefresh
        ? {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          }
        : undefined,
    });
    return data;
  },
  remove: async (id) => {
    const { data } = await http.delete(`/account-banks/${id}`);
    return data;
  },
};
