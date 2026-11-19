import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CommonModule } from "../common/common.module.js";
import { PraSekolahController } from "./pra_sekolah.controller.js";
import { PraSekolahService } from "./pra_sekolah.service.js";

@Module({
  imports: [JwtModule.register({}), CommonModule],
  controllers: [PraSekolahController],
  providers: [PraSekolahService],
})
export class PraSekolahModule {}
