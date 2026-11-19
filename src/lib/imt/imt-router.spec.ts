import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { hitungIMT } from "../imt.js";
import { DataIMT, KategoriIMT } from "./imt-model.js";

const data = (
  kategori: KategoriIMT,
  tanggalLahir: string,
  overrides: Partial<DataIMT> = {},
) => ({
  berat: 20,
  tinggiCm: 110,
  tanggalLahir: new Date(`${tanggalLahir}T00:00:00Z`),
  tanggalUkur: new Date("2026-01-15T00:00:00Z"),
  jenisKelamin: "L" as const,
  kategori,
  ...overrides,
});

describe("hitungIMT router", () => {
  it.each([
    ["Anak_Pra_Sekolah", "2022-01-15", "WHO 2006 BMI-for-age"],
    ["Usia_Sekolah___Remaja", "2016-01-15", "WHO 2007 BMI-for-age"],
    ["Usia_Dewasa", "1990-01-15", "WHO adult cut-offs"],
    ["Lansia", "1950-01-15", "WHO adult cut-offs"],
  ] as const)("routes %s to %s", (kategori, tanggalLahir, metode) => {
    expect(hitungIMT(data(kategori, tanggalLahir)).metode).toBe(metode);
  });

  it("rejects an unknown category", () => {
    expect(() =>
      hitungIMT(data("Balita" as KategoriIMT, "2022-01-15")),
    ).toThrow(BadRequestException);
  });

  it("still validates input before routing", () => {
    expect(() =>
      hitungIMT(data("Anak_Pra_Sekolah", "2022-01-15", { berat: -1 })),
    ).toThrow(BadRequestException);
  });
});
