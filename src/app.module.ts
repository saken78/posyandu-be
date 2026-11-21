import {
  Module,
  RequestMethod,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module.js";
import { CommonModule } from "./common/common.module.js";
import { LogMiddleware } from "./common/log/log.middleware.js";
import { WargaModule } from "./warga/warga.module.js";
import { BalitaModule } from "./balita/balita.module.js";
import { PraSekolahModule } from "./pra_sekolah/pra_sekolah.module.js";
import { TokenModule } from "./token/token.module.js";

@Module({
  imports: [
    AuthModule,
    JwtModule.register({}),
    CommonModule,
    WargaModule,
    BalitaModule,
    PraSekolahModule,
    TokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LogMiddleware).forRoutes({
      path: "/api/*path",
      method: RequestMethod.ALL,
    });
  }
}
