import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { hitungIMTDewasa } from "./imt-dewasa.js";
import { DataIMT } from "./imt-model.js";

const data = (overrides: Partial<DataIMT> = {}): DataIMT => ({
  berat: 70,
  tinggiCm: 170,
  tanggalLahir: new Date("1990-01-15T00:00:00Z"),
  tanggalUkur: new Date("2026-01-15T00:00:00Z"),
  jenisKelamin: "L",
  ...overrides,
});

describe("hitungIMTDewasa (fixed WHO adult cut-offs)", () => {
  it.each([
    [53, "Kurus"],
    [70, "Normal"],
    [80, "Gemuk"],
    [90, "Obesitas"],
  ])("classifies BMI from %i kg as %s", (berat, keterangan) => {
    const hasil = hitungIMTDewasa(data({ berat }));

    expect(hasil.keterangan).toBe(keterangan);
    expect(hasil.zScore).toBeNull();
    expect(hasil.umurBulan).toBeNull();
    expect(hasil.metode).toBe("WHO adult cut-offs");
  });

  it("works without a measurement date (nullable in the schema)", () => {
    expect(() => hitungIMTDewasa(data({ tanggalUkur: null }))).not.toThrow();
  });

  it("rejects invalid weight and height", () => {
    expect(() => hitungIMTDewasa(data({ berat: -5 }))).toThrow(
      BadRequestException,
    );
    expect(() => hitungIMTDewasa(data({ tinggiCm: 0 }))).toThrow(
      BadRequestException,
    );
  });
});
