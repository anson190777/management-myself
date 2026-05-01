const DEFAULT_TEMPLATE = 'compact2';

const normalizeAmount = (amount: number): string => {
  const numeric = Number(amount ?? 0);
  if (Number.isNaN(numeric) || numeric < 0) {
    return '0';
  }
  return String(Math.floor(numeric));
};

const toEncodedValue = (value: string): string =>
  encodeURIComponent(String(value ?? '').trim());

interface BuildVietQrImageUrlParams {
  bankCode: string;
  accountNumber: string;
  template?: string;
  amount?: number;
  addInfo?: string;
  accountName?: string;
}

export const buildVietQrImageUrl = ({
  bankCode,
  accountNumber,
  template = DEFAULT_TEMPLATE,
  amount = 0,
  addInfo = '',
  accountName = '',
}: BuildVietQrImageUrlParams): string => {
  if (!bankCode || !accountNumber) {
    return '';
  }

  const path = `${toEncodedValue(bankCode)}-${toEncodedValue(accountNumber)}-${toEncodedValue(template)}.png`;
  const query = new URLSearchParams({
    amount: normalizeAmount(amount),
    addInfo: addInfo ?? '',
    accountName: accountName ?? '',
  });

  return `https://img.vietqr.io/image/${path}?${query.toString()}`;
};

interface BuildFromAccountBankParams {
  accountBank?: {
    bank?: string;
    accountNumber?: string;
    customerName?: string;
  } | null;
  amount?: number;
  addInfo?: string;
  template?: string;
}

export const buildVietQrImageUrlFromAccountBank = ({
  accountBank,
  amount = 0,
  addInfo = '',
  template = DEFAULT_TEMPLATE,
}: BuildFromAccountBankParams): string =>
  buildVietQrImageUrl({
    bankCode: accountBank?.bank ?? '',
    accountNumber: accountBank?.accountNumber ?? '',
    template,
    amount,
    addInfo,
    accountName: accountBank?.customerName ?? '',
  });
