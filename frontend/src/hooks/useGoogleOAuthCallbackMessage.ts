import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resetAccountBanksSheetsBootstrap } from '../lib/sheets/accountBanksSheets';
import { resetRoomBillsSheetsTabCache } from '../lib/sheets/roomBillsSheets';
import { resetRoomsSheetsBootstrap } from '../lib/sheets/roomsSheets';

interface UseGoogleOAuthCallbackMessageOptions {
  showSuccess?: boolean;
  showError?: boolean;
}

export function useGoogleOAuthCallbackMessage(
  options: UseGoogleOAuthCallbackMessageOptions = {},
) {
  const { showSuccess = true, showError = true } = options;
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const googleStatus = searchParams.get('google');
    if (!googleStatus) {
      return;
    }

    if (googleStatus === 'connected' && showSuccess) {
      const email = searchParams.get('email');
      message.success(
        email ? `Đã kết nối Google: ${email}` : 'Đã kết nối Google Sheets',
      );
      resetRoomsSheetsBootstrap();
      resetAccountBanksSheetsBootstrap();
      resetRoomBillsSheetsTabCache();
      void queryClient.invalidateQueries({ queryKey: ['google-oauth-status'] });
    } else if (googleStatus === 'error' && showError) {
      const reason = searchParams.get('reason') ?? 'oauth_failed';
      message.error(`Kết nối Google thất bại: ${reason}`);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('google');
    nextParams.delete('email');
    nextParams.delete('reason');
    setSearchParams(nextParams, { replace: true });
  }, [queryClient, searchParams, setSearchParams, showError, showSuccess]);
}
