import { DeleteOutlined, PlusOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountBanksApi } from '../api/accountBanks.api';

function AccountBanksPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['account-banks'],
    queryFn: accountBanksApi.getList,
  });

  const createMutation = useMutation({
    mutationFn: accountBanksApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account-banks'] });
      messageApi.success('Tạo account bank thành công');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => messageApi.error('Không thể tạo account bank'),
  });

  const setDefaultMutation = useMutation({
    mutationFn: accountBanksApi.setDefault,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account-banks'] });
      messageApi.success('Đã cập nhật tài khoản mặc định');
    },
    onError: () => messageApi.error('Không thể cập nhật mặc định'),
  });

  const deleteMutation = useMutation({
    mutationFn: accountBanksApi.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account-banks'] });
      messageApi.success('Xóa account bank thành công');
    },
    onError: () => messageApi.error('Không thể xóa account bank'),
  });

  const onCreate = async (values) => {
    await createMutation.mutateAsync(values);
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'customerCode',
      key: 'customerCode',
    },
    {
      title: 'Tên KH',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bank',
      key: 'bank',
    },
    {
      title: 'STK',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (value) =>
        value ? <Tag color="gold">Default</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={record.isDefault ? <StarFilled /> : <StarOutlined />}
            disabled={record.isDefault}
            onClick={() => setDefaultMutation.mutate(record._id)}
          >
            Set default
          </Button>
          <Popconfirm
            title="Xóa account bank này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Card
        title="Profile / Account Banks"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Thêm account bank
          </Button>
        }
      >
        <Table
          rowKey="_id"
          loading={listQuery.isLoading}
          dataSource={listQuery.data ?? []}
          columns={columns}
          pagination={{ pageSize: 20, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title="Tạo account bank"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isDefault: false }}
          onFinish={onCreate}
        >
          <Form.Item name="customerCode" label="Mã khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bank" label="Ngân hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="accountNumber" label="Số tài khoản" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isDefault" label="Đặt làm mặc định" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Space>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Tạo mới
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
}

export default AccountBanksPage;
