export type Pagination<T> = {
  data: T;
  take?: number;
  page?: number;
  total?: number;
};

export function parsePagination(page: number, take: number) {
  page = Math.max(1, Math.floor(page) || 1);
  take = Math.min(100, Math.max(1, Math.floor(take) || 10));

  if (page === undefined) {
    page = isNaN(page) ? 1 : page;
  }

  if (take === undefined) {
    take = isNaN(take) ? 10 : take;
  }

  const ofs: number = (page - 1) * take;

  return {
    take,
    page,
    ofs,
  };
}
