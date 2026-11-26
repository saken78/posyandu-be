import { Module } from "@nestjs/common";
import { DewasaController } from "./dewasa.controller.js";
import { DewasaService } from "./dewasa.service.js";
import { JwtModule } from "@nestjs/jwt";
import { CommonModule } from "../common/common.module.js";

@Module({
  imports: [JwtModule.register({}), CommonModule],
  controllers: [DewasaController],
  providers: [DewasaService],
})
export class DewasaModule {}
