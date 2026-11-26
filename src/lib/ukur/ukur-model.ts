export type JenisKelamin = "L" | "P";

export type KategoriLILA = "Balita" | "Remaja" | "Dewasa" | "Lansia";

export type MetodeLIKA = "WHO 2006 head circumference-for-age";
export type MetodeLILA = "WHO MUAC cut-offs" | "WHO adult MUAC cut-offs";

export type DataLIKA = {
  nilaiCm: number | null | undefined;
  jenisKelamin: JenisKelamin;
  /** Umur dalam bulan (boleh desimal), sesuai hitungan WHO. */
  umurBulan: number;
};

export type HasilLIKA = {
  nilai: number | null;
  zScore: number | null;
  kategori: string | null;
  umurBulan: number | null;
  metode: MetodeLIKA;
};

export type DataLILA = {
  nilaiCm: number | null | undefined;
  kategori: KategoriLILA;
  /** Dibutuhkan untuk kategori Remaja/Dewasa/Lansia. */
  jenisKelamin?: JenisKelamin;
};

export type HasilLILA = {
  nilai: number | null;
  kategori: string | null;
  metode: MetodeLILA;
};
