import '../models/api_models.dart';

PaginatedResponse<T> paginateItems<T>(
  List<T> items, {
  int page = 1,
  int limit = 20,
}) {
  final safePage = page < 1 ? 1 : page;
  final safeLimit = limit < 1 ? 1 : (limit > 100 ? 100 : limit);
  final totalItems = items.length;
  final totalPages =
      totalItems == 0 ? 1 : (totalItems / safeLimit).ceil().clamp(1, 1 << 31);
  final start = (safePage - 1) * safeLimit;

  return PaginatedResponse(
    items: items.skip(start).take(safeLimit).toList(),
    pagination: Pagination(
      page: safePage,
      limit: safeLimit,
      totalItems: totalItems,
      totalPages: totalPages,
    ),
  );
}
