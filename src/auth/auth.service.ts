import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import type { Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { prisma } from "../lib/prisma.js";
import { SECRET } from "../lib/secret.js";
import {
  AuthResponse,
  // ChangeNameRequest,
  // ChangePasswordRequest,
  type LoginRequest,
  type RegisterRequest,
} from "./auth.model.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
  ) {}

  async create(request: RegisterRequest): Promise<AuthResponse> {
    this.logger.info("AuthService-create: executed ...");
    const exist = await prisma.users.findUnique({
      where: {
        username: request.email,
      },
    });

    if (exist) {
      throw new HttpException("Email already exist", HttpStatus.CONFLICT);
    }

    const pw_hash = await argon2.hash(request.password, {
      memoryCost: 65536,
      timeCost: 3,
    });

    const data = await prisma.users.create({
      data: {
        username: request.email,
        password: pw_hash,
        fullname: request.fullname || null,
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        created_at: true,
      },
    });

    this.logger.info("AuthService-create: executed successfully");
    return data;
  }

  async login(
    request: LoginRequest,
    response: Response,
  ): Promise<AuthResponse> {
    this.logger.info("AuthService-login: executed ...");
    const user = await prisma.users.findUnique({
      where: {
        username: request.email,
      },
    });

    if (!user) {
      throw new HttpException(
        "User with this email not found",
        HttpStatus.NOT_FOUND,
      );
    }

    const match = await argon2.verify(user.password, request.password);
    if (!match) {
      throw new HttpException(
        "Email or password is wrong",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const access_token_payload = {
      sub: user.id,
      email: user.username,
      fullname: user.fullname,
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
      iat: Math.floor(Date.now() / 1000),
    };

    const refresh_token_payload = {
      sub: user.id,
      email: user.username,
      fullname: user.fullname,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };

    const access_token = await this.jwt.signAsync(access_token_payload, {
      secret: SECRET,
      algorithm: "HS256",
    });

    const refresh_token = await this.jwt.signAsync(refresh_token_payload, {
      secret: SECRET,
      algorithm: "HS256",
    });

    response.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      signed: true,
      maxAge: 60 * 15 * 1000,
    });

    response.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      signed: true,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token_hash = await argon2.hash(refresh_token, {
      memoryCost: 65536,
      timeCost: 3,
    });

    await prisma.$executeRaw`update users set rt_hash = ${token_hash}, expires_at = ${expires_at} where id = ${user.id}`;

    this.logger.info("AuthService-login: executed successfully");

    return {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      created_at: user.created_at,
    };
  }

  async getAllUser(): Promise<AuthResponse[]> {
    this.logger.info("AuthService-getAllUser: executed ...");
    const data = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
        created_at: true,
      },
    });

    this.logger.info("AuthService-getAllUser: executed successfully");
    return data;
  }
  //
  // async changeName(email: string, request: ChangeNameRequest): Promise<void> {
  //   this.logger.info("AuthService-changeName: executed ...");
  //   await prisma.users.update({
  //     where: {
  //       email: email,
  //     },
  //     data: {
  //       ...(request.first_name !== undefined && {
  //         first_name: request.first_name,
  //       }),
  //       ...(request.last_name !== undefined && {
  //         last_name: request.last_name,
  //       }),
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       role: true,
  //       is_active: true,
  //       first_name: true,
  //       last_name: true,
  //     },
  //   });
  //
  //   this.logger.info("AuthService-changeName: executed successfully");
  // }
  //
  // async changePassword(
  //   email: string,
  //   request: ChangePasswordRequest,
  // ): Promise<void> {
  //   this.logger.info("AuthService-changePassword: executed ...");
  //
  //   const user = await prisma.users.findUnique({
  //     where: {
  //       email: email,
  //     },
  //     select: {
  //       password_hash: true,
  //     },
  //   });
  //
  //   if (!user) {
  //     throw new HttpException("User not found", HttpStatus.NOT_FOUND);
  //   }
  //
  //   const oldMatch = await argon2.verify(
  //     user.password_hash,
  //     request.password_old,
  //   );
  //
  //   if (!oldMatch) {
  //     throw new HttpException("Old password is wrong", HttpStatus.UNAUTHORIZED);
  //   }
  //
  //   const newMatch = await argon2.verify(user.password_hash, request.password);
  //
  //   if (newMatch) {
  //     throw new HttpException("Password same as old", HttpStatus.BAD_REQUEST);
  //   }
  //
  //   const npw = await argon2.hash(request.password, {
  //     memoryCost: 65536,
  //     timeCost: 3,
  //   });
  //
  //   await prisma.users.update({
  //     where: {
  //       email: email,
  //     },
  //     data: {
  //       password_hash: npw,
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       role: true,
  //       is_active: true,
  //       first_name: true,
  //       last_name: true,
  //     },
  //   });
  //
  //   this.logger.info("AuthService-changePassword: executed successfully");
  // }
  //
  // async logout(email: string, res: Response): Promise<string> {
  //   this.logger.info("AuthService-logout: executed ...");
  //   const data = await prisma.users.findUnique({
  //     where: {
  //       email: email,
  //     },
  //   });
  //
  //   if (!data) {
  //     throw new HttpException(
  //       "Cookies already cleared",
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  //
  //   res.clearCookie("access_token");
  //   res.clearCookie("refresh_token");
  //   this.logger.info("AuthService-logout: executed successfully");
  //   return "Cookies cleared successfully";
  // }
  //
  // async deleteAccount(email: string, res: Response): Promise<void> {
  //   const account = await prisma.users.findUnique({
  //     where: {
  //       email: email,
  //     },
  //   });
  //   if (!account) {
  //     throw new HttpException("Account not found", HttpStatus.NOT_FOUND);
  //   }
  //
  //   await prisma.users.delete({
  //     where: {
  //       email: email,
  //     },
  //   });
  //
  //   res.clearCookie("access_token");
  //   res.clearCookie("refresh_token");
  // }
}
