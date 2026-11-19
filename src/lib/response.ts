import { HttpStatus } from "@nestjs/common";
import { parsePagination } from "./pagination.js";

export function jsonOk<T>(data: T): { data: T; status_code: number } {
  return {
    data: data,
    status_code: HttpStatus.OK,
  };
}

export const jsonOK = jsonOk;

export function jsonCreated<T>(data: T): { data: T; status_code: number } {
  return {
    data: data,
    status_code: HttpStatus.CREATED,
  };
}

export function jsonPaginated<T>(data: {
  data: T;
  page?: number;
  take?: number;
  total?: number;
}) {
  return {
    ...data,
    status_code: HttpStatus.OK,
  };
}

export function jsonList<T>(result: {
  data: T[];
  page: number;
  take: number;
  total: number;
}) {
  return {
    data: result.data,
    meta: {
      page: result.page,
      take: result.take,
      total: result.total,
      total_pages: Math.ceil(result.total / result.take),
    },
    status_code: HttpStatus.OK,
  };
}

export function getPagination(page_query: string, take_query: string) {
  const take = Number(take_query);
  const page = Number(page_query);
  return parsePagination(page, take);
}
