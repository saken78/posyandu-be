import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "../auth/zod-validation.pipe.js";
import { CookiesChecker } from "../common/auth-guard.js";
import { jsonList, jsonOk } from "../lib/response.js";
import {
  CreatePeriksaDewasaSchema,
  SearchPeriksaDewasaSchema,
  type CreatePeriksaDewasaRequest,
  type SearchPeriksaDewasaQuery,
} from "./dewasa.model.js";
import { DewasaService } from "./dewasa.service.js";

@Controller()
export class DewasaController {
  constructor(private readonly dewasaService: DewasaService) {}

  @Post("/dewasa/:nik/screening")
  @UseGuards(CookiesChecker)
  async createScreening(
    @Param("nik") nik: string,
    @Body(new ZodValidationPipe(CreatePeriksaDewasaSchema))
    request: CreatePeriksaDewasaRequest,
  ) {
    const result = await this.dewasaService.createScreening(nik, request);
    return jsonOk(result);
  }

  @Get("/dewasa")
  @UseGuards(CookiesChecker)
  async getAll(
    @Query(new ZodValidationPipe(SearchPeriksaDewasaSchema))
    query: SearchPeriksaDewasaQuery,
  ) {
    const result = await this.dewasaService.getAll(query);
    return jsonList(result);
  }
}
