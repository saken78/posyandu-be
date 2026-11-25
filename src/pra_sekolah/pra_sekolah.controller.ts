import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "../auth/zod-validation.pipe.js";
import { CookiesChecker } from "../common/auth-guard.js";
import {
  CreatePeriksaPraSekolahSchema,
  SearchPeriksaPraSekolahSchema,
  type CreatePeriksaPraSekolahRequest,
  type PraSekolahResponse,
  type SearchPeriksaPraSekolahRequest,
} from "./pra_sekolah.model.js";
import { PraSekolahService } from "./pra_sekolah.service.js";
import { jsonList, jsonOk } from "../lib/response.js";

@Controller()
export class PraSekolahController {
  constructor(private readonly prasekolahService: PraSekolahService) {}

  @Get("/prasekolah")
  @UseGuards(CookiesChecker)
  async getAll(
    @Query(new ZodValidationPipe(SearchPeriksaPraSekolahSchema))
    query: SearchPeriksaPraSekolahRequest,
  ): Promise<{ data: PraSekolahResponse[] }> {
    const result = await this.prasekolahService.getAll(query);
    return jsonList(result);
  }

  @Get("/prasekolah/:nik")
  @UseGuards(CookiesChecker)
  async getByNIK(@Param("nik") nik: string) {
    const result = await this.prasekolahService.getByNIK(nik);
    return jsonOk(result);
  }

  @Post("/prasekolah/:nik/screening")
  @UseGuards(CookiesChecker)
  async createScreening(
    @Param("nik") nik: string,
    @Body(new ZodValidationPipe(CreatePeriksaPraSekolahSchema))
    request: CreatePeriksaPraSekolahRequest,
  ) {
    const result = await this.prasekolahService.createScreening(nik, request);
    return jsonOk(result);
  }

  @Delete("/prasekolah/screening/:id")
  @UseGuards(CookiesChecker)
  async deleteScreening(@Param("id") id: string) {
    const result = await this.prasekolahService.deleteScreening(id);
    return jsonOk(result);
  }
}
