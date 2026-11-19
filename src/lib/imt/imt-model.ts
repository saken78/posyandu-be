export type JenisKelamin = "L" | "P";

export type KategoriIMT =
  "Anak_Pra_Sekolah" | "Usia_Sekolah___Remaja" | "Usia_Dewasa" | "Lansia";

export type MetodeIMT =
  "WHO 2006 BMI-for-age" | "WHO 2007 BMI-for-age" | "WHO adult cut-offs";

export type HasilIMT = {
  imt: number;
  keterangan: string;
  zScore: number | null;
  umurBulan: number | null;
  metode: MetodeIMT;
};

export type DataIMT = {
  berat: number;
  tinggiCm: number;
  tanggalLahir: Date;
  tanggalUkur: Date | null | undefined;
  jenisKelamin: JenisKelamin;
};
