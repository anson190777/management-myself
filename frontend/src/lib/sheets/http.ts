import type { GoogleSheetsReadResponse } from '../../types/googleSheets';

const sheetsFetch = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string; message?: string };
    throw new Error(body.detail ?? body.message ?? `Sheets API failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const sheetsHttp = {
  read(params: { sheetKey?: string; sheetName?: string }) {
    const search = new URLSearchParams();
    if (params.sheetKey) {
      search.set('sheetKey', params.sheetKey);
    }
    if (params.sheetName) {
      search.set('sheetName', params.sheetName);
    }
    return sheetsFetch<GoogleSheetsReadResponse>(`/api/google/sheets/read?${search.toString()}`);
  },

  append(body: { sheetKey?: string; sheetName?: string; row: Record<string, unknown> }) {
    return sheetsFetch<{ rowNumber: number }>('/api/google/sheets/append', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(body: {
    sheetKey?: string;
    sheetName?: string;
    id: string;
    row: Record<string, unknown>;
  }) {
    return sheetsFetch<{ ok: boolean }>('/api/google/sheets/update', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  deleteRow(params: { sheetKey?: string; sheetName?: string; id: string }) {
    const search = new URLSearchParams({ id: params.id });
    if (params.sheetKey) {
      search.set('sheetKey', params.sheetKey);
    }
    if (params.sheetName) {
      search.set('sheetName', params.sheetName);
    }
    return sheetsFetch<{ ok: boolean }>(`/api/google/sheets/delete-row?${search.toString()}`, {
      method: 'DELETE',
    });
  },

  ensureSheet(sheetName: string) {
    return sheetsFetch<{ created: boolean }>('/api/google/sheets/ensure-sheet', {
      method: 'POST',
      body: JSON.stringify({ sheetName }),
    });
  },

  deleteSheet(sheetName: string) {
    const search = new URLSearchParams({ sheetName });
    return sheetsFetch<{ ok: boolean }>(`/api/google/sheets/delete-sheet?${search.toString()}`, {
      method: 'DELETE',
    });
  },

  bootstrap() {
    return sheetsFetch<{ roomsSheetReady: boolean; created: boolean }>(
      '/api/google/sheets/bootstrap',
      { method: 'POST' },
    );
  },
};
