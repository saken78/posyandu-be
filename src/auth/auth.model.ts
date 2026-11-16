import z from "zod";

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullname: z.string().min(3),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const ChangeNameSchema = z.object({
  fullname: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  password_old: z.string().min(8),
  password: z.string().min(8),
});

export const DeleteAccountSchema = z.object({
  email: z.email(),
});

export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type ChangeNameRequest = z.infer<typeof ChangeNameSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type DeleteAccountRequest = z.infer<typeof DeleteAccountSchema>;

export class AuthResponse {
  id!: string;
  username!: string;
  created_at?: Date | null;
  fullname?: string | null;
}

export class MeResponse {
  id!: string;
  username!: string;
  fullanme?: string | null;
}
