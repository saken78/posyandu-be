import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CookiesChecker } from "../common/auth-guard.js";
import { WargaService } from "./warga.service.js";

@Controller()
export class WargaController {
  constructor(private readonly wargaService: WargaService) {}

  @Get("/warga/:nik")
  @UseGuards(CookiesChecker)
  async getByNIK(@Param("nik") nik: string) {
    const result = await this.wargaService.getByNIK(nik);
    return result;
  }
}
