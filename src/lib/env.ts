import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is required`);
  return value;
}

export const env = {
  PORT: Number(process.env["PORT"] ?? 3000),
  DATABASE_URL: required("DATABASE_URL"),
  DATABASE_HOST: required("DATABASE_HOST"),
  DATABASE_PORT: Number(required("DATABASE_PORT")),
  DATABASE_USER: required("DATABASE_USER"),
  DATABASE_PASSWORD: required("DATABASE_PASSWORD"),
  DATABASE_NAME: required("DATABASE_NAME"),
  SECRET: required("SECRET"),
} as const;
