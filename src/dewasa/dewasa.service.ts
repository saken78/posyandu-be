import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { dewasaMap } from "../lib/helper.js";
import { hitungIMT } from "../lib/imt.js";
import { prisma } from "../lib/prisma.js";
import { hitungLILA } from "../lib/ukur.js";
import type {
  CreatePeriksaDewasaRequest,
  DewasaRow,
  SearchPeriksaDewasaQuery,
  TotalRow,
} from "./dewasa.model.js";

@Injectable()
export class DewasaService {
  constructor() {}

  async createScreening(nik: string, request: CreatePeriksaDewasaRequest) {
    const warga = await prisma.warga.findUnique({
      where: {
        nik: nik,
      },
      include: {
        periksa_dewasa: {
          orderBy: {
            tanggal_survey: "desc",
          },
        },
      },
    });

    if (!warga) {
      throw new HttpException("warga tidak ditemuakan", HttpStatus.NOT_FOUND);
    }

    const imt = hitungIMT({
      berat: request.berat_badan,
      tinggiCm: request.tinggi_badan,
      tanggalLahir: warga.tanggal_lahir,
      tanggalUkur: request.tanggal_survey,
      jenisKelamin: warga.jenis_kelamin,
      kategori: "Usia_Dewasa",
    });

    const lila = hitungLILA({
      nilaiCm: request.lila,
      kategori: "Dewasa",
      jenisKelamin: warga.jenis_kelamin,
    });

    const data = await prisma.periksa_dewasa.create({
      data: {
        warga_id: warga.id,
        tanggal_survey: request.tanggal_survey,
        periode_survey: request.periode_survey ?? null,
        tipe_kunjungan: request.tipe_kunjungan ?? null,
        berat_badan: request.berat_badan,
        tinggi_badan: request.tinggi_badan,
        lila: request.lila ?? null,
        kategori_lila: lila.kategori,
        lingkar_perut: request.lingkar_perut ?? null,
        nilai_imt: imt.imt,
        keterangan_imt: imt.keterangan,
      },
    });

    return data;
  }

  async getByNIK(nik: string) {
    const data = await prisma.warga.findUnique({
      where: {
        nik: nik,
        kategori: "Usia_Dewasa",
      },
      include: {
        periksa_dewasa: {
          orderBy: {
            tanggal_survey: "desc",
          },
        },
      },
    });

    if (!data) {
      throw new HttpException("Data dewasa masih kosong", HttpStatus.NOT_FOUND);
    }
    return data;
  }

  async getAll(query: SearchPeriksaDewasaQuery) {
    const offset = (query.page - 1) * query.take;
    let data_raw: DewasaRow[] = [];
    let total_raw: TotalRow[] = [];

    if (query.q && query.tipe) {
      data_raw = await prisma.$queryRaw<DewasaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.berat_badan,
          p.tinggi_badan,
          p.lila,
          p.kategori_lila,
          p.lingkar_perut,
          p.nilai_imt,
          p.keterangan_imt,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_dewasa as p
          INNER JOIN warga w ON w.id = p.warga_id
          where (w.nama  like CONCAT ("%", ${query.q}, "%") or 
                 w.nik like concat ("%", ${query.q}, "%") )
          and p.tipe_kunjungan = ${query.tipe}
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<TotalRow[]>`
      SELECT COUNT(*) AS total
      FROM periksa_dewasa p
      INNER JOIN warga w ON w.id = p.warga_id
      where (w.nama  like CONCAT ("%", ${query.q}, "%") or 
                 w.nik like concat ("%", ${query.q}, "%") )
          and p.tipe_kunjungan = ${query.tipe}`;
    } else if (!query.q && query.tipe) {
      data_raw = await prisma.$queryRaw<DewasaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.berat_badan,
          p.tinggi_badan,
          p.lila,
          p.kategori_lila,
          p.lingkar_perut,
          p.nilai_imt,
          p.keterangan_imt,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_dewasa as p
          INNER JOIN warga w ON w.id = p.warga_id
          where p.tipe_kunjungan = ${query.tipe}
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<TotalRow[]>`
      SELECT COUNT(*) AS total
      FROM periksa_dewasa p
      INNER JOIN warga w ON w.id = p.warga_id
      where p.tipe_kunjungan = ${query.tipe}`;
    } else if (!query.tipe && query.q) {
      data_raw = await prisma.$queryRaw<DewasaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.berat_badan,
          p.tinggi_badan,
          p.lila,
          p.kategori_lila,
          p.lingkar_perut,
          p.nilai_imt,
          p.keterangan_imt,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_dewasa as p
          INNER JOIN warga w ON w.id = p.warga_id
      where
            w.nama like CONCAT("%", ${query.q}, "%")
            or w.nik like concat("%", ${query.q}, "%")
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<TotalRow[]>`
      SELECT COUNT(*) AS total
      FROM periksa_dewasa p
      INNER JOIN warga w ON w.id = p.warga_id
      where w.nama  like CONCAT ("%", ${query.q}, "%") or 
            w.nik like concat ("%", ${query.q}, "%")`;
    } else if (!query.q && !query.tipe) {
      data_raw = await prisma.$queryRaw<DewasaRow[]>`
      SELECT
          p.id,
          p.warga_id,
          p.tanggal_survey,
          p.periode_survey,
          p.tipe_kunjungan,
          p.berat_badan,
          p.tinggi_badan,
          p.lila,
          p.kategori_lila,
          p.lingkar_perut,
          p.nilai_imt,
          p.keterangan_imt,
          w.id AS warga__id,
          w.nik AS warga__nik,
          w.nama AS warga__nama,
          w.jenis_kelamin AS warga__jenis_kelamin,
          w.tanggal_lahir AS warga__tanggal_lahir,
          w.kategori AS warga__kategori
      FROM periksa_dewasa as p
          INNER JOIN warga w ON w.id = p.warga_id
      ORDER BY p.tanggal_survey DESC, p.id DESC
      LIMIT ${query.take}
      OFFSET ${offset}`;

      total_raw = await prisma.$queryRaw<TotalRow[]>`
      SELECT COUNT(*) AS total
      FROM periksa_dewasa p
      INNER JOIN warga w ON w.id = p.warga_id`;
    }

    const total = Number(total_raw[0]?.total ?? 0);
    const data = data_raw.map((row: DewasaRow) => dewasaMap(row));

    if (data.length === 0) {
      throw new HttpException("Data Dewasa masih kosong", HttpStatus.NOT_FOUND);
    }

    return {
      data: data,
      page: query.page,
      take: query.take,
      total: total,
    };
  }

  async deleteScreening(id: string): Promise<{ message: string }> {
    const exist = await prisma.periksa_dewasa.findUnique({
      where: {
        id: id,
      },
    });

    if (!exist) {
      throw new HttpException(
        "Data screening dewasa tidak di temukan",
        HttpStatus.NOT_FOUND,
      );
    }

    await prisma.periksa_dewasa.delete({
      where: {
        id: id,
      },
    });

    return {
      message: "Screening dewasa berhasil dihapus",
    };
  }
}
