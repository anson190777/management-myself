import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/api_models.dart';
import '../../sheets/calculations/room_bill_calc.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';

class CreateRoomBillScreen extends ConsumerStatefulWidget {
  const CreateRoomBillScreen({
    super.key,
    required this.rooms,
    this.initialRoomId,
    this.bill,
  });

  final List<Room> rooms;
  final String? initialRoomId;
  final RoomBill? bill;

  bool get isEditing => bill != null;

  @override
  ConsumerState<CreateRoomBillScreen> createState() => _CreateRoomBillScreenState();
}

class _CreateRoomBillScreenState extends ConsumerState<CreateRoomBillScreen> {
  static const _fieldGap = 16.0;

  late String _roomId;
  late final TextEditingController _monthCtrl;
  late final TextEditingController _elecOld;
  late final TextEditingController _elecNew;
  late final TextEditingController _waterOld;
  late final TextEditingController _waterNew;
  var _saving = false;
  var _loadingPrevious = false;

  static final _billingMonthPattern = RegExp(r'^\d{4}-\d{2}$');

  @override
  void initState() {
    super.initState();
    final bill = widget.bill;
    _roomId = bill?.roomId ?? widget.initialRoomId ?? widget.rooms.first.id;
    final now = DateTime.now();
    _monthCtrl = TextEditingController(
      text: bill?.billingMonth ??
          '${now.year}-${now.month.toString().padLeft(2, '0')}',
    );
    _elecOld = TextEditingController(
      text: bill?.electricityOldReading.toStringAsFixed(0) ?? '0',
    );
    _elecNew = TextEditingController(
      text: bill?.electricityNewReading.toStringAsFixed(0) ?? '0',
    );
    _waterOld = TextEditingController(
      text: bill?.waterOldReading.toStringAsFixed(0) ?? '0',
    );
    _waterNew = TextEditingController(
      text: bill?.waterNewReading.toStringAsFixed(0) ?? '0',
    );
    if (!widget.isEditing) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _fillOldReadingsFromPreviousBill());
    }
  }

  /// Lấy số điện/nước cũ từ chỉ số mới của hóa đơn gần nhất trước [billingMonth]
  /// (vd. tạo 2026-01 → lấy từ 2025-12 nếu có).
  Future<void> _fillOldReadingsFromPreviousBill() async {
    if (widget.isEditing) return;
    final billingMonth = _monthCtrl.text.trim();
    if (!_billingMonthPattern.hasMatch(billingMonth)) return;

    setState(() => _loadingPrevious = true);
    try {
      final page = await ref.read(roomBillsRepositoryProvider).getRoomBills(
            roomId: _roomId,
            beforeMonth: billingMonth,
            limit: 1,
            page: 1,
          );
      if (!mounted) return;
      final previous = page.items.firstOrNull;
      if (previous != null) {
        _elecOld.text = previous.electricityNewReading.toStringAsFixed(0);
        _waterOld.text = previous.waterNewReading.toStringAsFixed(0);
      } else {
        _elecOld.text = '0';
        _waterOld.text = '0';
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Không lấy được dữ liệu tháng trước, dùng giá trị mặc định'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingPrevious = false);
    }
  }

  @override
  void dispose() {
    _monthCtrl.dispose();
    _elecOld.dispose();
    _elecNew.dispose();
    _waterOld.dispose();
    _waterNew.dispose();
    super.dispose();
  }

  double _parse(String s) =>
      double.tryParse(s.replaceAll(RegExp(r'[^\d.]'), '')) ?? 0;

  RoomBillInput get _input => RoomBillInput(
        roomId: _roomId,
        billingMonth: _monthCtrl.text.trim(),
        electricityOldReading: _parse(_elecOld.text),
        electricityNewReading: _parse(_elecNew.text),
        waterOldReading: _parse(_waterOld.text),
        waterNewReading: _parse(_waterNew.text),
      );

  Future<void> _save() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      final repo = ref.read(roomBillsRepositoryProvider);
      if (widget.isEditing) {
        final updated = await repo.updateRoomBill(
          widget.bill!.id,
          widget.bill!.roomId,
          _input,
        );
        if (mounted) Navigator.of(context).pop(updated);
      } else {
        await repo.createRoomBill(_input);
        if (mounted) Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _saving ? null : () => Navigator.of(context).pop(),
        ),
        title: Text(widget.isEditing ? 'Sửa hóa đơn' : 'Tạo hóa đơn'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (widget.isEditing)
                      InputDecorator(
                        decoration: const InputDecoration(labelText: 'Phòng'),
                        child: Text(
                          widget.rooms
                                  .where((r) => r.id == _roomId)
                                  .firstOrNull
                                  ?.name ??
                              widget.bill?.roomName ??
                              '—',
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                      )
                    else
                      DropdownMenu<String>(
                        initialSelection: _roomId,
                        label: const Text('Phòng'),
                        expandedInsets: EdgeInsets.zero,
                        dropdownMenuEntries: [
                          for (final r in widget.rooms)
                            DropdownMenuEntry(value: r.id, label: r.name),
                        ],
                        onSelected: (v) {
                          if (v == null) return;
                          setState(() => _roomId = v);
                          _fillOldReadingsFromPreviousBill();
                        },
                      ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _monthCtrl,
                      decoration: InputDecoration(
                        labelText: 'Tháng (YYYY-MM)',
                        suffixIcon: _loadingPrevious
                            ? const Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              )
                            : null,
                      ),
                      onChanged: (_) => _fillOldReadingsFromPreviousBill(),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _elecOld,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Số điện cũ'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _elecNew,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Số điện mới'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _waterOld,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Số nước cũ'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _waterNew,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Số nước mới'),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: FilledButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Lưu'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
