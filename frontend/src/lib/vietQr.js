const DEFAULT_TEMPLATE = 'compact2';

const normalizeAmount = (amount) => {
  const numeric = Number(amount ?? 0);
  if (Number.isNaN(numeric) || numeric < 0) {
    return '0';
  }
  return String(Math.floor(numeric));
};

const toEncodedValue = (value) => encodeURIComponent(String(value ?? '').trim());

/**
 * Build VietQR image URL.
 * Formula equivalent:
 * https://img.vietqr.io/image/{bankCode}-{accountNumber}-{template}.png
 *   ?amount={amount}
 *   &addInfo={encodedTransferContent}
 *   &accountName={encodedAccountName}
 */
export const buildVietQrImageUrl = ({
  bankCode,
  accountNumber,
  template = DEFAULT_TEMPLATE,
  amount = 0,
  addInfo = '',
  accountName = '',
}) => {
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

/**
 * Convenience function when working directly with account-bank entity.
 */
export const buildVietQrImageUrlFromAccountBank = ({
  accountBank,
  amount = 0,
  addInfo = '',
  template = DEFAULT_TEMPLATE,
}) =>
  buildVietQrImageUrl({
    bankCode: accountBank?.bank,
    accountNumber: accountBank?.accountNumber,
    template,
    amount,
    addInfo,
    accountName: accountBank?.customerName ?? '',
  });
