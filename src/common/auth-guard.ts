import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SECRET } from "../lib/secret.js";

@Injectable()
export class CookiesChecker implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const access_token = req?.signedCookies?.access_token;

    const secret = SECRET;

    if (!secret) {
      throw new HttpException("Secret not found", HttpStatus.NOT_FOUND);
    }

    if (!access_token) {
      throw new HttpException("CookiesChecker: access token not found", 401);
    }

    // verify token and get JWT payload
    const user = await this.jwtService.verify(access_token, {
      secret: SECRET,
    });

    if (!user) {
      throw new HttpException("AdminGuard: Forbidden user", 403);
    }

    req.user = {
      id: user.sub,
      email: user.email,
      fullname: user.fullname,
    };

    return true;
  }
}
