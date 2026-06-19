export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organisationId?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
