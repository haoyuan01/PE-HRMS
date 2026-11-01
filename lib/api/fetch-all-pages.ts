import { apiClient } from "@/lib/api/client";
import type { Pagination } from "@/types/user";

interface PaginatedResponse<T> {
  data: T | T[];
  pagination?: Pagination;
}

/**
 * GETs every page of a paginated list endpoint and returns the combined rows.
 *
 * Use this ONLY when the UI filters / pages the full set client-side. Every
 * list endpoint is paginated server-side (15 per page by default), so reading
 * just `response.data.data` silently drops everything after page 1.
 * See PAGINATION.md.
 */
export async function fetchAllPages<T>(
  path: string,
  params?: object
): Promise<T[]> {
  const fetchPage = async (page: number) => {
    const response = await apiClient.get<PaginatedResponse<T>>(path, {
      params: { ...params, page },
    });
    const data = response.data.data;
    return {
      rows: Array.isArray(data) ? data : [data],
      lastPage: response.data.pagination?.last_page ?? 1,
    };
  };

  const first = await fetchPage(1);
  const rest = await Promise.all(
    Array.from({ length: first.lastPage - 1 }, (_, i) => fetchPage(i + 2))
  );
  return [first, ...rest].flatMap((p) => p.rows);
}
