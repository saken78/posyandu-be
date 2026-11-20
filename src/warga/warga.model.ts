import z from "zod";
import { warga_kategori } from "../generated/enums.js";

export const CreateWargaSchema = z.object({
  no_kk: z.string().min(1),
  nik: z.string().min(1),
  nama: z.string().min(1),
  jenis_kelamin: z.enum(["L", "P"]),
  tanggal_lahir: z.coerce.date(),
  alamat_ktp: z.string().optional(),
  alamat_tinggal: z.string().optional(),
  kategori: z.enum(warga_kategori),
  golongan_darah: z.string().optional(),
  anak_ke: z.coerce.number().int().optional(),
  bb_lahir: z.coerce.number().optional(),
  pb_lahir: z.coerce.number().optional(),
});

export type CreateWargaRequest = z.infer<typeof CreateWargaSchema>;

export class WargaResponse {
  id!: string;
  no_kk!: string;
  nik!: string;
  nama!: string;
  jenis_kelamin!: "L" | "P";
  tanggal_lahir!: Date;
  alamat_ktp?: string | null;
  alamat_tinggal?: string | null;
  kategori!:
    | "Ibu_Hamil"
    | "Ibu_Bersalin_Nifas"
    | "Balita"
    | "Anak_Pra_Sekolah"
    | "Usia_Sekolah___Remaja"
    | "Usia_Dewasa"
    | "Lansia";
  created_at?: Date | null;
  golongan_darah?: string | null;
  anak_ke?: number | null;
  bb_lahir?: unknown;
  pb_lahir?: unknown;
}

export const SearchWargaSchema = z.object({
  q: z.string().trim().optional(),
  kategori: z.enum(warga_kategori).optional(),
  take: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchWargaQuery = z.infer<typeof SearchWargaSchema>;
