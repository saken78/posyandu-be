import { Injectable } from "@nestjs/common";
import { prisma } from "../lib/prisma.js";

@Injectable()
export class WargaService {
  constructor() {}

  async getByNIK(nik: string) {
    const data = await prisma.warga.findUnique({
      where: {
        nik: nik,
      },
    });
    return data;
  }
}
