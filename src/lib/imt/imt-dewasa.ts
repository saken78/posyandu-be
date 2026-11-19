import {
  bulatkan,
  hitungNilaiIMT,
  klasifikasikanDewasa,
  validasiDataDasar,
} from "./imt-common.js";
import type { DataIMT, HasilIMT } from "./imt-model.js";

/**
 * Adults (19 years and older) use fixed WHO BMI cut-offs.
 * Date of birth and sex are not needed, but DataIMT is accepted for a uniform API.
 */
export function hitungIMTDewasa(data: DataIMT): HasilIMT {
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
