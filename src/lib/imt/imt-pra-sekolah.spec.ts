import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { hitungIMTPraSekolah } from "./imt-pra-sekolah.js";
import { DataIMT } from "./imt-model.js";

const data = (overrides: Partial<DataIMT> = {}): DataIMT => ({
  berat: 16,
  tinggiCm: 100,
  tanggalLahir: new Date("2022-01-15T00:00:00Z"),
  tanggalUkur: new Date("2026-01-15T00:00:00Z"),
  jenisKelamin: "L",
  ...overrides,
});

describe("hitungIMTPraSekolah (WHO 2006, 3 to under 5 years)", () => {
  it("classifies a 4-year-old with BMI 16 as Normal, not Kurus", () => {
    const hasil = hitungIMTPraSekolah(data());

    expect(hasil.imt).toBe(16);
    expect(hasil.umurBulan).toBe(48);
    expect(hasil.zScore).toBeGreaterThan(-1);
    expect(hasil.zScore).toBeLessThan(1);
    expect(hasil.keterangan).toBe("Normal");
    expect(hasil.metode).toBe("WHO 2006 BMI-for-age");
  });

  it("classifies z-score above +2 as Gemuk", () => {
    const hasil = hitungIMTPraSekolah(data({ berat: 19 }));

    expect(hasil.zScore).toBeGreaterThan(2);
    expect(hasil.keterangan).toBe("Gemuk");
  });

  it("classifies z-score below -3 as Sangat Kurus", () => {
    const hasil = hitungIMTPraSekolah(data({ berat: 12 }));

    expect(hasil.zScore).toBeLessThan(-3);
    expect(hasil.keterangan).toBe("Sangat Kurus");
  });

  it("rejects zero, negative and NaN weight", () => {
    expect(() => hitungIMTPraSekolah(data({ berat: 0 }))).toThrow(
      BadRequestException,
    );
    expect(() => hitungIMTPraSekolah(data({ berat: -50 }))).toThrow(
      BadRequestException,
    );
    expect(() => hitungIMTPraSekolah(data({ berat: Number.NaN }))).toThrow(
      BadRequestException,
    );
  });

  it("rejects zero, negative and infinite height", () => {
    expect(() => hitungIMTPraSekolah(data({ tinggiCm: 0 }))).toThrow(
      BadRequestException,
    );
    expect(() => hitungIMTPraSekolah(data({ tinggiCm: -100 }))).toThrow(
      BadRequestException,
    );
    expect(() =>
      hitungIMTPraSekolah(data({ tinggiCm: Number.POSITIVE_INFINITY })),
    ).toThrow(BadRequestException);
  });

  it("rejects ages outside 3 to under 5 years", () => {
    expect(() =>
      hitungIMTPraSekolah(
        data({
          tanggalLahir: new Date("2024-01-15T00:00:00Z"),
        }),
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      hitungIMTPraSekolah(
        data({
          tanggalLahir: new Date("2020-01-15T00:00:00Z"),
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it("rejects a measurement date before the date of birth", () => {
    expect(() =>
      hitungIMTPraSekolah(
        data({ tanggalUkur: new Date("2021-01-15T00:00:00Z") }),
      ),
    ).toThrow(BadRequestException);
  });
});
