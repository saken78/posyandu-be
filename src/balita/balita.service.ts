import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";
import { angka, toDateOnly, toISOString } from "../lib/helper.js";
import { prisma } from "../lib/prisma.js";
import { hitungLIKA, hitungLILA, hitungUmurBulan } from "../lib/ukur.js";
import {
  type BalitaRow,
  type CreatePeriksaBalitaRequest,
  type GetAllTotal,
  type SearchPeriksaBalitaQuery,
} from "./balita.model.js";

@Injectable()
export class BalitaService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
  ) {}

  async getAll(query: SearchPeriksaBalitaQuery) {
    this.logger.info("BalitaService-getAll: executed ...");
    const offset = (query.page - 1) * query.take;
    let data_raw: BalitaRow[] = [];
    let total_raw: GetAllTotal[] = [];

    if (query.q && query.tipe) {
      data_raw = await prisma.$queryRaw<BalitaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.usia_bulan,
          p.bb_terkini,
          p.pb_terkini,
          p.lika,
          p.lila,
          p.kategori_lika,
          p.kategori_lila,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_balita p
          INNER JOIN warga w ON w.id = p.warga_id
          where (w.nama  like CONCAT ("%", ${query.q}, "%") or 
                 w.nik like concat ("%", ${query.q}, "%") )
          and p.tipe_kunjungan = ${query.tipe}
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
      SELECT COUNT(*) AS total
      FROM periksa_balita p
      INNER JOIN warga w ON w.id = p.warga_id
      where (w.nama  like CONCAT ("%", ${query.q}, "%") or 
                 w.nik like concat ("%", ${query.q}, "%") )
          and p.tipe_kunjungan = ${query.tipe}`;
    } else if (!query.q && query.tipe) {
      data_raw = await prisma.$queryRaw<BalitaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.usia_bulan,
          p.bb_terkini,
          p.pb_terkini,
          p.lika,
          p.lila,
          p.kategori_lika,
          p.kategori_lila,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_balita p
          INNER JOIN warga w ON w.id = p.warga_id
          where p.tipe_kunjungan = ${query.tipe}
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
      SELECT COUNT(*) AS total
      FROM periksa_balita p
      INNER JOIN warga w ON w.id = p.warga_id
      where p.tipe_kunjungan = ${query.tipe}`;
    } else if (!query.tipe && query.q) {
      data_raw = await prisma.$queryRaw<BalitaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.usia_bulan,
          p.bb_terkini,
          p.pb_terkini,
          p.lika,
          p.lila,
          p.kategori_lika,
          p.kategori_lila,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_balita p
          INNER JOIN warga w ON w.id = p.warga_id
      where
            w.nama like CONCAT("%", ${query.q}, "%")
            or w.nik like concat("%", ${query.q}, "%")
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
      SELECT COUNT(*) AS total
      FROM periksa_balita p
      INNER JOIN warga w ON w.id = p.warga_id
      where w.nama  like CONCAT ("%", ${query.q}, "%") or 
            w.nik like concat ("%", ${query.q}, "%")`;
    } else if (!query.q && !query.tipe) {
      data_raw = await prisma.$queryRaw<BalitaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.usia_bulan,
          p.bb_terkini,
          p.pb_terkini,
          p.lika,
          p.lila,
          p.kategori_lika,
          p.kategori_lila,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_balita p
          INNER JOIN warga w ON w.id = p.warga_id
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
      SELECT COUNT(*) AS total
      FROM periksa_balita p
      INNER JOIN warga w ON w.id = p.warga_id`;
    }

    const total = Number(total_raw[0]?.total ?? 0);
    const data = data_raw.map((row) => ({
      id: row.id,
      warga_id: row.warga_id,
      tanggal_survey: toISOString(row.tanggal_survey),
      periode_survey: row.periode_survey,
      tipe_kunjungan: row.tipe_kunjungan,
      usia_bulan: row.usia_bulan,
      bb_terkini: angka(row.bb_terkini),
      pb_terkini: angka(row.pb_terkini),
      lika: angka(row.lika),
      lila: angka(row.lila),
      kategori_lika: row.kategori_lika,
      kategori_lila: row.kategori_lila,
      warga: {
        id: row.warga__id,
        nik: row.warga__nik,
        nama: row.warga__nama,
        jenis_kelamin: row.warga__jenis_kelamin,
        tanggal_lahir: toDateOnly(row.warga__tanggal_lahir),
        kategori: row.warga__kategori,
      },
    }));

    if (data.length === 0) {
      throw new HttpException("Data Balita masih kosong", HttpStatus.NOT_FOUND);
    }

    return {
      data: data,
      page: query.page,
      take: query.take,
      total: total,
    };
  }

  async getByNIK(nik: string) {
    this.logger.info("BalitaService-getByNIK: executed ...");
    const data = await prisma.warga.findUnique({
      where: {
        nik: nik,
        kategori: "Balita",
      },
      include: {
        periksa_balita: {
          orderBy: {
            tanggal_survey: "desc",
          },
        },
      },
    });
    if (!data) {
      throw new HttpException("Data Balita masih kosong", HttpStatus.NOT_FOUND);
    }
    return data;
  }

  async createScreening(nik: string, request: CreatePeriksaBalitaRequest) {
    this.logger.info("BalitaService-getByScreening: executed ...");
    const warga = await prisma.warga.findUnique({
      where: {
        nik: nik,
        kategori: "Balita",
      },
    });

    if (!warga) {
      throw new HttpException("Warga tidak ditemukan", HttpStatus.NOT_FOUND);
    }

    const umurBulan =
      request.usia_bulan ??
      hitungUmurBulan(warga.tanggal_lahir, request.tanggal_survey);

    const lika = hitungLIKA({
      nilaiCm: request.lika,
      jenisKelamin: warga.jenis_kelamin,
      umurBulan,
    });

    const lila = hitungLILA({
      nilaiCm: request.lila,
      kategori: "Balita",
    });

    const data = await prisma.periksa_balita.create({
      data: {
        warga_id: warga.id,
        tanggal_survey: request.tanggal_survey,
        periode_survey: request.periode_survey ?? null,
        tipe_kunjungan: request.tipe_kunjungan ?? null,
        usia_bulan: request.usia_bulan ?? null,
        bb_terkini: request.bb_terkini ?? null,
        pb_terkini: request.pb_terkini ?? null,
        lika: request.lika ?? null,
        lila: request.lila ?? null,
        kategori_lika: lika.kategori,
        kategori_lila: lila.kategori,
      },
    });

    return data;
  }

  async deleteScreening(id: string): Promise<{ message: string }> {
    this.logger.info("BalitaService-deleteScreening: executed ...");
    const exist = await prisma.periksa_balita.findUnique({
      where: {
        id: id,
      },
    });

    if (!exist) {
      throw new HttpException(
        "Data screening balita tidak ditemukan",
        HttpStatus.NOT_FOUND,
      );
    }

    await prisma.periksa_balita.delete({
      where: {
        id: id,
      },
    });

    return { message: "Screening balita berhasil dihapus" };
  }
}
