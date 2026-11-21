import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Res,
  SignedCookies,
} from "@nestjs/common";
import { TokenService } from "./token.service.js";
import type { Response } from "express";
import { jsonOk } from "../lib/response.js";

@Controller()
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get("/token")
  async refresh(
    @SignedCookies("refresh_token") cookies: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!cookies) {
      throw new HttpException(
        "Refresh Token undefined",
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.tokenService.refresh(cookies, res);
    return jsonOk("Token generated successfully");
  }
}
