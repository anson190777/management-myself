import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/api_models.dart';
import '../../sheets/sheets_providers.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_card.dart';

final accountBanksListProvider = FutureProvider.autoDispose<List<AccountBank>>((ref) {
  return ref.read(accountBanksRepositoryProvider).loadAll();
});

class AccountBanksScreen extends ConsumerWidget {
  const AccountBanksScreen({super.key});

  Future<void> _openCreate(BuildContext context, WidgetRef ref) async {
    final codeCtrl = TextEditingController();
    final nameCtrl = TextEditingController();
    final bankCtrl = TextEditingController();
    final accCtrl = TextEditingController();
    var isDefault = false;

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 16,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
        ),
        child: StatefulBuilder(
          builder: (ctx, setModal) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Thêm tài khoản', style: Theme.of(ctx).textTheme.titleLarge),
              const SizedBox(height: 12),
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Mã KH')),
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Tên KH')),
              TextField(
                controller: bankCtrl,
                decoration: const InputDecoration(
                  labelText: 'Mã ngân hàng (VietQR)',
                  hintText: 'VD: VCB, TCB',
                ),
              ),
              TextField(controller: accCtrl, decoration: const InputDecoration(labelText: 'Số TK')),
              SwitchListTile(
                title: const Text('Mặc định'),
                value: isDefault,
                onChanged: (v) => setModal(() => isDefault = v),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Lưu'),
              ),
            ],
          ),
        ),
      ),
    );

    if (saved != true) return;

    try {
      await ref.read(accountBanksRepositoryProvider).create(
            customerCode: codeCtrl.text.trim(),
            customerName: nameCtrl.text.trim(),
            bank: bankCtrl.text.trim(),
            accountNumber: accCtrl.text.trim(),
            isDefault: isDefault,
          );
      ref.invalidate(accountBanksListProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã tạo tài khoản')));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listAsync = ref.watch(accountBanksListProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: listAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Lỗi: $e')),
        data: (items) => CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Tài khoản ngân hàng',
                subtitle: 'Dùng cho VietQR trên hóa đơn',
              ),
            ),
            if (items.isEmpty)
              const SliverFillRemaining(
                child: Center(child: Text('Chưa có tài khoản')),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 88),
                sliver: SliverList.separated(
                  itemCount: items.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final bank = items[i];
                    return AppCard(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      child: Row(
                        children: [
                          Icon(
                            bank.isDefault ? Icons.star_rounded : Icons.account_balance,
                            color: bank.isDefault ? Colors.amber.shade700 : AppColors.primary,
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  bank.customerName,
                                  style: const TextStyle(fontWeight: FontWeight.w700),
                                ),
                                Text(
                                  '${bank.bank} · ${bank.accountNumber}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          PopupMenuButton<String>(
                            onSelected: (action) async {
                              final repo = ref.read(accountBanksRepositoryProvider);
                              try {
                                if (action == 'default') {
                                  await repo.setDefault(bank.id);
                                } else if (action == 'delete') {
                                  await repo.remove(bank.id);
                                }
                                ref.invalidate(accountBanksListProvider);
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Lỗi: $e')),
                                  );
                                }
                              }
                            },
                            itemBuilder: (_) => [
                              if (!bank.isDefault)
                                const PopupMenuItem(
                                  value: 'default',
                                  child: Text('Đặt mặc định'),
                                ),
                              const PopupMenuItem(value: 'delete', child: Text('Xóa')),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openCreate(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Thêm TK'),
      ),
    );
  }
}
