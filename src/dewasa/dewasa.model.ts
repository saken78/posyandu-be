import z from "zod";
import { periksa_dewasa_tipe_kunjungan } from "../generated/enums.js";

export const CreatePeriksaDewasaSchema = z.object({
  tanggal_survey: z.coerce.date(),
  periode_survey: z.string(),
  tipe_kunjungan: z.enum(["Datang_Langsung", "Kunjungan_Rumah"]),
  berat_badan: z.coerce.number().positive().finite(),
  tinggi_badan: z.coerce.number().positive().finite(),
  lila: z.coerce.number().optional(),
  lingkar_perut: z.coerce.number().optional(),
});

export type CreatePeriksaDewasaRequest = z.infer<
  typeof CreatePeriksaDewasaSchema
>;

export const SearchPeriksaDewasaSchema = z.object({
  q: z.string().trim().optional(),
  tipe: z.enum(periksa_dewasa_tipe_kunjungan).optional(),
  take: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchPeriksaDewasaQuery = z.infer<
  typeof SearchPeriksaDewasaSchema
>;

export type DewasaRow = {
  id: string;
  warga_id: string;
  tanggal_survey: Date;
  periode_survey: string;
  tipe_kunjungan: "Datang_Langsung" | "Kunjungan_Rumah";
  berat_badan: number;
  tinggi_badan: number;
  lila: number | null;
  kategori_lila: string | null;
  lingkar_perut: number | null;
  nilai_imt: number | null;
  keterangan_imt: string | null;
  warga__id: string;
  warga__nik: string;
  warga__nama: string;
  warga__jenis_kelamin: "L" | "P";
  warga__tanggal_lahir: Date;
  warga__kategori: string;
};

export type TotalRow = {
  total: number;
};
