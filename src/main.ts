import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { env } from "./lib/env.js";
import cookieParser from "cookie-parser";
import { SECRET } from "./lib/secret.js";
import { ConsoleLogger } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.setGlobalPrefix("/v1/api");
  app.use(cookieParser(SECRET));
  app.enableCors({ credentials: true });
  await app.listen(env.PORT);
}
bootstrap();
