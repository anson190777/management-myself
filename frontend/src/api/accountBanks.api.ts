import http from './http';
import type { AccountBank } from '../types/api';

interface GetDefaultOptions {
  forceRefresh?: boolean;
}

export const accountBanksApi = {
  async getList() {
    const { data } = await http.get<AccountBank[]>('/account-banks');
    return data;
  },
  async create(payload: Omit<AccountBank, '_id'>) {
    const { data } = await http.post<AccountBank>('/account-banks', payload);
    return data;
  },
  async setDefault(id: string) {
    const { data } = await http.patch<AccountBank>(`/account-banks/${id}/default`);
    return data;
  },
  async getDefault({ forceRefresh = false }: GetDefaultOptions = {}) {
    const { data } = await http.get<AccountBank | null>('/account-banks/default', {
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
  async remove(id: string) {
    const { data } = await http.delete(`/account-banks/${id}`);
    return data;
  },
};
