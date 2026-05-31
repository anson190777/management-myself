import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/api_models.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';

class RoomFormScreen extends ConsumerStatefulWidget {
  const RoomFormScreen({super.key, this.room});

  final Room? room;

  bool get isEditing => room != null;

  @override
  ConsumerState<RoomFormScreen> createState() => _RoomFormScreenState();
}

class _RoomFormScreenState extends ConsumerState<RoomFormScreen> {
  static const _fieldGap = 16.0;

  late final TextEditingController _nameCtrl;
  late final TextEditingController _userCtrl;
  late final TextEditingController _rentCtrl;
  late final TextEditingController _elecCtrl;
  late final TextEditingController _waterCtrl;
  late final TextEditingController _wifiCtrl;
  late final TextEditingController _trashCtrl;
  late bool _isActive;
  var _saving = false;

  @override
  void initState() {
    super.initState();
    final room = widget.room;
    _nameCtrl = TextEditingController(text: room?.name ?? '');
    _userCtrl = TextEditingController(text: room?.nameUser ?? '');
    _rentCtrl = TextEditingController(
      text: room?.monthlyRent.toStringAsFixed(0) ?? '0',
    );
    _elecCtrl = TextEditingController(
      text: room?.electricityUnitPrice.toStringAsFixed(0) ?? '0',
    );
    _waterCtrl = TextEditingController(
      text: room?.waterUnitPrice.toStringAsFixed(0) ?? '0',
    );
    _wifiCtrl = TextEditingController(text: room?.wifiFee.toStringAsFixed(0) ?? '0');
    _trashCtrl = TextEditingController(text: room?.trashFee.toStringAsFixed(0) ?? '0');
    _isActive = room?.isActive ?? true;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _userCtrl.dispose();
    _rentCtrl.dispose();
    _elecCtrl.dispose();
    _waterCtrl.dispose();
    _wifiCtrl.dispose();
    _trashCtrl.dispose();
    super.dispose();
  }

  double _parse(String s) => double.tryParse(s.replaceAll(RegExp(r'[^\d]'), '')) ?? 0;

  Future<void> _save() async {
    if (_saving) return;
    setState(() => _saving = true);
    final repo = ref.read(roomsRepositoryProvider);
    try {
      if (widget.room == null) {
        await repo.createRoom(
          name: _nameCtrl.text.trim(),
          nameUser: _userCtrl.text.trim(),
          monthlyRent: _parse(_rentCtrl.text),
          electricityUnitPrice: _parse(_elecCtrl.text),
          waterUnitPrice: _parse(_waterCtrl.text),
          wifiFee: _parse(_wifiCtrl.text),
          trashFee: _parse(_trashCtrl.text),
          isActive: _isActive,
        );
      } else {
        await repo.updateRoom(
          widget.room!.id,
          name: _nameCtrl.text.trim(),
          nameUser: _userCtrl.text.trim(),
          monthlyRent: _parse(_rentCtrl.text),
          electricityUnitPrice: _parse(_elecCtrl.text),
          waterUnitPrice: _parse(_waterCtrl.text),
          wifiFee: _parse(_wifiCtrl.text),
          trashFee: _parse(_trashCtrl.text),
          isActive: _isActive,
        );
      }
      if (mounted) Navigator.of(context).pop(true);
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
        title: Text(widget.isEditing ? 'Sửa phòng' : 'Thêm phòng'),
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
                    TextField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(labelText: 'Tên phòng'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _userCtrl,
                      decoration: const InputDecoration(labelText: 'Người thuê'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _rentCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Tiền thuê'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _elecCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Đơn giá điện'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _waterCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Đơn giá nước'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _wifiCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Phí wifi'),
                    ),
                    const SizedBox(height: _fieldGap),
                    TextField(
                      controller: _trashCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Phí rác'),
                    ),
                    const SizedBox(height: 8),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Đang hoạt động'),
                      value: _isActive,
                      onChanged: _saving ? null : (v) => setState(() => _isActive = v),
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
