import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/api_models.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/app_card.dart';
import 'room_detail_screen.dart';
import 'room_form_screen.dart';

final roomsListProvider = FutureProvider.autoDispose
    .family<PaginatedResponse<Room>, int>((ref, page) async {
  return ref.read(roomsRepositoryProvider).getRooms(page: page, limit: 20);
});

class RoomsScreen extends ConsumerStatefulWidget {
  const RoomsScreen({super.key});

  @override
  ConsumerState<RoomsScreen> createState() => _RoomsScreenState();
}

class _RoomsScreenState extends ConsumerState<RoomsScreen> {
  var _page = 1;
  var _search = '';

  void _refresh() => ref.invalidate(roomsListProvider(_page));

  Future<void> _openForm({Room? room}) async {
    final saved = await Navigator.of(context, rootNavigator: true).push<bool>(
      MaterialPageRoute(
        builder: (_) => RoomFormScreen(room: room),
      ),
    );

    if (saved != true || !mounted) return;
    _refresh();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(room == null ? 'Đã tạo phòng' : 'Đã cập nhật phòng')),
    );
  }

  Future<void> _openDetail(Room room) async {
    final changed = await Navigator.of(context, rootNavigator: true).push<bool>(
      MaterialPageRoute(builder: (_) => RoomDetailScreen(room: room)),
    );
    if (changed == true) _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final roomsAsync = ref.watch(roomsListProvider(_page));

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: roomsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Lỗi: $e')),
        data: (page) {
          final keyword = _search.trim().toLowerCase();
          final filtered = keyword.isEmpty
              ? page.items
              : page.items.where((r) {
                  return r.name.toLowerCase().contains(keyword) ||
                      r.nameUser.toLowerCase().contains(keyword);
                }).toList();

          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: SectionHeader(
                    title: 'Quản lý phòng',
                    subtitle: '${page.pagination.totalItems} phòng',
                    trailing: IconButton.filled(
                      onPressed: () => _openForm(),
                      icon: const Icon(Icons.add),
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  sliver: SliverToBoxAdapter(
                    child: TextField(
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.search),
                        hintText: 'Tìm phòng hoặc người thuê',
                      ),
                      onChanged: (v) => setState(() => _search = v),
                    ),
                  ),
                ),
                if (filtered.isEmpty)
                  const SliverFillRemaining(
                    child: Center(child: Text('Không có phòng')),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 88),
                    sliver: SliverList.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 10),
                      itemBuilder: (context, i) {
                        final room = filtered[i];
                        return AppCard(
                          onTap: () => _openDetail(room),
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: AppColors.primaryLight,
                                child: Text(
                                  room.name.isNotEmpty ? room.name[0].toUpperCase() : '?',
                                  style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      room.name,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 16,
                                      ),
                                    ),
                                    Text(
                                      room.nameUser,
                                      style: const TextStyle(
                                        color: AppColors.textSecondary,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    formatCurrencyVnd(room.monthlyRent),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (!room.isActive)
                                    const Text(
                                      'Tắt',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.orange,
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                if (page.pagination.totalPages > 1)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            onPressed: _page > 1
                                ? () => setState(() {
                                      _page--;
                                      _refresh();
                                    })
                                : null,
                            icon: const Icon(Icons.chevron_left),
                          ),
                          Text('Trang $_page / ${page.pagination.totalPages}'),
                          IconButton(
                            onPressed: _page < page.pagination.totalPages
                                ? () => setState(() {
                                      _page++;
                                      _refresh();
                                    })
                                : null,
                            icon: const Icon(Icons.chevron_right),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        icon: const Icon(Icons.add),
        label: const Text('Thêm phòng'),
      ),
    );
  }

}
