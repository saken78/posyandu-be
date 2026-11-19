import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { hitungIMTRemaja } from "./imt-remaja.js";
import { DataIMT } from "./imt-model.js";

const data = (overrides: Partial<DataIMT> = {}): DataIMT => ({
  berat: 22,
  tinggiCm: 100,
  tanggalLahir: new Date("2016-01-15T00:00:00Z"),
  tanggalUkur: new Date("2026-01-15T00:00:00Z"),
  jenisKelamin: "L",
  ...overrides,
});

describe("hitungIMTRemaja (WHO 2007, 5 to under 19 years)", () => {
  it("classifies a 10-year-old with BMI 16 as Normal", () => {
    const hasil = hitungIMTRemaja(data({ berat: 16 }));

    expect(hasil.umurBulan).toBe(120);
    expect(hasil.zScore).toBeGreaterThan(-1);
    expect(hasil.keterangan).toBe("Normal");
    expect(hasil.metode).toBe("WHO 2007 BMI-for-age");
  });

  it("classifies a 10-year-old with BMI 20 as Gemuk", () => {
    const hasil = hitungIMTRemaja(data({ berat: 20 }));

    expect(hasil.zScore).toBeGreaterThan(1);
    expect(hasil.zScore).toBeLessThan(2);
    expect(hasil.keterangan).toBe("Gemuk");
  });

  it("uses the same WHO 2007 table for a 6-year-old", () => {
    const hasil = hitungIMTRemaja(
      data({
        berat: 20,
        tinggiCm: 112,
        jenisKelamin: "P",
        tanggalLahir: new Date("2020-01-15T00:00:00Z"),
      }),
    );

    expect(hasil.umurBulan).toBe(72);
    expect(hasil.keterangan).toBe("Normal");
  });

  it("rejects ages outside 5 to under 19 years", () => {
    expect(() =>
      hitungIMTRemaja(data({ tanggalLahir: new Date("2022-01-15T00:00:00Z") })),
    ).toThrow(BadRequestException);
    expect(() =>
      hitungIMTRemaja(data({ tanggalLahir: new Date("2005-01-15T00:00:00Z") })),
    ).toThrow(BadRequestException);
  });
});
