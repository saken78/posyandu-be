import z from "zod";
import { periksa_pra_sekolah_tipe_kunjungan } from "../generated/enums.js";

export const CreatePeriksaPraSekolahSchema = z.object({
  tanggal_survey: z.coerce.date(),
  periode_survey: z.string(),
  tipe_kunjungan: z.enum(["Datang_Langsung", "Kunjungan_Rumah"]),
  berat_badan: z.coerce.number().positive().finite(),
  tinggi_badan: z.coerce.number().positive().finite(),
  lika: z.coerce.number().optional(),
  lingkar_perut: z.coerce.number().optional(),
});

export type CreatePeriksaPraSekolahRequest = z.infer<
  typeof CreatePeriksaPraSekolahSchema
>;

export const SearchPeriksaPraSekolahSchema = z.object({
  q: z.string().trim().optional(),
  tipe: z.enum(periksa_pra_sekolah_tipe_kunjungan).optional(),
  take: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchPeriksaPraSekolahRequest = z.infer<
  typeof SearchPeriksaPraSekolahSchema
>;

export type GetAllPeriksaPraSekolahRow = {
  id: string;
  warga_id: string;
  tanggal_survey: Date;
  periode_survey: string;
  tipe_kunjungan: "Datang_Langsung" | "Kunjungan_Rumah";
  berat_badan: number;
  tinggi_badan: number;
  lika: number | null;
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

export type GetAllTotal = {
  total: number;
};

export type PraSekolahResponse = {
  id: string;
  warga_id: string;
  tanggal_survey: string | null;
  periode_survey: string;
  tipe_kunjungan: "Datang_Langsung" | "Kunjungan_Rumah";
  berat_badan: number | null;
  tinggi_badan: number | null;
  lika: number | null;
  lingkar_perut: number | null;
  nilai_imt: number | null;
  keterangan_imt: string | null;
  warga: {
    id: string;
    nik: string;
    nama: string;
    jenis_kelamin: "L" | "P";
    tanggal_lahir: string | null;
    kategori: string;
  };
};
