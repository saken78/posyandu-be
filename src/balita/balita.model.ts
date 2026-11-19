import z from "zod";
import {
  periksa_balita_tipe_kunjungan,
  warga_kategori,
} from "../generated/enums.js";

export const CreatePeriksaBalitaSchema = z.object({
  tanggal_survey: z.coerce.date(),
  periode_survey: z.string().optional(),
  tipe_kunjungan: z.enum(["Datang_Langsung", "Kunjungan_Rumah"]).optional(),
  usia_bulan: z.coerce.number().int().optional(),
  bb_terkini: z.coerce.number().optional(),
  pb_terkini: z.coerce.number().optional(),
  lika: z.coerce.number().optional(),
  lila: z.coerce.number().optional(),
});

export type CreatePeriksaBalitaRequest = z.infer<
  typeof CreatePeriksaBalitaSchema
>;

export const SearchPeriksaBalitaSchema = z.object({
  q: z.string().trim().optional(),
  tipe: z.enum(periksa_balita_tipe_kunjungan).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  take: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchPeriksaBalitaQuery = z.infer<
  typeof SearchPeriksaBalitaSchema
>;

export type BalitaRow = {
  id: string;
  warga_id: string;
  tanggal_survey: Date | string | null;
  periode_survey: string | null;
  tipe_kunjungan: "Datang_Langsung" | "Kunjungan_Rumah" | null;
  usia_bulan: number | null;
  bb_terkini: number | string | null;
  pb_terkini: number | string | null;
  lika: number | string | null;
  lila: number | string | null;
  warga__id: string;
  warga__nik: string;
  warga__nama: string;
  warga__jenis_kelamin: "L" | "P";
  warga__tanggal_lahir: Date | string;
  warga__kategori: warga_kategori;
};

export function enumKey(value: string | null): string | null {
  return value?.replace(/[^\w]+/g, "_") ?? null;
}

export function angka(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

// DATE -> YYYY-MM-DD
export function toDateOnly(value: Date | string | null): string | null {
  if (value === null) return null;

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

// DATETIME -> ISO 8601
export function toISOString(value: Date | string | null): string | null {
  if (value === null) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
