import { BadRequestException } from "@nestjs/common";
import type { DataIMT } from "./imt-model.js";

/** Shared validation for every category, including the ones that ignore age. */
export function validasiDataDasar(data: DataIMT): void {
  if (!Number.isFinite(data.berat) || data.berat <= 0) {
    throw new BadRequestException("Berat badan harus berupa angka positif");
  }
  if (!Number.isFinite(data.tinggiCm) || data.tinggiCm <= 0) {
    throw new BadRequestException("Tinggi badan harus berupa angka positif");
  }
  if (
    !(data.tanggalLahir instanceof Date) ||
    Number.isNaN(data.tanggalLahir.getTime())
  ) {
    throw new BadRequestException("Tanggal lahir tidak valid");
  }
  if (data.jenisKelamin !== "L" && data.jenisKelamin !== "P") {
    throw new BadRequestException("Jenis kelamin harus L atau P");
  }
}

/** Measurement date is required for BMI-for-age, optional for adult cut-offs. */
function validasiTanggalUkur(data: DataIMT): Date {
  const { tanggalUkur } = data;
  if (!(tanggalUkur instanceof Date) || Number.isNaN(tanggalUkur.getTime())) {
    throw new BadRequestException("Tanggal ukur tidak valid");
  }
  return tanggalUkur;
}

/** Age in months (including fractions) at the measurement date. */
export function hitungUmurBulan(data: DataIMT): number {
  const tanggalLahir = data.tanggalLahir;
  const tanggalUkur = validasiTanggalUkur(data);

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

/** Adds months while clamping the day to the last day of the target month. */
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

/** Inclusive lower bound, exclusive upper bound (in months). */
export function validasiUmur(
  umurBulan: number,
  min: number,
  max: number,
  rentangLabel: string,
): void {
  if (umurBulan < min || umurBulan >= max) {
    throw new BadRequestException(
      `Umur anak harus ${rentangLabel} untuk kategori ini`,
    );
  }
}

export function hitungNilaiIMT(berat: number, tinggiCm: number): number {
  const tinggiMeter = tinggiCm / 100;
  return berat / (tinggiMeter * tinggiMeter);
}

/** Adult WHO cut-offs, shared by the adult and elderly modules. */
export function klasifikasikanDewasa(imt: number): string {
  if (imt < 18.5) return "Kurus";
  if (imt < 25) return "Normal";
  if (imt < 30) return "Gemuk";
  return "Obesitas";
}

export function bulatkan(nilai: number): number {
  return parseFloat(nilai.toFixed(2));
}
