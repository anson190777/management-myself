import type { PaginatedResponse, Pagination } from '../../types/api';

export const paginateItems = <T>(
  items: T[],
  page = 1,
  limit = 20,
): PaginatedResponse<T> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
  const start = (safePage - 1) * safeLimit;

  const pagination: Pagination = {
    page: safePage,
    limit: safeLimit,
    totalItems,
    totalPages,
  };

  return {
    items: items.slice(start, start + safeLimit),
    pagination,
  };
};
