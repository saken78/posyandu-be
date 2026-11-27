import type { DewasaRow } from "../dewasa/dewasa.model.js";
import type { GetAllPeriksaPraSekolahRow } from "../pra_sekolah/pra_sekolah.model.js";

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

export function praSekolahMap(row: GetAllPeriksaPraSekolahRow) {
  return {
    id: row.id,
    warga_id: row.warga_id,
    tanggal_survey: toISOString(row.tanggal_survey),
    periode_survey: row.periode_survey,
    tipe_kunjungan: row.tipe_kunjungan,
    berat_badan: angka(row.berat_badan),
    tinggi_badan: angka(row.tinggi_badan),
    lika: angka(row.lika),
    kategori_lika: row.kategori_lika,
    lingkar_perut: angka(row.lingkar_perut),
    nilai_imt: angka(row.nilai_imt),
    keterangan_imt: row.keterangan_imt,
    warga: {
      id: row.warga__id,
      nik: row.warga__nik,
      nama: row.warga__nama,
      jenis_kelamin: row.warga__jenis_kelamin,
      tanggal_lahir: toDateOnly(row.warga__tanggal_lahir),
      kategori: row.warga__kategori,
    },
  };
}

export function dewasaMap(row: DewasaRow) {
  return {
    id: row.id,
    warga_id: row.warga_id,
    tanggal_survey: toISOString(row.tanggal_survey),
    periode_survey: row.periode_survey,
    tipe_kunjungan: row.tipe_kunjungan,
    berat_badan: angka(row.berat_badan),
    tinggi_badan: angka(row.tinggi_badan),
    lila: angka(row.lila),
    kategori_lila: row.kategori_lila,
    lingkar_perut: angka(row.lingkar_perut),
    nilai_imt: angka(row.nilai_imt),
    keterangan_imt: row.keterangan_imt,
    warga: {
      id: row.warga__id,
      nik: row.warga__nik,
      nama: row.warga__nama,
      jenis_kelamin: row.warga__jenis_kelamin,
      tanggal_lahir: toDateOnly(row.warga__tanggal_lahir),
      kategori: row.warga__kategori,
    },
  };
}
