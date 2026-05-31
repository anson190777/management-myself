import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/api_models.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/app_card.dart';
import 'bill_detail_screen.dart';
import 'create_room_bill_screen.dart';

final allRoomsForBillsProvider = FutureProvider.autoDispose((ref) async {
  return ref.read(roomsRepositoryProvider).getRooms(page: 1, limit: 500);
});

typedef BillQuery = ({String? roomId, String? billingYear, int page});

final roomBillsListProvider =
    FutureProvider.autoDispose.family<PaginatedResponse<RoomBill>, BillQuery>((ref, q) {
  return ref.read(roomBillsRepositoryProvider).getRoomBills(
        roomId: q.roomId,
        billingYear: q.billingYear,
        page: q.page,
        limit: 20,
      );
});

class RoomBillsScreen extends ConsumerStatefulWidget {
  const RoomBillsScreen({super.key});

  @override
  ConsumerState<RoomBillsScreen> createState() => _RoomBillsScreenState();
}

class _RoomBillsScreenState extends ConsumerState<RoomBillsScreen> {
  String? _roomId;
  String _year = DateTime.now().year.toString();
  var _page = 1;

  BillQuery get _query => (roomId: _roomId, billingYear: _year, page: _page);

  void _refresh() => ref.invalidate(roomBillsListProvider(_query));

  Room? _roomForBill(RoomBill bill, List<Room> rooms) {
    return bill.room ??
        rooms.where((r) => r.id == bill.roomId).firstOrNull;
  }

  Future<void> _openDetail(RoomBill bill, List<Room> rooms) async {
    final room = _roomForBill(bill, rooms);
    final changed = await Navigator.of(context, rootNavigator: true).push<bool>(
      MaterialPageRoute(
        builder: (_) => BillDetailScreen(
          bill: bill,
          room: room,
          rooms: rooms,
        ),
      ),
    );
    if (changed == true) _refresh();
  }

  Future<void> _openCreate(List<Room> rooms) async {
    if (rooms.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chưa có phòng — tạo phòng trước')),
      );
      return;
    }

    final saved = await Navigator.of(context, rootNavigator: true).push<bool>(
      MaterialPageRoute(
        builder: (_) => CreateRoomBillScreen(
          rooms: rooms,
          initialRoomId: _roomId,
        ),
      ),
    );

    if (saved != true || !mounted) return;
    _refresh();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đã tạo hóa đơn')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final roomsAsync = ref.watch(allRoomsForBillsProvider);
    final billsAsync = _roomId == null
        ? const AsyncValue<PaginatedResponse<RoomBill>>.data(
            PaginatedResponse(
              items: [],
              pagination: Pagination(page: 1, limit: 20, totalItems: 0, totalPages: 1),
            ),
          )
        : ref.watch(roomBillsListProvider(_query));

    return roomsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Lỗi: $e')),
      data: (roomsPage) {
        final rooms = roomsPage.items;
        if (_roomId == null && rooms.isNotEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) setState(() => _roomId = rooms.first.id);
          });
        }

        return Scaffold(
          backgroundColor: AppColors.surface,
          body: RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: SectionHeader(
                    title: 'Hóa đơn phòng',
                    subtitle: 'Chạm một dòng để xem chi tiết & chụp ảnh',
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      children: [
                        Expanded(
                          child: DropdownMenu<String>(
                            initialSelection: _roomId,
                            label: const Text('Phòng'),
                            expandedInsets: EdgeInsets.zero,
                            dropdownMenuEntries: [
                              for (final r in rooms)
                                DropdownMenuEntry(value: r.id, label: r.name),
                            ],
                            onSelected: (v) => setState(() {
                              _roomId = v;
                              _page = 1;
                            }),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownMenu<String>(
                            initialSelection: _year,
                            label: const Text('Năm'),
                            expandedInsets: EdgeInsets.zero,
                            dropdownMenuEntries: [
                              for (var y = DateTime.now().year + 1; y >= 2024; y--)
                                DropdownMenuEntry(value: '$y', label: '$y'),
                            ],
                            onSelected: (v) => setState(() {
                              _year = v!;
                              _page = 1;
                            }),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 12)),
                billsAsync.when(
                  loading: () => const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (e, _) => SliverFillRemaining(
                    child: Center(child: Text('Lỗi: $e')),
                  ),
                  data: (page) {
                    if (page.items.isEmpty) {
                      return const SliverFillRemaining(
                        child: Center(child: Text('Chưa có hóa đơn trong năm này')),
                      );
                    }
                    return SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 88),
                      sliver: SliverList.separated(
                        itemCount: page.items.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 10),
                        itemBuilder: (context, i) {
                          final bill = page.items[i];
                          return AppCard(
                            onTap: () => _openDetail(bill, rooms),
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    Icons.receipt_long,
                                    color: AppColors.primary,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        bill.billingMonth,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Điện ${bill.electricityOldReading.toStringAsFixed(0)}→${bill.electricityNewReading.toStringAsFixed(0)} · '
                                        'Nước ${bill.waterOldReading.toStringAsFixed(0)}→${bill.waterNewReading.toStringAsFixed(0)}',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      formatCurrencyVnd(bill.totalAmount),
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    const Icon(
                                      Icons.chevron_right,
                                      color: AppColors.textSecondary,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => _openCreate(rooms),
            icon: const Icon(Icons.add),
            label: const Text('Tạo hóa đơn'),
          ),
        );
      },
    );
  }
}
