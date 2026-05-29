import { GoogleOutlined, LinkOutlined, LogoutOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Space, Tag, message } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  disconnectGoogle,
  getGoogleOAuthStatus,
  startGoogleOAuth,
} from '../../api/googleSheets.api';
import { resetRoomsSheetsBootstrap } from '../../lib/sheets/roomsSheets';

export default function GoogleConnectionButton() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const googleStatus = searchParams.get('google');
    if (!googleStatus) {
      return;
    }

    if (googleStatus === 'connected') {
      const email = searchParams.get('email');
      message.success(
        email ? `Đã kết nối Google: ${email}` : 'Đã kết nối Google Sheets',
      );
      resetRoomsSheetsBootstrap();
      void queryClient.invalidateQueries({ queryKey: ['google-oauth-status'] });
    } else if (googleStatus === 'error') {
      const reason = searchParams.get('reason') ?? 'oauth_failed';
      message.error(`Kết nối Google thất bại: ${reason}`);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('google');
    nextParams.delete('email');
    nextParams.delete('reason');
    setSearchParams(nextParams, { replace: true });
  }, [queryClient, searchParams, setSearchParams]);

  const statusQuery = useQuery({
    queryKey: ['google-oauth-status'],
    queryFn: getGoogleOAuthStatus,
  });

  const connected = statusQuery.data?.connected ?? false;
  const email = statusQuery.data?.email;

  const handleDisconnect = async () => {
    try {
      await disconnectGoogle();
      await queryClient.invalidateQueries({ queryKey: ['google-oauth-status'] });
      message.success('Đã ngắt kết nối Google');
    } catch {
      message.error('Không ngắt được kết nối Google');
    }
  };

  if (statusQuery.isLoading) {
    return <Button loading size="small">Google...</Button>;
  }

  if (connected) {
    return (
      <Space size="small">
        <Tag color="green" icon={<GoogleOutlined />}>
          {email ?? 'Connected'}
        </Tag>
        <Button
          size="small"
          icon={<LogoutOutlined />}
          onClick={() => void handleDisconnect()}
        >
          Ngắt
        </Button>
      </Space>
    );
  }

  return (
    <Button
      type="primary"
      size="small"
      icon={<LinkOutlined />}
      onClick={startGoogleOAuth}
    >
      Kết nối Google
    </Button>
  );
}
