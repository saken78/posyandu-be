import { ambilLms, hitungZScore } from "./imt-lms.js";
import {
  bulatkan,
  hitungNilaiIMT,
  hitungUmurBulan,
  validasiDataDasar,
  validasiUmur,
} from "./imt-common.js";
import type { DataIMT, HasilIMT } from "./imt-model.js";

/**
 * Preschool (3 to under 5 years) uses the WHO 2006 Child Growth Standards.
 * LMS data is monthly and already covers this age range.
 */
export function hitungIMTPraSekolah(data: DataIMT): HasilIMT {
  validasiDataDasar(data);

  const umurBulan = hitungUmurBulan(data);
  validasiUmur(umurBulan, 36, 60, "antara 3 dan kurang dari 5 tahun");

  const imt = hitungNilaiIMT(data.berat, data.tinggiCm);
  const zScore = hitungZScore(imt, ambilLms(data.jenisKelamin, umurBulan));

  return {
    imt: bulatkan(imt),
    zScore: bulatkan(zScore),
    umurBulan: bulatkan(umurBulan),
    keterangan: klasifikasikanPraSekolah(zScore),
    metode: "WHO 2006 BMI-for-age",
  };
}

/** WHO 2006 cut-offs for BMI-for-age below 5 years. */
function klasifikasikanPraSekolah(zScore: number): string {
  if (zScore < -3) return "Sangat Kurus";
  if (zScore < -2) return "Kurus";
  if (zScore < -1) return "Berisiko Kurus";
  if (zScore <= 1) return "Normal";
  if (zScore <= 2) return "Berisiko Gemuk";
  if (zScore <= 3) return "Gemuk";
  return "Obesitas";
}
