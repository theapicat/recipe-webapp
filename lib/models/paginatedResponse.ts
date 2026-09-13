export interface PaginatedResponse<T> {
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: T[];
}
