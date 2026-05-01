import {
  CloseOutlined,
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountBanksApi } from '../api/accountBanks.api';
import { roomBillsApi } from '../api/roomBills.api';
import { roomsApi } from '../api/rooms.api';
import { buildVietQrImageUrlFromAccountBank } from '../lib/vietQr';
import { formatCurrencyVnd } from '../utils/format';

const buildOtherFeesValue = (otherFees: any[] = []) =>
  otherFees.map((item) => ({
    name: item.name,
    amount: item.amount,
  }));

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

export default function RoomBillsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState({
    roomId: undefined as string | undefined,
    billingMonth: undefined as string | undefined,
    page: 1,
    limit: 20,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedRoomPricing, setSelectedRoomPricing] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<any>(null);
  const [previewTenantName, setPreviewTenantName] = useState('');
  const [defaultAccountBank, setDefaultAccountBank] = useState<any>(null);
  const [defaultAccountBankLoading, setDefaultAccountBankLoading] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const snapshotRef = useRef<HTMLDivElement | null>(null);
  const qrImageRef = useRef<HTMLImageElement | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const roomsQuery = useQuery({
    queryKey: ['rooms', 1],
    queryFn: () => roomsApi.getRooms({ page: 1, limit: 20 }),
  });

  const roomBillsQuery = useQuery({
    queryKey: ['room-bills', filters.roomId, filters.billingMonth, filters.page],
    queryFn: () =>
      roomBillsApi.getRoomBills({
        roomId: filters.roomId,
        billingMonth: filters.billingMonth,
        page: filters.page,
        limit: filters.limit,
      }),
  });

  const createMutation = useMutation({
    mutationFn: roomBillsApi.createRoomBill,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['room-bills'] });
      messageApi.success('Tạo hóa đơn thành công');
    },
    onError: () => messageApi.error('Không thể tạo hóa đơn'),
  });

  const updateMutation = useMutation({
    mutationFn: roomBillsApi.updateRoomBill,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['room-bills'] });
      messageApi.success('Cập nhật hóa đơn thành công');
    },
    onError: () => messageApi.error('Không thể cập nhật hóa đơn'),
  });

  const rooms = useMemo(() => roomsQuery.data?.items ?? [], [roomsQuery.data]);
  const roomMap = useMemo(
    () => Object.fromEntries(rooms.map((room: any) => [room._id, room.name])),
    [rooms],
  );
  const roomBills = useMemo(() => roomBillsQuery.data?.items ?? [], [roomBillsQuery.data]);
  const roomBillsPagination = roomBillsQuery.data?.pagination;

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setSelectedRoomPricing(null);
    form.setFieldsValue({
      billingMonth: dayjs(),
      otherFees: [],
    });
    setDrawerOpen(true);
  };

  const watchedRoomId = Form.useWatch('roomId', form);
  const watchedBillingMonth = Form.useWatch('billingMonth', form);

  useEffect(() => {
    const fillDefaultsFromRoomAndPreviousBill = async () => {
      if (!drawerOpen || editingRecord || !watchedRoomId || !watchedBillingMonth) {
        return;
      }

      const selectedRoom =
        rooms.find((item: any) => item._id === watchedRoomId) ??
        (await roomsApi.getRoomById(watchedRoomId));
      setSelectedRoomPricing({
        electricityUnitPrice: selectedRoom.electricityUnitPrice ?? 0,
        waterUnitPrice: selectedRoom.waterUnitPrice ?? 0,
      });
      const previousMonth = dayjs(watchedBillingMonth).format('YYYY-MM');
      const previousBillResponse = await roomBillsApi.getRoomBills({
        roomId: watchedRoomId,
        beforeMonth: previousMonth,
        fields: 'electricityNewReading,waterNewReading',
        page: 1,
        limit: 1,
      });
      const previousBill = previousBillResponse.items?.[0];

      const electricityOldReading = previousBill?.electricityNewReading ?? 0;
      const waterOldReading = previousBill?.waterNewReading ?? 0;

      form.setFieldsValue({
        electricityOldReading,
        electricityNewReading: electricityOldReading,
        waterOldReading,
        waterNewReading: waterOldReading + 2,
        wifiFee: selectedRoom.wifiFee,
        trashFee: selectedRoom.trashFee,
        monthlyRent: selectedRoom.monthlyRent,
      });
    };

    fillDefaultsFromRoomAndPreviousBill().catch(() => {
      messageApi.warning('Không lấy được dữ liệu tháng trước, dùng giá trị mặc định');
    });
  }, [
    drawerOpen,
    editingRecord,
    watchedRoomId,
    watchedBillingMonth,
    rooms,
    form,
    messageApi,
  ]);

  const handleOpenEdit = (record: any) => {
    setEditingRecord(record);
    setSelectedRoomPricing({
      electricityUnitPrice: record.roomId?.electricityUnitPrice ?? 0,
      waterUnitPrice: record.roomId?.waterUnitPrice ?? 0,
    });
    form.setFieldsValue({
      roomId: record.roomId?._id ?? record.roomId,
      billingMonth: dayjs(record.billingMonth, 'YYYY-MM'),
      electricityOldReading: record.electricityOldReading,
      electricityNewReading: record.electricityNewReading,
      waterOldReading: record.waterOldReading,
      waterNewReading: record.waterNewReading,
      wifiFee: record.wifiFee,
      trashFee: record.trashFee,
      monthlyRent: record.monthlyRent,
      note: record.note,
      otherFees: buildOtherFeesValue(record.otherFees),
    });
    setDrawerOpen(true);
  };

  const electricityOldReading = Form.useWatch('electricityOldReading', form) ?? 0;
  const electricityNewReading = Form.useWatch('electricityNewReading', form) ?? 0;
  const waterOldReading = Form.useWatch('waterOldReading', form) ?? 0;
  const waterNewReading = Form.useWatch('waterNewReading', form) ?? 0;
  const wifiFee = Form.useWatch('wifiFee', form) ?? 0;
  const trashFee = Form.useWatch('trashFee', form) ?? 0;
  const monthlyRent = Form.useWatch('monthlyRent', form) ?? 0;
  const otherFees = Form.useWatch('otherFees', form);

  const previewTotalAmount = useMemo(() => {
    const electricityUsed = Math.max(0, electricityNewReading - electricityOldReading);
    const waterUsed = Math.max(0, waterNewReading - waterOldReading);
    const electricityAmount =
      electricityUsed * (selectedRoomPricing?.electricityUnitPrice ?? 0);
    const waterAmount = waterUsed * (selectedRoomPricing?.waterUnitPrice ?? 0);
    const normalizedOtherFees = otherFees ?? [];
    const otherFeesTotal = normalizedOtherFees.reduce(
      (sum: number, fee: any) => sum + Number(fee?.amount ?? 0),
      0,
    );

    return (
      Number(monthlyRent) +
      electricityAmount +
      waterAmount +
      Number(wifiFee) +
      Number(trashFee) +
      otherFeesTotal
    );
  }, [
    electricityOldReading,
    electricityNewReading,
    waterOldReading,
    waterNewReading,
    selectedRoomPricing,
    monthlyRent,
    wifiFee,
    trashFee,
    otherFees,
  ]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      billingMonth: values.billingMonth.format('YYYY-MM'),
      otherFees: values.otherFees ?? [],
    };

    if (editingRecord?._id) {
      const updatedRecord = await updateMutation.mutateAsync({
        id: editingRecord._id,
        payload,
      });
      setDrawerOpen(false);
      setEditingRecord(null);
      form.resetFields();
      await handleOpenPreview(updatedRecord);
      return;
    }
    const createdRecord = await createMutation.mutateAsync(payload);
    setDrawerOpen(false);
    setEditingRecord(null);
    form.resetFields();
    await handleOpenPreview(createdRecord);
  };

  const handleOpenPreview = async (record: any) => {
    setPreviewRecord(record);
    setPreviewTenantName('');
    setPreviewOpen(true);
    setDefaultAccountBank(null);
    setDefaultAccountBankLoading(true);
    try {
      const roomId = record.roomId?._id ?? record.roomId;
      if (roomId) {
        const roomDetail = await roomsApi.getRoomById(roomId);
        setPreviewTenantName(roomDetail?.nameUser ?? '');
      }

      const data = await accountBanksApi.getDefault({ forceRefresh: true });
      if (!data) {
        throw new Error('Không có thông tin account bank để tạo mã QR');
      }
      setDefaultAccountBank(data);
    } catch {
      messageApi.error('Không có thông tin account bank để tạo mã QR');
    } finally {
      setDefaultAccountBankLoading(false);
    }
  };

  const createSnapshotBlob = async () => {
    if (!snapshotRef.current || !previewRecord) {
      return null;
    }

    if (qrImageRef.current && !qrImageRef.current.complete) {
      await new Promise((resolve, reject) => {
        const handleLoad = () => {
          qrImageRef.current?.removeEventListener('load', handleLoad);
          qrImageRef.current?.removeEventListener('error', handleError);
          resolve(null);
        };
        const handleError = () => {
          qrImageRef.current?.removeEventListener('load', handleLoad);
          qrImageRef.current?.removeEventListener('error', handleError);
          reject(new Error('QR image failed to load'));
        };
        qrImageRef.current?.addEventListener('load', handleLoad);
        qrImageRef.current?.addEventListener('error', handleError);
      });
    }

    const canvas = await html2canvas(snapshotRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const handleDownloadSnapshot = async () => {
    setSnapshotLoading(true);
    try {
      const blob = await createSnapshotBlob();
      if (!blob) {
        throw new Error('Snapshot is empty');
      }
      const imageUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `room-bill-${previewRecord.billingMonth}-${previewRecord._id}.png`;
      link.click();
      URL.revokeObjectURL(imageUrl);
      messageApi.success('Đã tải snapshot hình ảnh');
    } catch {
      messageApi.error('Không thể tải snapshot hình ảnh');
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleCopySnapshot = async () => {
    setSnapshotLoading(true);
    try {
      const blob = await createSnapshotBlob();
      if (!blob || typeof ClipboardItem === 'undefined') {
        throw new Error('Clipboard image unsupported');
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      messageApi.success('Đã copy snapshot vào clipboard');
    } catch {
      messageApi.error('Không thể copy snapshot vào clipboard');
    } finally {
      setSnapshotLoading(false);
    }
  };

  const columns = [
    {
      title: 'Phòng',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (value: any) => roomMap[value?._id ?? value] ?? '-',
    },
    {
      title: 'Tháng',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
    },
    {
      title: 'Điện',
      children: [
        {
          title: 'Số cũ',
          dataIndex: 'electricityOldReading',
          key: 'electricityOldReading',
        },
        {
          title: 'Số mới',
          dataIndex: 'electricityNewReading',
          key: 'electricityNewReading',
        },
      ],
    },
    {
      title: 'Nước',
      children: [
        {
          title: 'Số cũ',
          dataIndex: 'waterOldReading',
          key: 'waterOldReading',
        },
        {
          title: 'Số mới',
          dataIndex: 'waterNewReading',
          key: 'waterNewReading',
        },
      ],
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value: number) => formatCurrencyVnd(value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleOpenPreview(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
        </Space>
      ),
    },
  ];

  const previewQrUrl = useMemo(() => {
    if (!previewRecord || !defaultAccountBank) {
      return '';
    }

    const roomName = roomMap[previewRecord.roomId?._id ?? previewRecord.roomId] ?? '';
    const transferContent = `${roomName} ${previewRecord.billingMonth}`.trim();
    return buildVietQrImageUrlFromAccountBank({
      accountBank: defaultAccountBank,
      amount: previewRecord.totalAmount ?? 0,
      addInfo: transferContent,
    });
  }, [previewRecord, defaultAccountBank, roomMap]);

  return (
    <>
      {contextHolder}
      <Card
        title="Quản lý Room Bills"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => roomBillsQuery.refetch()}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Tạo bill
            </Button>
          </Space>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 220 }}
            placeholder="Lọc theo phòng"
            allowClear
            options={rooms.map((room: any) => ({
              value: room._id,
              label: room.name,
            }))}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                roomId: value,
                page: 1,
              }))
            }
          />
          <DatePicker
            picker="month"
            placeholder="Lọc theo tháng"
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                billingMonth: value ? value.format('YYYY-MM') : undefined,
                page: 1,
              }))
            }
          />
        </Space>
        <Table
          rowKey="_id"
          columns={columns}
          loading={roomBillsQuery.isLoading}
          dataSource={roomBills}
          pagination={{
            current: roomBillsPagination?.page ?? 1,
            pageSize: roomBillsPagination?.limit ?? 20,
            total: roomBillsPagination?.totalItems ?? 0,
            showSizeChanger: false,
          }}
          onChange={(pager) =>
            setFilters((prev) => ({
              ...prev,
              page: pager.current ?? 1,
              limit: pager.pageSize ?? 20,
            }))
          }
        />
      </Card>

      <Drawer
        title={editingRecord ? 'Cập nhật room bill' : 'Tạo room bill'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingRecord(null);
        }}
        width={560}
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item name="roomId" label="Phòng" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn phòng"
              options={rooms.map((room: any) => ({
                value: room._id,
                label: room.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="billingMonth"
            label="Tháng chốt"
            rules={[{ required: true }]}
          >
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="electricityOldReading"
            label="Số điện cũ"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="electricityNewReading"
            label="Số điện mới"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="waterOldReading"
            label="Số nước cũ"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="waterNewReading"
            label="Số nước mới"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="wifiFee" label="Phí wifi">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item name="trashFee" label="Phí rác">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.Item name="monthlyRent" label="Tiền thuê tháng">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={vndFormatter}
              parser={vndParser}
            />
          </Form.Item>
          <Form.List name="otherFees">
            {(fields, { add, remove }) => (
              <>
                <Space style={{ marginBottom: 8 }}>
                  <strong>Chi phí phát sinh</strong>
                  <Button onClick={() => add({ name: '', amount: 0 })}>Thêm chi phí</Button>
                </Space>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex' }}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      rules={[{ required: true, message: 'Nhập tên phí' }]}
                    >
                      <Input placeholder="Tên phí" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'amount']}
                      rules={[{ required: true, message: 'Nhập số tiền' }]}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Số tiền"
                        formatter={vndFormatter}
                        parser={vndParser}
                      />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
              </>
            )}
          </Form.List>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Divider style={{ marginTop: 8 }} />
          <Form.Item label="Tổng tiền (tính tạm)">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {formatCurrencyVnd(previewTotalAmount)}
            </Typography.Title>
            <Typography.Text type="secondary">
              Công thức: tiền thuê + (điện mới - điện cũ) x đơn giá điện + (nước mới - nước
              cũ) x đơn giá nước + các loại phí.
            </Typography.Text>
          </Form.Item>
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingRecord ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form>
      </Drawer>

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Preview Room Bill</span>
            <Space>
              <Tooltip title="Copy snapshot">
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopySnapshot}
                  loading={snapshotLoading}
                />
              </Tooltip>
              <Tooltip title="Tải xuống">
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadSnapshot}
                  loading={snapshotLoading}
                />
              </Tooltip>
              <Button
                size="small"
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setPreviewOpen(false)}
              />
            </Space>
          </div>
        }
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        closable={false}
        footer={null}
        width={900}
      >
        {previewRecord && (
          <div
            ref={snapshotRef}
            style={{
              width: '70%',
              margin: '0 auto',
              background: '#fff',
              padding: 20,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  Hoá đơn tiền phòng
                </Typography.Title>
                <Typography.Paragraph style={{ marginBottom: 8 }}>
                  Người thuê:{' '}
                  <strong>{previewTenantName || previewRecord.roomId?.nameUser || '-'}</strong>
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 8 }}>
                  Tháng: <strong>{previewRecord.billingMonth}</strong>
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  Điện: {previewRecord.electricityOldReading} → {previewRecord.electricityNewReading}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 8 }}>
                  Nước: {previewRecord.waterOldReading} → {previewRecord.waterNewReading}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  Tiền thuê: {formatCurrencyVnd(previewRecord.monthlyRent)}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  Tiền điện: {formatCurrencyVnd(previewRecord.electricityAmount)}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  Tiền nước: {formatCurrencyVnd(previewRecord.waterAmount)}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  Phí wifi: {formatCurrencyVnd(previewRecord.wifiFee)}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 4 }}>
                  Phí rác: {formatCurrencyVnd(previewRecord.trashFee)}
                </Typography.Paragraph>
                {(previewRecord.otherFees ?? []).length > 0 && (
                  <Typography.Paragraph style={{ marginBottom: 4 }}>
                    Phí phát sinh:{' '}
                    {(previewRecord.otherFees ?? [])
                      .map((fee: any) => `${fee.name}: ${formatCurrencyVnd(fee.amount)}`)
                      .join(' | ')}
                  </Typography.Paragraph>
                )}
                {previewRecord.note ? (
                  <Typography.Paragraph style={{ marginBottom: 8 }}>
                    Ghi chú: {previewRecord.note}
                  </Typography.Paragraph>
                ) : null}
                <Divider style={{ margin: '12px 0' }} />
                <Typography.Title level={3} style={{ marginBottom: 0 }}>
                  Tổng tiền: {formatCurrencyVnd(previewRecord.totalAmount)}
                </Typography.Title>
              </div>
              <div style={{ width: 280, textAlign: 'center' }}>
                <Typography.Title level={5}>Mã QR thanh toán</Typography.Title>
                {previewQrUrl ? (
                  <img
                    ref={qrImageRef}
                    src={previewQrUrl}
                    alt="VietQR thanh toán"
                    crossOrigin="anonymous"
                    style={{
                      width: 240,
                      maxWidth: '100%',
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                    }}
                  />
                ) : defaultAccountBankLoading ? (
                  <Typography.Text type="secondary">Đang tải mã QR...</Typography.Text>
                ) : (
                  <Typography.Text type="secondary">
                    Chưa có mã QR để hiển thị.
                  </Typography.Text>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
