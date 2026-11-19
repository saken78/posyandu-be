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
import { jsonCreated, jsonList, jsonOk } from "../lib/response.js";
import {
  CreatePeriksaBalitaSchema,
  SearchPeriksaBalitaSchema,
  type CreatePeriksaBalitaRequest,
  type SearchPeriksaBalitaQuery,
} from "./balita.model.js";
import { BalitaService } from "./balita.service.js";

@Controller()
export class BalitaController {
  constructor(private readonly balitaService: BalitaService) {}

  @Get("/balita")
  @UseGuards(CookiesChecker)
  async getAll(
    @Query(new ZodValidationPipe(SearchPeriksaBalitaSchema))
    query: SearchPeriksaBalitaQuery,
  ) {
    const result = await this.balitaService.getAll(query);
    return jsonList(result);
  }

  @Get("/balita/:nik")
  @UseGuards(CookiesChecker)
  async getByNIK(@Param("nik") nik: string) {
    const result = await this.balitaService.getByNIK(nik);
    return jsonOk(result);
  }

  @Post("/balita/:nik/screening")
  @UseGuards(CookiesChecker)
  async createScreening(
    @Param("nik") nik: string,
    @Body(new ZodValidationPipe(CreatePeriksaBalitaSchema))
    request: CreatePeriksaBalitaRequest,
  ) {
    const result = await this.balitaService.createScreening(nik, request);
    return jsonCreated(result);
  }

  @Delete("/balita/screening/:id")
  @UseGuards(CookiesChecker)
  async deleteScreening(@Param("id") id: string) {
    const result = await this.balitaService.deleteScreening(id);
    return jsonOk(result);
  }
}
