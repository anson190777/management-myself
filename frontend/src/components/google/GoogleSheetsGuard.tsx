import { Alert, Button, Spin, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getGoogleOAuthStatus } from '../../api/googleSheets.api';
import {
  GOOGLE_DATA_SPREADSHEET_ID,
  GOOGLE_DATA_SPREADSHEET_URL,
} from '../../config/googleSheets.config';
import GoogleConnectionButton from './GoogleConnectionButton';

interface GoogleSheetsGuardProps {
  children: ReactNode;
}

export default function GoogleSheetsGuard({ children }: GoogleSheetsGuardProps) {
  const statusQuery = useQuery({
    queryKey: ['google-oauth-status'],
    queryFn: getGoogleOAuthStatus,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (statusQuery.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin tip="Đang kiểm tra kết nối Google..." />
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không kiểm tra được trạng thái Google"
        description={
          <>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              {statusQuery.error instanceof Error
                ? statusQuery.error.message
                : 'Lỗi không xác định'}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
              Đảm bảo frontend đang chạy tại{' '}
              <Typography.Text code>http://localhost:3000</Typography.Text> và đã
              restart sau khi sửa file <Typography.Text code>.env.local</Typography.Text>.
            </Typography.Paragraph>
            <Button onClick={() => void statusQuery.refetch()}>Thử lại</Button>
          </>
        }
      />
    );
  }

  if (statusQuery.data?.connected) {
    return <>{children}</>;
  }

  return (
      <Alert
        type="warning"
        showIcon
        message="Chưa kết nối Google Sheets"
        description={
          <>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              App đọc/ghi file:{' '}
              <Typography.Link href={GOOGLE_DATA_SPREADSHEET_URL} target="_blank">
                management_myself (Google Sheets)
              </Typography.Link>
            </Typography.Paragraph>
            <Typography.Paragraph strong style={{ marginBottom: 4 }}>
              Làm lần lượt:
            </Typography.Paragraph>
            <ol style={{ margin: '0 0 12px 20px', padding: 0 }}>
              <li>
                Mở file spreadsheet → <strong>Share</strong> → thêm email Google bạn sẽ
                đăng nhập bên dưới với quyền <strong>Editor</strong>.
              </li>
              <li>
                Bấm <strong>Kết nối Google</strong> → chọn đúng tài khoản vừa được share.
              </li>
              <li>
                Sau khi header hiện tag xanh (email), trang Rooms / Room Bills sẽ mở
                khóa.
              </li>
            </ol>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 12 }}>
              Spreadsheet ID: <Typography.Text code>{GOOGLE_DATA_SPREADSHEET_ID}</Typography.Text>
            </Typography.Paragraph>
            <GoogleConnectionButton />
          </>
        }
      />
  );
}
