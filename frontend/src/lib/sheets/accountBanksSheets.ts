import type { AccountBank } from '../../types/api';
import { ACCOUNT_BANKS_SHEET_NAME } from '../../config/googleSheets.config';
import { mapAccountBankToRow, mapRowToAccountBank } from './mappers/accountBank.mapper';
import { sheetsHttp } from './http';

let bootstrapPromise: Promise<void> | null = null;

const ensureBootstrap = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = sheetsHttp
      .ensureSheet(ACCOUNT_BANKS_SHEET_NAME)
      .then(() => undefined)
      .catch((error) => {
        bootstrapPromise = null;
        throw error;
      });
  }
  await bootstrapPromise;
};

export const resetAccountBanksSheetsBootstrap = () => {
  bootstrapPromise = null;
};

const loadAllAccountBanks = async (): Promise<AccountBank[]> => {
  await ensureBootstrap();
  const response = await sheetsHttp.read({ sheetKey: 'accountBanks' });
  return response.rows.map((row) => mapRowToAccountBank(row));
};

const clearDefaultFlags = async (items: AccountBank[], exceptId?: string) => {
  const updates = items.filter((item) => item.isDefault && item._id !== exceptId);
  await Promise.all(
    updates.map((item) =>
      sheetsHttp.update({
        sheetKey: 'accountBanks',
        id: item._id,
        row: mapAccountBankToRow({ ...item, isDefault: false, updatedAt: new Date().toISOString() }),
      }),
    ),
  );
};

export const accountBanksSheets = {
  async getList() {
    return loadAllAccountBanks();
  },

  async getDefault() {
    const items = await loadAllAccountBanks();
    return items.find((item) => item.isDefault) ?? null;
  },

  async create(payload: Omit<AccountBank, '_id'>) {
    await ensureBootstrap();
    const now = new Date().toISOString();
    const accountBank: AccountBank & { createdAt: string; updatedAt: string } = {
      _id: crypto.randomUUID(),
      ...payload,
      isDefault: payload.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    };

    if (accountBank.isDefault) {
      const existing = await loadAllAccountBanks();
      await clearDefaultFlags(existing);
    }

    await sheetsHttp.append({
      sheetKey: 'accountBanks',
      row: mapAccountBankToRow(accountBank),
    });

    return accountBank;
  },

  async setDefault(id: string) {
    const items = await loadAllAccountBanks();
    const existing = items.find((item) => item._id === id);
    if (!existing) {
      throw new Error('Account bank not found');
    }

    await clearDefaultFlags(items, id);

    const updated = {
      ...existing,
      isDefault: true,
      updatedAt: new Date().toISOString(),
    };

    await sheetsHttp.update({
      sheetKey: 'accountBanks',
      id,
      row: mapAccountBankToRow(updated),
    });

    return updated;
  },

  async remove(id: string) {
    await sheetsHttp.deleteRow({ sheetKey: 'accountBanks', id });
    return { ok: true };
  },
};

export type AccountBanksSheetsApi = typeof accountBanksSheets;
