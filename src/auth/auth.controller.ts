import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import type { Response } from "express";
import { CookiesChecker } from "../common/auth-guard.js";
import { jsonCreated, jsonOK } from "../lib/response.js";
import {
  AuthResponse,
  ChangeNameSchema,
  ChangePasswordSchema,
  // DeleteAccountSchema,
  LoginSchema,
  MeResponse,
  RegisterSchema,
  type ChangeNameRequest,
  type ChangePasswordRequest,
  type LoginRequest,
  type RegisterRequest,
} from "./auth.model.js";
import { AuthService } from "./auth.service.js";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/auth")
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body() request: RegisterRequest,
  ): Promise<{ data: AuthResponse }> {
    const result = await this.authService.create(request);
    return jsonCreated(result);
  }

  @Post("/auth/login")
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: AuthResponse }> {
    const result = await this.authService.login(request, res);
    return jsonOK(result);
  }

  @Get("/auth")
  @UseGuards(CookiesChecker)
  async getuser(): Promise<{ data: AuthResponse[] }> {
    const result = await this.authService.getAllUser();
    return jsonOK(result);
  }

  @Get("/auth/me")
  @UseGuards(CookiesChecker)
  async me(@Req() req: any): Promise<{ data: MeResponse }> {
    const result = req.user as MeResponse;
    return jsonOK(result);
  }

  @Patch("/auth/name")
  @UseGuards(CookiesChecker)
  @UsePipes(new ZodValidationPipe(ChangeNameSchema))
  async changeName(
    @Body() body: ChangeNameRequest,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: string }> {
    const user = req.user as MeResponse;
    if (!body) {
      throw new HttpException("fullname required!", HttpStatus.BAD_REQUEST);
    }
    await this.authService.changeName(user.id, body, res);
    return jsonOK("Name changed successfully");
  }

  @Patch("/auth/current")
  @UseGuards(CookiesChecker)
  @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
  async changePassword(
    @Body() body: ChangePasswordRequest,
    @Req() req: any,
  ): Promise<{ data: string }> {
    const user = req.user as MeResponse;
    await this.authService.changePassword(user.username, body);
    return jsonOK("Password changed successfully");
  }

  @Delete("/auth/current")
  @UseGuards(CookiesChecker)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: string }> {
    const user = req.user as MeResponse;
    await this.authService.logout(user.username, res);
    return jsonOK("Cookies cleared successfully");
  }

  // @Delete("/auth/delete_account")
  // @UseGuards(CookiesChecker)
  // @UsePipes(new ZodValidationPipe(DeleteAccountSchema))
  // async deleteAccount(
  //   @Req() req: any,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<{ data: string }> {
  //   const user = req.user as MeResponse;
  //   await this.authService.deleteAccount(user.email, res);
  //   return jsonOK("Account deleted successfully");
  // }
}
