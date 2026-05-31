import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/api_models.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/app_card.dart';
import 'room_form_screen.dart';

class RoomDetailScreen extends ConsumerWidget {
  const RoomDetailScreen({super.key, required this.room});

  final Room room;

  Future<void> _edit(BuildContext context) async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => RoomFormScreen(room: room)),
    );
    if (saved == true && context.mounted) {
      Navigator.of(context).pop(true);
    }
  }

  Future<void> _delete(BuildContext context, WidgetRef ref) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (d) => AlertDialog(
        title: const Text('Xóa phòng?'),
        content: Text('Xóa "${room.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(d, false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.pop(d, true), child: const Text('Xóa')),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    try {
      await ref.read(roomsRepositoryProvider).deleteRoom(room.id);
      ref.read(roomBillsRepositoryProvider).resetTabCache();
      if (context.mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(room.name),
        actions: [
          IconButton(
            tooltip: 'Sửa phòng',
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => _edit(context),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Text(
            room.nameUser,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 16),
          ),
          const SizedBox(height: 16),
          AppCard(
            child: Column(
              children: [
                _row('Tiền thuê', formatCurrencyVnd(room.monthlyRent)),
                _row('Điện', formatCurrencyVnd(room.electricityUnitPrice)),
                _row('Nước', formatCurrencyVnd(room.waterUnitPrice)),
                _row('Wifi', formatCurrencyVnd(room.wifiFee)),
                _row('Rác', formatCurrencyVnd(room.trashFee)),
                _row('Trạng thái', room.isActive ? 'Hoạt động' : 'Tắt'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.tonal(
            onPressed: () => _edit(context),
            child: const Text('Chỉnh sửa phòng'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => _delete(context, ref),
            child: const Text('Xóa phòng'),
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            SizedBox(
              width: 90,
              child: Text(label, style: const TextStyle(color: AppColors.textSecondary)),
            ),
            Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
          ],
        ),
      );
}
