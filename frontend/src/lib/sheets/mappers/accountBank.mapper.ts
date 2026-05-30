import type { AccountBank } from '../../../types/api';

export type AccountBankSheetRow = Record<string, string | number | boolean>;

export const mapRowToAccountBank = (row: AccountBankSheetRow): AccountBank => ({
  _id: String(row._id ?? ''),
  customerCode: String(row.customerCode ?? ''),
  customerName: String(row.customerName ?? ''),
  bank: String(row.bank ?? ''),
  accountNumber: String(row.accountNumber ?? ''),
  isDefault: row.isDefault === true || row.isDefault === 'TRUE' || row.isDefault === 'true',
});

export const mapAccountBankToRow = (
  bank: Partial<AccountBank> & { createdAt?: string; updatedAt?: string },
): Record<string, unknown> => ({
  _id: bank._id,
  customerCode: bank.customerCode,
  customerName: bank.customerName,
  bank: bank.bank,
  accountNumber: bank.accountNumber,
  isDefault: bank.isDefault ?? false,
  createdAt: bank.createdAt,
  updatedAt: bank.updatedAt,
});
