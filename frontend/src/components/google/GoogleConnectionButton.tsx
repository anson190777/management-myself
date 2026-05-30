import { GoogleOutlined, LogoutOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Space, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  disconnectGoogle,
  getGoogleOAuthStatus,
} from '../../api/googleSheets.api';
import { useGoogleOAuthCallbackMessage } from '../../hooks/useGoogleOAuthCallbackMessage';

export default function GoogleConnectionButton() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useGoogleOAuthCallbackMessage({ showSuccess: true, showError: false });

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
      navigate('/login', { replace: true });
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

  return null;
}
