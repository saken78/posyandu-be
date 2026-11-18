import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CommonModule } from "../common/common.module.js";
import { WargaController } from "./warga.controller.js";
import { WargaService } from "./warga.service.js";

@Module({
  imports: [JwtModule.register({}), CommonModule],
  controllers: [WargaController],
  providers: [WargaService],
})
export class WargaModule {}
