import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { prisma } from "../lib/prisma.js";
import type { CreateWargaRequest, WargaResponse } from "./warga.model.js";

@Injectable()
export class WargaService {
  constructor() {}

  async create(request: CreateWargaRequest): Promise<WargaResponse> {
    const exist = await prisma.warga.findUnique({
      where: {
        nik: request.nik,
      },
    });

    if (exist) {
      throw new HttpException("NIK already exist", HttpStatus.CONFLICT);
    }

    const data = await prisma.warga.create({
      data: {
        no_kk: request.no_kk,
        nik: request.nik,
        nama: request.nama,
        jenis_kelamin: request.jenis_kelamin,
        tanggal_lahir: request.tanggal_lahir,
        alamat_ktp: request.alamat_ktp ?? null,
        alamat_tinggal: request.alamat_tinggal ?? null,
        kategori: request.kategori,
        golongan_darah: request.golongan_darah ?? null,
        anak_ke: request.anak_ke ?? null,
        bb_lahir: request.bb_lahir ?? null,
        pb_lahir: request.pb_lahir ?? null,
      },
    });

    return data;
  }

  async getByNIK(nik: string): Promise<WargaResponse> {
    const data = await prisma.warga.findUnique({
      where: {
        nik: nik,
      },
    });
    if (!data) {
      throw new HttpException("Data not found", HttpStatus.NOT_FOUND);
    }
    return data;
  }
}
