import z from "zod";

export const CreatePeriksaPraSekolahSchema = z.object({
  tanggal_survey: z.coerce.date(),
  periode_survey: z.string(),
  tipe_kunjungan: z.enum(["Datang_Langsung", "Kunjungan_Rumah"]),
  berat_badan: z.coerce.number().positive().finite(),
  tinggi_badan: z.coerce.number().positive().finite(),
  lika: z.coerce.number().optional(),
  lingkar_perut: z.coerce.number().optional(),
});

export type CreatePeriksaPraSekolahRequest = z.infer<
  typeof CreatePeriksaPraSekolahSchema
>;
