import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CommonModule } from "../common/common.module.js";
import { BalitaController } from "./balita.controller.js";
import { BalitaService } from "./balita.service.js";

@Module({
  imports: [JwtModule.register({}), CommonModule],
  controllers: [BalitaController],
  providers: [BalitaService],
})
export class BalitaModule {}
