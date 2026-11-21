export type JWTPayload = {
  sub: string;
  email: string;
  fullname: string;
  exp: number;
  iat: number;
};
