import {
  bulatkan,
  hitungNilaiIMT,
  klasifikasikanDewasa,
  validasiDataDasar,
} from "./imt-common.js";
import type { DataIMT, HasilIMT } from "./imt-model.js";

/**
 * Elderly patients use the same fixed WHO cut-offs as adults by default.
 * Kept in its own module so a different geriatric threshold can be plugged in
 * later without touching the adult or BMI-for-age modules.
 */
export function hitungIMTLansia(data: DataIMT): HasilIMT {
  validasiDataDasar(data);

  const imt = hitungNilaiIMT(data.berat, data.tinggiCm);
  return {
    imt: bulatkan(imt),
    keterangan: klasifikasikanDewasa(imt),
    zScore: null,
    umurBulan: null,
    metode: "WHO adult cut-offs",
  };
}
