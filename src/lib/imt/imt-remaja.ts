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
 * School age and adolescence (5 to under 19 years) uses the WHO 2007
 * Growth Reference. LMS data ends at 228 months (19 years).
 */
export function hitungIMTRemaja(data: DataIMT): HasilIMT {
  validasiDataDasar(data);

  const umurBulan = hitungUmurBulan(data);
  validasiUmur(umurBulan, 60, 228, "antara 5 dan kurang dari 19 tahun");

  const imt = hitungNilaiIMT(data.berat, data.tinggiCm);
  const zScore = hitungZScore(imt, ambilLms(data.jenisKelamin, umurBulan));

  return {
    imt: bulatkan(imt),
    zScore: bulatkan(zScore),
    umurBulan: bulatkan(umurBulan),
    keterangan: klasifikasikanRemaja(zScore),
    metode: "WHO 2007 BMI-for-age",
  };
}

/** WHO 2007 cut-offs: thinness < -2 SD, overweight > +1 SD, obesity > +2 SD. */
function klasifikasikanRemaja(zScore: number): string {
  if (zScore < -3) return "Sangat Kurus";
  if (zScore < -2) return "Kurus";
  if (zScore <= 1) return "Normal";
  if (zScore <= 2) return "Gemuk";
  return "Obesitas";
}
