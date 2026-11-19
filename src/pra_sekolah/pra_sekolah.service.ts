import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { prisma } from "../lib/prisma.js";
import type { CreatePeriksaPraSekolahRequest } from "./pra_sekolah.model.js";
import { hitungIMT } from "../lib/imt.js";

@Injectable()
export class PraSekolahService {
  constructor() {}

  async getAll() {
    const data = await prisma.periksa_pra_sekolah.findMany();
    if (!data) {
      throw new HttpException(
        "Data Anak Pra sekolah masih kosong",
        HttpStatus.NOT_FOUND,
      );
    }
    return data;
  }

  async getByNIK(nik: string) {
    const data = await prisma.warga.findUnique({
      where: {
        nik: nik,
        kategori: "Anak_Pra_Sekolah",
      },
      include: {
        periksa_pra_sekolah: {
          orderBy: {
            tanggal_survey: "desc",
          },
        },
      },
    });
    if (!data) {
      throw new HttpException(
        "Data Pra sekolah masih kosong",
        HttpStatus.NOT_FOUND,
      );
    }
    return data;
  }

  async createScreening(nik: string, request: CreatePeriksaPraSekolahRequest) {
    const warga = await prisma.warga.findUnique({
      where: {
        nik: nik,
        kategori: "Anak_Pra_Sekolah",
      },
      include: {
        periksa_pra_sekolah: {
          orderBy: {
            tanggal_survey: "desc",
          },
        },
      },
    });

    if (!warga) {
      throw new HttpException("Warga tidak ditemukan", HttpStatus.NOT_FOUND);
    }

    const imt = hitungIMT({
      berat: request.berat_badan,
      tinggiCm: request.tinggi_badan,
      tanggalLahir: warga.tanggal_lahir,
      tanggalUkur: request.tanggal_survey,
      jenisKelamin: warga.jenis_kelamin,
      kategori: "Anak_Pra_Sekolah",
    });

    const data = await prisma.periksa_pra_sekolah.create({
      data: {
        warga_id: warga.id,
        tanggal_survey: request.tanggal_survey,
        periode_survey: request.periode_survey ?? null,
        tipe_kunjungan: request.tipe_kunjungan ?? null,
        berat_badan: request.berat_badan,
        tinggi_badan: request.tinggi_badan,
        lika: request.lika ?? null,
        lingkar_perut: request.lingkar_perut ?? null,
        nilai_imt: imt.imt,
        keterangan_imt: imt.keterangan,
      },
    });

    return data;
  }

  async deleteScreening(id: string) {
    const exist = await prisma.periksa_pra_sekolah.findUnique({
      where: {
        id: id,
      },
    });

    if (!exist) {
      throw new HttpException(
        "Data screening pra sekolah tidak ditemukan",
        HttpStatus.NOT_FOUND,
      );
    }

    await prisma.periksa_pra_sekolah.delete({
      where: {
        id: id,
      },
    });

    return { message: "Screening pra sekolah berhasil dihapus" };
  }
}
