import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TokenController } from "./token.controller.js";
import { TokenService } from "./token.service.js";

@Module({
  imports: [JwtModule.register({})],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
