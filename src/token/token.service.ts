import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SECRET } from "../lib/secret.js";
import { prisma } from "../lib/prisma.js";
import type { JWTPayload } from "./token.model.js";
import * as argon2 from "argon2";
import type { Response } from "express";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async refresh(rt: string, response: Response) {
    const payload: JWTPayload = this.jwtService.verify(rt, {
      secret: SECRET,
    });

    if (!payload) {
      throw new HttpException(
        "Invalid or expired token",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await prisma.users.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new HttpException("User Not found", HttpStatus.NOT_FOUND);
    }

    if (user.expires_at && new Date() > user.expires_at) {
      throw new HttpException(
        "Refresh token has expired",
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.rt_hash) {
      throw new HttpException("User Not found", HttpStatus.NOT_FOUND);
    }

    const valid = await argon2.verify(user.rt_hash, rt);

    if (!valid) {
      throw new HttpException("Refresh token Invalid", HttpStatus.UNAUTHORIZED);
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

    const access_token = await this.jwtService.signAsync(access_token_payload, {
      secret: SECRET,
      algorithm: "HS256",
    });

    const refresh_token = await this.jwtService.signAsync(
      refresh_token_payload,
      {
        secret: SECRET,
        algorithm: "HS256",
      },
    );

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
  }
}
