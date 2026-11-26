import { BadRequestException } from "@nestjs/common";
import type { JenisKelamin, KategoriLILA } from "./ukur-model.js";

/** Nilai kosong tidak dihitung; nilai invalid ditolak. */
export function validasiNilai(
  nilaiCm: number | null | undefined,
): number | null {
  if (nilaiCm === null || nilaiCm === undefined) return null;
  if (!Number.isFinite(nilaiCm) || nilaiCm <= 0) {
    throw new BadRequestException("Nilai ukuran harus berupa angka positif");
  }
  return nilaiCm;
}

/** Umur dalam bulan termasuk fraksi, mengikuti aturan tanggal WHO. */
export function hitungUmurBulan(tanggalLahir: Date, tanggalUkur: Date): number {
  if (!(tanggalLahir instanceof Date) || Number.isNaN(tanggalLahir.getTime())) {
    throw new BadRequestException("Tanggal lahir tidak valid");
  }
  if (!(tanggalUkur instanceof Date) || Number.isNaN(tanggalUkur.getTime())) {
    throw new BadRequestException("Tanggal ukur tidak valid");
  }
  if (tanggalUkur.getTime() < tanggalLahir.getTime()) {
    throw new BadRequestException(
      "Tanggal ukur tidak boleh sebelum tanggal lahir",
    );
  }

  let bulan =
    (tanggalUkur.getUTCFullYear() - tanggalLahir.getUTCFullYear()) * 12 +
    (tanggalUkur.getUTCMonth() - tanggalLahir.getUTCMonth());

  let awalBulan = tambahBulan(tanggalLahir, bulan);
  if (awalBulan > tanggalUkur) {
    bulan -= 1;
    awalBulan = tambahBulan(tanggalLahir, bulan);
  }
  const akhirBulan = tambahBulan(tanggalLahir, bulan + 1);

  return (
    bulan +
    (tanggalUkur.getTime() - awalBulan.getTime()) /
      (akhirBulan.getTime() - awalBulan.getTime())
  );
}

/** Menambah bulan dengan clamp tanggal ke hari terakhir bulan tujuan. */
function tambahBulan(tanggal: Date, bulan: number): Date {
  const target = new Date(
    Date.UTC(tanggal.getUTCFullYear(), tanggal.getUTCMonth() + bulan, 1),
  );
  const hariTerakhir = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      Math.min(tanggal.getUTCDate(), hariTerakhir),
      tanggal.getUTCHours(),
      tanggal.getUTCMinutes(),
      tanggal.getUTCSeconds(),
      tanggal.getUTCMilliseconds(),
    ),
  );
}

export function bulatkan(nilai: number): number {
  return parseFloat(nilai.toFixed(2));
}

/** Kategori lingkar kepala berdasarkan z-score WHO. */
export function klasifikasikanLIKA(zScore: number): string {
  if (zScore < -3) return "Sangat Kecil";
  if (zScore < -2) return "Kecil";
  if (zScore <= 2) return "Normal";
  if (zScore <= 3) return "Besar";
  return "Sangat Besar";
}

/**
 * Ambang LILA (MUAC):
 * - Balita 6-59 bulan: WHO MUAC 11.5 / 12.5 cm.
 * - Remaja/dewasa/lansia: ambang tetap per jenis kelamin (L < 23, P < 25 cm).
 */
export function klasifikasikanLILA(
  nilaiCm: number,
  kategori: KategoriLILA,
  jenisKelamin?: JenisKelamin,
): string {
  if (kategori === "Balita") {
    if (nilaiCm < 11.5) return "Gizi Buruk";
    if (nilaiCm < 12.5) return "Gizi Kurang";
    return "Normal";
  }

  if (jenisKelamin !== "L" && jenisKelamin !== "P") {
    throw new BadRequestException(
      "Jenis kelamin wajib diisi untuk LILA remaja/dewasa/lansia",
    );
  }

  const batas = jenisKelamin === "L" ? 23 : 25;
  return nilaiCm < batas ? "Kurang Gizi" : "Normal";
}
