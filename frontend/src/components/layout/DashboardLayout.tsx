import {
  BankOutlined,
  DollarOutlined,
  FileTextOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const routeTitleMap: Record<string, string> = {
  '/house/rooms': 'House / Rooms',
  '/house/room-bills': 'House / Room Bills',
  '/profile/account-banks': 'Profile / Account Banks',
  '/revenue': 'Doanh thu',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = useMemo(
    () => [
      {
        key: 'house',
        icon: <HomeOutlined />,
        label: 'House',
        children: [
          {
            key: '/house/rooms',
            label: 'Rooms',
          },
          {
            key: '/house/room-bills',
            label: 'Room Bills',
          },
        ],
      },
      {
        key: '/revenue',
        icon: <DollarOutlined />,
        label: 'Doanh thu',
      },
    ],
    [],
  );

  const profileMenuItems = useMemo(
    () => [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        children: [
          {
            key: '/profile/account-banks',
            icon: <BankOutlined />,
            label: 'Account Bank',
          },
        ],
      },
    ],
    [],
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="app-sider-body">
          <div>
            <div className="app-logo">
              <FileTextOutlined />
              {!collapsed && <span>ManagementMyself</span>}
            </div>
            <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={['house']}
              items={mainMenuItems}
              onClick={({ key }) => navigate(String(key))}
            />
          </div>
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['profile']}
            items={profileMenuItems}
            onClick={({ key }) => navigate(String(key))}
          />
        </div>
      </Sider>
      <Layout>
        <Header className="app-header">
          <div>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              {routeTitleMap[location.pathname] ?? 'Dashboard'}
            </Typography.Title>
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
