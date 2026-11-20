import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { hitungIMT } from "../lib/imt.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreatePeriksaPraSekolahRequest,
  GetAllPeriksaPraSekolahRow,
  GetAllTotal,
  SearchPeriksaPraSekolahRequest,
} from "./pra_sekolah.model.js";

@Injectable()
export class PraSekolahService {
  constructor() {}

  async getAll(query: SearchPeriksaPraSekolahRequest) {
    const offset = (query.page - 1) * query.take;
    let data: GetAllPeriksaPraSekolahRow[] = [];
    let total_raw;
    if (query.q && query.tipe) {
      data = await prisma.$queryRaw<GetAllPeriksaPraSekolahRow[]>`
        select
            pp.id,
            pp.warga_id,
            pp.tanggal_survey,
            pp.periode_survey,
            pp.tipe_kunjungan,
            pp.berat_badan,
            pp.tinggi_badan,
            pp.lika,
            pp.lingkar_perut,
            pp.nilai_imt,
            pp.keterangan_imt,
            w.id AS warga__id,
            w.nik AS warga__nik,
            w.nama AS warga__nama,
            w.jenis_kelamin AS warga__jenis_kelamin,
            w.tanggal_lahir AS warga__tanggal_lahir,
            w.kategori AS warga__kategori
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        where (
              w.nama LIKE CONCAT('%', ${query.q}, '%')
              OR w.nik LIKE CONCAT('%', ${query.q}, '%')
              )
            AND pp.tipe_kunjungan = ${query.tipe}
        ORDER BY pp.tanggal_survey
        limit ${query.take} offset ${offset};`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
        select COUNT(*) as total
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        where (
              w.nama LIKE CONCAT('%', ${query.q}, '%')
              OR w.nik LIKE CONCAT('%', ${query.q}, '%')
              )
            AND pp.tipe_kunjungan = ${query.tipe}
      `;
    } else if (!query.q && query.tipe) {
      data = await prisma.$queryRaw<GetAllPeriksaPraSekolahRow[]>`
        select
            pp.id,
            pp.warga_id,
            pp.tanggal_survey,
            pp.periode_survey,
            pp.tipe_kunjungan,
            pp.berat_badan,
            pp.tinggi_badan,
            pp.lika,
            pp.lingkar_perut,
            pp.nilai_imt,
            pp.keterangan_imt,
            w.id AS warga__id,
            w.nik AS warga__nik,
            w.nama AS warga__nama,
            w.jenis_kelamin AS warga__jenis_kelamin,
            w.tanggal_lahir AS warga__tanggal_lahir,
            w.kategori AS warga__kategori
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        where
            pp.tipe_kunjungan = ${query.tipe}
        ORDER BY pp.tanggal_survey
        limit ${query.take} offset ${offset};`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
        select COUNT(*) as total
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        where
            pp.tipe_kunjungan = ${query.tipe}
      `;
    } else if (query.q && !query.tipe) {
      data = await prisma.$queryRaw<GetAllPeriksaPraSekolahRow[]>`
        select
            pp.id,
            pp.warga_id,
            pp.tanggal_survey,
            pp.periode_survey,
            pp.tipe_kunjungan,
            pp.berat_badan,
            pp.tinggi_badan,
            pp.lika,
            pp.lingkar_perut,
            pp.nilai_imt,
            pp.keterangan_imt,
            w.id AS warga__id,
            w.nik AS warga__nik,
            w.nama AS warga__nama,
            w.jenis_kelamin AS warga__jenis_kelamin,
            w.tanggal_lahir AS warga__tanggal_lahir,
            w.kategori AS warga__kategori
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        where
            w.nama LIKE CONCAT('%', ${query.q}, '%')
            OR w.nik LIKE CONCAT('%', ${query.q}, '%')
        ORDER BY pp.tanggal_survey
        limit ${query.take} offset ${offset};`;

      total_raw = await prisma.$queryRaw<GetAllTotal[]>`
        select COUNT(*) as total
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        where
            w.nama LIKE CONCAT('%', ${query.q}, '%')
            OR w.nik LIKE CONCAT('%', ${query.q}, '%')
      `;
    } else if (!query.q && !query.tipe) {
      data = await prisma.$queryRaw<GetAllPeriksaPraSekolahRow[]>`
        select
            pp.id,
            pp.warga_id,
            pp.tanggal_survey,
            pp.periode_survey,
            pp.tipe_kunjungan,
            pp.berat_badan,
            pp.tinggi_badan,
            pp.lika,
            pp.lingkar_perut,
            pp.nilai_imt,
            pp.keterangan_imt,
            w.id AS warga__id,
            w.nik AS warga__nik,
            w.nama AS warga__nama,
            w.jenis_kelamin AS warga__jenis_kelamin,
            w.tanggal_lahir AS warga__tanggal_lahir,
            w.kategori AS warga__kategori
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id
        ORDER BY pp.tanggal_survey
        limit ${query.take} offset ${offset};`;
    }
    total_raw = await prisma.$queryRaw<GetAllTotal[]>`
        select COUNT(*) as total
        from
            periksa_pra_sekolah as pp
            inner join warga as w on w.id = pp.warga_id;
    `;
    const total = Number(total_raw[0]?.total) ?? 0;
    if (data.length === 0) {
      throw new HttpException(
        "Data Anak Pra sekolah masih kosong",
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: data,
      page: query.page,
      take: query.take,
      total: total,
    };
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
