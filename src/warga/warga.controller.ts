import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "../auth/zod-validation.pipe.js";
import { CookiesChecker } from "../common/auth-guard.js";
import { jsonCreated, jsonOK } from "../lib/response.js";
import {
  CreateWargaSchema,
  WargaResponse,
  type CreateWargaRequest,
} from "./warga.model.js";
import { WargaService } from "./warga.service.js";

@Controller()
export class WargaController {
  constructor(private readonly wargaService: WargaService) {}

  @Post("/warga")
  // @UseGuards(CookiesChecker)
  @UsePipes(new ZodValidationPipe(CreateWargaSchema))
  async addWarga(
    @Body() request: CreateWargaRequest,
  ): Promise<{ data: WargaResponse }> {
    const result = await this.wargaService.create(request);
    return jsonCreated(result);
  }

  @Get("/warga/:nik")
  @UseGuards(CookiesChecker)
  async getByNIK(@Param("nik") nik: string): Promise<{ data: WargaResponse }> {
    const result = await this.wargaService.getByNIK(nik);
    return jsonOK(result);
  }
}
