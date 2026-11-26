import { BadRequestException } from "@nestjs/common";
import { ambilLmsHC, hitungZScoreHC } from "./hc-lms.js";
import { bulatkan, klasifikasikanLIKA, validasiNilai } from "./ukur-common.js";
import type { DataLIKA, HasilLIKA } from "./ukur-model.js";

/**
 * Lingkar kepala (0-60 bulan) memakai WHO 2006 Child Growth Standards.
 * z-score dihitung dari tabel LMS per jenis kelamin dan usia bulan.
 */
export function hitungLIKA(data: DataLIKA): HasilLIKA {
  const nilai = validasiNilai(data.nilaiCm);
  const umurBulan = bulatkan(data.umurBulan);

  if (nilai === null) {
    return {
      nilai: null,
      zScore: null,
      kategori: null,
      umurBulan,
      metode: "WHO 2006 head circumference-for-age",
    };
  }

  if (data.jenisKelamin !== "L" && data.jenisKelamin !== "P") {
    throw new BadRequestException("Jenis kelamin harus L atau P");
  }
  if (
    !Number.isFinite(data.umurBulan) ||
    data.umurBulan < 0 ||
    data.umurBulan > 60
  ) {
    throw new BadRequestException(
      "Umur untuk LIKA harus antara 0 dan 60 bulan",
    );
  }

  const zScore = hitungZScoreHC(
    nilai,
    ambilLmsHC(data.jenisKelamin, data.umurBulan),
  );

  return {
    nilai: bulatkan(nilai),
    zScore: bulatkan(zScore),
    kategori: klasifikasikanLIKA(zScore),
    umurBulan,
    metode: "WHO 2006 head circumference-for-age",
  };
}
