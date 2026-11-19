import { BadRequestException } from "@nestjs/common";
import { hitungIMTDewasa } from "./imt/imt-dewasa.js";
import { hitungIMTLansia } from "./imt/imt-lansia.js";
import { hitungIMTPraSekolah } from "./imt/imt-pra-sekolah.js";
import { hitungIMTRemaja } from "./imt/imt-remaja.js";
import type { DataIMT, HasilIMT, KategoriIMT } from "./imt/imt-model.js";

export {
  hitungIMTDewasa,
  hitungIMTLansia,
  hitungIMTPraSekolah,
  hitungIMTRemaja,
};

/** Routes each warga category to its own IMT implementation. */
export function hitungIMT(data: DataIMT & { kategori: KategoriIMT }): HasilIMT {
  switch (data.kategori) {
    case "Anak_Pra_Sekolah":
      return hitungIMTPraSekolah(data);
    case "Usia_Sekolah___Remaja":
      return hitungIMTRemaja(data);
    case "Usia_Dewasa":
      return hitungIMTDewasa(data);
    case "Lansia":
      return hitungIMTLansia(data);
    default:
      throw new BadRequestException(
        `Kategori IMT tidak dikenal: ${String(data.kategori)}`,
      );
  }
}
