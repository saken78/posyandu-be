import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import type { warga_kategori } from "../generated/enums.js";
import { prisma } from "../lib/prisma.js";
import type { CreateWargaRequest, WargaResponse } from "./warga.model.js";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

@Injectable()
export class WargaService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}

  async create(request: CreateWargaRequest): Promise<WargaResponse> {
    this.logger.info("WargaService-create: executed ...");
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
    this.logger.info("WargaService-getByNIK: executed ...");
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

  async search(
    take: number,
    page: number,
    q?: string,
    kategori?: warga_kategori,
  ) {
    this.logger.info("WargaService-search: executed ...");
    const offset = (page - 1) * take;
    const where = {
      ...(kategori ? { kategori } : {}),
      ...(q
        ? {
            OR: [
              { nama: { contains: q } },
              { nik: { contains: q } },
              { no_kk: { contains: q } },
            ],
          }
        : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.warga.findMany({
        where,
        take: take,
        skip: offset,
        orderBy: {
          created_at: "desc",
        },
      }),

      prisma.warga.count({
        where,
      }),
    ]);

    return {
      data: data,
      page: page,
      take: take,
      total: total,
    };
  }
}
