import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Popconfirm,
  Row,
  Space,
  Switch,
  Pagination,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import GoogleSheetsGuard from '../components/google/GoogleSheetsGuard';
import { roomsSheets } from '../lib/sheets/roomsSheets';
import { formatCurrencyVnd } from '../utils/format';

const initialFormValues = {
  name: '',
  nameUser: '',
  monthlyRent: 0,
  electricityUnitPrice: 0,
  waterUnitPrice: 0,
  wifiFee: 0,
  trashFee: 0,
  isActive: true,
};

const vndFormatter = (value: string | number | undefined | null) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const numeric = String(value).replace(/\D/g, '');
  if (!numeric) {
    return '';
  }
  return `${Number(numeric).toLocaleString('vi-VN')} VND`;
};

const vndParser = (value: string | undefined) => {
  if (!value) {
    return 0;
  }
  return Number(String(value).replace(/\D/g, ''));
};

export default function RoomsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [searchText, setSearchText] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ['rooms', page],
    queryFn: () => roomsSheets.getRooms({ page, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: roomsSheets.createRoom,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      messageApi.success('Tạo phòng thành công');
      setIsDrawerOpen(false);
      form.resetFields();
    },
    onError: () => messageApi.error('Không thể tạo phòng'),
  });

  const updateMutation = useMutation({
    mutationFn: roomsSheets.updateRoom,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      messageApi.success('Cập nhật phòng thành công');
      setIsDrawerOpen(false);
      setEditingRoom(null);
      form.resetFields();
    },
    onError: () => messageApi.error('Không thể cập nhật phòng'),
  });

  const deleteMutation = useMutation({
    mutationFn: roomsSheets.deleteRoom,
    onSuccess: async (_: unknown, roomId: string) => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
      }
      messageApi.success('Xóa phòng thành công');
    },
    onError: () => messageApi.error('Không thể xóa phòng'),
  });

  const rooms = useMemo(() => roomsQuery.data?.items ?? [], [roomsQuery.data]);
  const pagination = roomsQuery.data?.pagination;

  const filteredRooms = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return rooms;
    }
    return rooms.filter(
      (room: any) =>
        room.name.toLowerCase().includes(keyword) ||
        room.nameUser.toLowerCase().includes(keyword),
    );
  }, [rooms, searchText]);

  const selectedRoom =
    rooms.find((room: any) => room._id === selectedRoomId) ?? filteredRooms[0];

  const openCreateDrawer = () => {
    setEditingRoom(null);
    form.setFieldsValue(initialFormValues);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (room: any) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingRoom?._id) {
      await updateMutation.mutateAsync({ id: editingRoom._id, payload: values });
      return;
    }
    await createMutation.mutateAsync(values);
  };

  return (
    <GoogleSheetsGuard>
      {contextHolder}
      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card
            title="Danh sách phòng"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
                Thêm phòng
              </Button>
            }
          >
            <Input.Search
              placeholder="Tìm theo tên phòng hoặc người thuê"
              allowClear
              onChange={(event) => setSearchText(event.target.value)}
              style={{ marginBottom: 12 }}
            />
            <List
              loading={roomsQuery.isLoading}
              dataSource={filteredRooms}
              locale={{ emptyText: 'Chưa có phòng' }}
              renderItem={(room: any) => (
                <List.Item
                  onClick={() => setSelectedRoomId(room._id)}
                  className={`room-list-item ${
                    (selectedRoom?._id ?? '') === room._id ? 'selected' : ''
                  }`}
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditDrawer(room);
                      }}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Xóa phòng này?"
                      onConfirm={() => deleteMutation.mutate(room._id)}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<UserOutlined />}
                    title={room.name}
                    description={`Người thuê: ${room.nameUser}`}
                  />
                </List.Item>
              )}
            />
            <Pagination
              style={{ marginTop: 12, textAlign: 'right' }}
              current={pagination?.page ?? 1}
              pageSize={pagination?.limit ?? 20}
              total={pagination?.totalItems ?? 0}
              onChange={(nextPage) => setPage(nextPage)}
              showSizeChanger={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Chi tiết phòng">
            {selectedRoom ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Tên phòng">
                  {selectedRoom.name}
                </Descriptions.Item>
                <Descriptions.Item label="Người thuê">
                  {selectedRoom.nameUser}
                </Descriptions.Item>
                <Descriptions.Item label="Tiền thuê tháng">
                  {formatCurrencyVnd(selectedRoom.monthlyRent)}
                </Descriptions.Item>
                <Descriptions.Item label="Đơn giá điện">
                  {formatCurrencyVnd(selectedRoom.electricityUnitPrice)}
                </Descriptions.Item>
                <Descriptions.Item label="Đơn giá nước">
                  {formatCurrencyVnd(selectedRoom.waterUnitPrice)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí wifi">
                  {formatCurrencyVnd(selectedRoom.wifiFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí rác">
                  {formatCurrencyVnd(selectedRoom.trashFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {selectedRoom.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Chọn một phòng để xem chi tiết" />
            )}
          </Card>
        </Col>
      </Row>

      <Drawer
        title={editingRoom ? 'Cập nhật phòng' : 'Thêm phòng'}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingRoom(null);
        }}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialFormValues}
          onFinish={handleSubmit}
        >
          <Form.Item name="name" label="Tên phòng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="nameUser"
            label="Tên người thuê"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="monthlyRent"
            label="Tiền thuê hằng tháng"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item
            name="electricityUnitPrice"
            label="Đơn giá điện"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item
            name="waterUnitPrice"
            label="Đơn giá nước"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item name="wifiFee" label="Phí wifi" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item name="trashFee" label="Phí rác" rules={[{ required: true }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Space>
            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingRoom ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form>
      </Drawer>
    </GoogleSheetsGuard>
  );
}
