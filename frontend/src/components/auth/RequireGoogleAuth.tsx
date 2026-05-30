import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Spin } from 'antd';
import { Navigate, Outlet } from 'react-router-dom';
import { getGoogleOAuthStatus } from '../../api/googleSheets.api';

export default function RequireGoogleAuth() {
  const statusQuery = useQuery({
    queryKey: ['google-oauth-status'],
    queryFn: getGoogleOAuthStatus,
    retry: 1,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (statusQuery.isLoading) {
    return (
      <div className="auth-loading">
        <Spin tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <div className="auth-loading">
        <Alert
          type="error"
          showIcon
          message="Không kiểm tra được trạng thái Google"
          description={
            statusQuery.error instanceof Error
              ? statusQuery.error.message
              : 'Lỗi không xác định'
          }
          action={
            <Button onClick={() => void statusQuery.refetch()}>Thử lại</Button>
          }
        />
      </div>
    );
  }

  if (!statusQuery.data?.connected) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
