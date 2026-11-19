import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { hitungIMTLansia } from "./imt-lansia.js";
import { DataIMT } from "./imt-model.js";

const data = (overrides: Partial<DataIMT> = {}): DataIMT => ({
  berat: 60,
  tinggiCm: 160,
  tanggalLahir: new Date("1950-01-15T00:00:00Z"),
  tanggalUkur: new Date("2026-01-15T00:00:00Z"),
  jenisKelamin: "P",
  ...overrides,
});

describe("hitungIMTLansia (same adult cut-offs, separate module)", () => {
  it.each([
    [45, "Kurus"],
    [60, "Normal"],
    [70, "Gemuk"],
    [80, "Obesitas"],
  ])("classifies BMI from %i kg as %s", (berat, keterangan) => {
    const hasil = hitungIMTLansia(data({ berat }));

    expect(hasil.keterangan).toBe(keterangan);
    expect(hasil.zScore).toBeNull();
    expect(hasil.metode).toBe("WHO adult cut-offs");
  });

  it("does not reject elderly ages", () => {
    expect(() => hitungIMTLansia(data())).not.toThrow();
  });

  it("rejects invalid input just like the other categories", () => {
    expect(() => hitungIMTLansia(data({ berat: 0 }))).toThrow(
      BadRequestException,
    );
  });
});
