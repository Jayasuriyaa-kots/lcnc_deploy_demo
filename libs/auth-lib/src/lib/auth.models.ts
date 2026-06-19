export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  organisationId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  orgId?: string;
  scope?: string;
  scopes?: string[];
  exp: number;
  iat?: number;
}
