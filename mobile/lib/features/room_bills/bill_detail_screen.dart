import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../models/api_models.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../utils/viet_qr.dart';
import '../../widgets/app_card.dart';
import 'bill_snapshot_card.dart';
import 'create_room_bill_screen.dart';

class BillDetailScreen extends ConsumerStatefulWidget {
  const BillDetailScreen({
    super.key,
    required this.bill,
    required this.room,
    required this.rooms,
  });

  final RoomBill bill;
  final Room? room;
  final List<Room> rooms;

  @override
  ConsumerState<BillDetailScreen> createState() => _BillDetailScreenState();
}

class _BillDetailScreenState extends ConsumerState<BillDetailScreen> {
  final _snapshotKey = GlobalKey();
  var _capturing = false;
  var _changed = false;
  String? _qrUrl;
  late RoomBill _bill;
  Room? _room;

  @override
  void initState() {
    super.initState();
    _bill = widget.bill;
    _room = widget.room ?? widget.bill.room;
    _loadQr();
  }

  Future<void> _loadQr() async {
    final bank = await ref.read(accountBanksRepositoryProvider).getDefault();
    final roomName = _bill.roomName ?? _room?.name ?? '';
    if (!mounted) return;
    setState(() {
      _qrUrl = buildVietQrImageUrlFromAccountBank(
        bank: bank?.bank,
        accountNumber: bank?.accountNumber,
        customerName: bank?.customerName,
        amount: _bill.totalAmount,
        addInfo: '$roomName ${_bill.billingMonth}'.trim(),
      );
    });
  }

  String get _tenantName =>
      _room?.nameUser ?? _bill.room?.nameUser ?? '—';

  Future<Uint8List?> _capturePng() async {
    final boundary =
        _snapshotKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    if (boundary == null) return null;
    final image = await boundary.toImage(pixelRatio: 3);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    return byteData?.buffer.asUint8List();
  }

  Future<void> _shareSnapshot() async {
    setState(() => _capturing = true);
    try {
      await Future<void>.delayed(const Duration(milliseconds: 100));
      final bytes = await _capturePng();
      if (bytes == null || !mounted) {
        throw StateError('Không tạo được ảnh');
      }
      final file = XFile.fromData(
        bytes,
        name: 'hoa-don-${_bill.billingMonth}.png',
        mimeType: 'image/png',
      );
      await SharePlus.instance.share(
        ShareParams(
          files: [file],
          text: 'Hóa đơn ${_bill.billingMonth}',
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi chia sẻ: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _capturing = false);
    }
  }

  Future<void> _edit() async {
    final result = await Navigator.of(context).push<RoomBill?>(
      MaterialPageRoute(
        builder: (_) => CreateRoomBillScreen(
          rooms: widget.rooms,
          bill: _bill,
          initialRoomId: _bill.roomId,
        ),
      ),
    );
    if (result != null && mounted) {
      setState(() {
        _bill = result;
        _room = result.room ?? _room;
        _changed = true;
      });
      _loadQr();
    }
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: const Text('Xóa hóa đơn?'),
        content: Text('Xóa hóa đơn tháng ${_bill.billingMonth}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: const Text('Xóa')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    try {
      await ref.read(roomBillsRepositoryProvider).deleteRoomBill(
            _bill.id,
            _bill.roomId,
          );
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bill = _bill;
    final qrWidget = _qrUrl != null && _qrUrl!.isNotEmpty
        ? Image.network(_qrUrl!, width: 220, height: 220, fit: BoxFit.contain)
        : const Padding(
            padding: EdgeInsets.all(24),
            child: Text('Chưa có mã QR', style: TextStyle(color: AppColors.textSecondary)),
          );

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(_changed ? true : null),
        ),
        title: Text('Hóa đơn · ${bill.billingMonth}'),
        actions: [
          IconButton(
            tooltip: 'Chụp / chia sẻ',
            onPressed: _capturing ? null : _shareSnapshot,
            icon: _capturing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.ios_share),
          ),
          IconButton(
            tooltip: 'Sửa hóa đơn',
            icon: const Icon(Icons.edit_outlined),
            onPressed: _edit,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Chỉ số & quy đổi',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                ),
                const SizedBox(height: 12),
                _MetricBlock(
                  title: 'Điện',
                  oldVal: bill.electricityOldReading,
                  newVal: bill.electricityNewReading,
                  used: bill.electricityUsed,
                  unitPrice: _room?.electricityUnitPrice,
                  amount: bill.electricityAmount,
                ),
                const Divider(height: 20),
                _MetricBlock(
                  title: 'Nước',
                  oldVal: bill.waterOldReading,
                  newVal: bill.waterNewReading,
                  used: bill.waterUsed,
                  unitPrice: _room?.waterUnitPrice,
                  amount: bill.waterAmount,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Các khoản phí',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                ),
                const SizedBox(height: 8),
                DetailRow(label: 'Tiền thuê', value: formatCurrencyVnd(bill.monthlyRent)),
                DetailRow(
                  label: 'Tiền điện',
                  value: _room != null
                      ? formatUsageAmountFormula(
                          used: bill.electricityUsed,
                          unitPrice: _room!.electricityUnitPrice,
                          amount: bill.electricityAmount,
                        )
                      : formatCurrencyVnd(bill.electricityAmount),
                ),
                DetailRow(
                  label: 'Tiền nước',
                  value: _room != null
                      ? formatUsageAmountFormula(
                          used: bill.waterUsed,
                          unitPrice: _room!.waterUnitPrice,
                          amount: bill.waterAmount,
                        )
                      : formatCurrencyVnd(bill.waterAmount),
                ),
                DetailRow(label: 'Phí wifi', value: formatCurrencyVnd(bill.wifiFee)),
                DetailRow(label: 'Phí rác', value: formatCurrencyVnd(bill.trashFee)),
                for (final fee in bill.otherFees)
                  DetailRow(
                    label: fee.name,
                    value: formatCurrencyVnd(fee.amount),
                  ),
                const Divider(),
                DetailRow(
                  label: 'Tổng cộng',
                  value: formatCurrencyVnd(bill.totalAmount),
                  bold: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.tonal(
            onPressed: _edit,
            child: const Text('Chỉnh sửa hóa đơn'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: _delete,
            child: const Text('Xóa hóa đơn'),
          ),
          const SizedBox(height: 16),
          const Text(
            'Xem trước khi chụp (giống web)',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          RepaintBoundary(
            key: _snapshotKey,
            child: BillSnapshotCard(
              bill: bill,
              tenantName: _tenantName,
              room: _room ?? bill.room,
              qrImage: qrWidget,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricBlock extends StatelessWidget {
  const _MetricBlock({
    required this.title,
    required this.oldVal,
    required this.newVal,
    required this.used,
    required this.amount,
    this.unitPrice,
  });

  final String title;
  final double oldVal;
  final double newVal;
  final double used;
  final double amount;
  final double? unitPrice;

  String get _amountLine {
    if (unitPrice == null) return formatCurrencyVnd(amount);
    return formatUsageAmountFormula(
      used: used,
      unitPrice: unitPrice!,
      amount: amount,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
        const SizedBox(height: 8),
        Text(
          formatMeterReadingLine(
            oldReading: oldVal,
            newReading: newVal,
            used: used,
          ),
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            'Tiền ${title.toLowerCase()}: $_amountLine',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
