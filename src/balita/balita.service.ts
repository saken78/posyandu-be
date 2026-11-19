import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "../generated/client.js";
import { prisma } from "../lib/prisma.js";
import {
  angka,
  toDateOnly,
  toISOString,
  type BalitaRow,
  type CreatePeriksaBalitaRequest,
  type SearchPeriksaBalitaQuery,
} from "./balita.model.js";

@Injectable()
export class BalitaService {
  constructor() {}

  async getAll({ q, tipe, from, to, take, page }: SearchPeriksaBalitaQuery) {
    const qParam = q ?? null;
    const tipeParam = tipe ?? null;
    const fromParam = from ?? null;
    const toParam = to ?? null;

    const offset = (page - 1) * take;

    const whereSql = Prisma.sql`
      WHERE (${qParam} IS NULL
        OR w.nama LIKE CONCAT('%', ${qParam}, '%')
        OR w.nik LIKE CONCAT('%', ${qParam}, '%')
        OR p.periode_survey LIKE CONCAT('%', ${qParam}, '%'))
        AND (${tipeParam} IS NULL OR p.tipe_kunjungan = ${tipeParam})
        AND (${fromParam} IS NULL OR p.tanggal_survey >= ${fromParam})
        AND (${toParam} IS NULL OR p.tanggal_survey <= ${toParam})
    `;

    const [rows, counts] = await Promise.all([
      prisma.$queryRaw<BalitaRow[]>(Prisma.sql`
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
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
        FROM periksa_balita p
        INNER JOIN warga w ON w.id = p.warga_id
        ${whereSql}
        ORDER BY p.tanggal_survey DESC, p.id DESC
        LIMIT ${take} OFFSET ${offset}
      `),
      prisma.$queryRaw<{ total: bigint | number | string }[]>(Prisma.sql`
        SELECT COUNT(*) AS total
        FROM periksa_balita p
        INNER JOIN warga w ON w.id = p.warga_id
        ${whereSql}
      `),
    ]);

    const total = Number(counts[0]?.total ?? 0);
    const data = rows.map((row) => ({
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
      warga: {
        id: row.warga__id,
        nik: row.warga__nik,
        nama: row.warga__nama,
        jenis_kelamin: row.warga__jenis_kelamin,
        tanggal_lahir: toDateOnly(row.warga__tanggal_lahir),
        kategori: row.warga__kategori,
      },
    }));

    return { data, page, take, total };
  }

  async getByNIK(nik: string) {
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
    const warga = await prisma.warga.findUnique({
      where: {
        nik: nik,
        kategori: "Balita",
      },
    });

    if (!warga) {
      throw new HttpException("Warga tidak ditemukan", HttpStatus.NOT_FOUND);
    }

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
      },
    });

    return data;
  }

  async deleteScreening(id: string) {
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
