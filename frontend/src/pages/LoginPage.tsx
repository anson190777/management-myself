import { FileTextOutlined, GoogleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Spin, Typography } from 'antd';
import { Navigate } from 'react-router-dom';
import { getGoogleOAuthStatus, startGoogleOAuth } from '../api/googleSheets.api';
import {
  GOOGLE_DATA_SPREADSHEET_ID,
  GOOGLE_DATA_SPREADSHEET_URL,
} from '../config/googleSheets.config';
import { useGoogleOAuthCallbackMessage } from '../hooks/useGoogleOAuthCallbackMessage';

export default function LoginPage() {
  useGoogleOAuthCallbackMessage({ showSuccess: false, showError: true });

  const statusQuery = useQuery({
    queryKey: ['google-oauth-status'],
    queryFn: getGoogleOAuthStatus,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (statusQuery.isLoading) {
    return (
      <div className="login-page">
        <Spin tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  if (statusQuery.data?.connected) {
    return <Navigate to="/house/rooms" replace />;
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-logo">
          <FileTextOutlined />
          <Typography.Title level={3} style={{ margin: 0 }}>
            ManagementMyself
          </Typography.Title>
        </div>

        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Đăng nhập bằng Google để quản lý phòng và hóa đơn qua Google Sheets.
        </Typography.Paragraph>

        {statusQuery.isError && (
          <Alert
            type="error"
            showIcon
            message="Không kiểm tra được trạng thái Google"
            description={
              statusQuery.error instanceof Error
                ? statusQuery.error.message
                : 'Lỗi không xác định'
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <Button
          type="primary"
          size="large"
          block
          icon={<GoogleOutlined />}
          onClick={startGoogleOAuth}
        >
          Đăng nhập với Google
        </Button>

        <Alert
          type="info"
          showIcon
          style={{ marginTop: 24, textAlign: 'left' }}
          message="Trước khi đăng nhập"
          description={
            <>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                App đọc/ghi file:{' '}
                <Typography.Link href={GOOGLE_DATA_SPREADSHEET_URL} target="_blank">
                  management_myself (Google Sheets)
                </Typography.Link>
              </Typography.Paragraph>
              <ol style={{ margin: '0 0 8px 20px', padding: 0 }}>
                <li>
                  Mở spreadsheet → <strong>Share</strong> → thêm email Google bạn sẽ đăng
                  nhập với quyền <strong>Editor</strong>.
                </li>
                <li>
                  Bấm <strong>Đăng nhập với Google</strong> → chọn đúng tài khoản vừa
                  được share.
                </li>
              </ol>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
                Spreadsheet ID:{' '}
                <Typography.Text code>{GOOGLE_DATA_SPREADSHEET_ID}</Typography.Text>
              </Typography.Paragraph>
            </>
          }
        />
      </Card>
    </div>
  );
}
