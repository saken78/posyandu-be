import { bulatkan, klasifikasikanLILA, validasiNilai } from "./ukur-common.js";
import type { DataLILA, HasilLILA } from "./ukur-model.js";

/** Lingkar lengan atas memakai ambang batas (MUAC), bukan z-score. */
export function hitungLILA(data: DataLILA): HasilLILA {
  const nilai = validasiNilai(data.nilaiCm);
  const metode =
    data.kategori === "Balita"
      ? "WHO MUAC cut-offs"
      : "WHO adult MUAC cut-offs";

  if (nilai === null) {
    return { nilai: null, kategori: null, metode };
  }

  return {
    nilai: bulatkan(nilai),
    kategori: klasifikasikanLILA(nilai, data.kategori, data.jenisKelamin),
    metode,
  };
}
