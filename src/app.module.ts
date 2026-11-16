import {
  Module,
  RequestMethod,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { LogMiddleware } from "./common/log/log.middleware.js";
import { JwtModule } from "@nestjs/jwt";
import { CommonModule } from "./common/common.module.js";

@Module({
  imports: [AuthModule, JwtModule.register({}), CommonModule],
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
